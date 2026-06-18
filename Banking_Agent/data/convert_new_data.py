"""Convert new_data.csv (SOFI MOHD bank export) into the rgs.csv schema.

Source cols : Date, Description, Amount, Category, Balance
Target cols : cust_id, dr_cr_indctor, tran_date, prty_name, tran_amt_in_ac,
              tran_partclr, sal_flag, self_transfer, tran_type,
              category_of_txn, category_of_txn_l2
"""
import csv
import os
import re
import sys
from datetime import datetime

# Make the project package importable so we use the canonical category registry
# (L2 is the single source of truth; L1 = l1_of(L2)). See data/loader.py.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tools.category.registry import l1_of, l2_canonical  # noqa: E402

SRC = "new_data.csv"
OUT = "new_data_rgs.csv"

CUST_ID = "698167220"          # reuse existing rgs id (per user)
PRTY_NAME = "SOFI MOHD"        # account holder = customer name (constant)

# customer-name variants used to detect self transfers (own name as counterparty)
SELF_NAME_RE = re.compile(r"\b(sofi\s*mohd|mohd\s*sofi|mohammed\s*sofi)\b", re.I)

# Source spend category (from new_data.csv) -> canonical registry L2.
# L1 is derived from these via l1_of(), so the spend mix / category filter become
# meaningful (Food_Restaurants, Healthcare, Utility_Bills, ...).
CAT_TO_L2 = {
    "food": "Food",                        # -> Food_Restaurants
    "medical": "Pharmacy",                 # -> Healthcare
    "utilities": "Electricity_bill",       # -> Utility_Bills
    "fuel": "Fuel",                        # -> Auto_Services
    "loan": "EMI",                         # -> Finance
    "salary": "Salary",                    # -> Salary
    "credit card payment": "CC_bill",      # -> Credit_Card
    "insurance": "Insurance",              # -> Investment_Insurance
    "website charges": "Subscription",     # -> E_Lifestyle
    "cash deposit": "Cash_Deposit",        # -> Transfer
    "interest": "Bank_Fees_Charges",       # -> Finance
    "reversal": "P2P",                     # -> P2P
    "personal care": "Personal_Home_Services",  # -> Shopping_Lifestyle
    "logistics": "Courier_Logistics",      # -> Mobility
    "gaming": "Digital_Betting_Gaming",    # -> E_Lifestyle
    "clothing": "Fashion_Beauty",          # -> Shopping_Lifestyle
    "bank charges": "Bank_Fees_Charges",   # -> Finance
    "alcohol": "Liquor_Smoke",             # -> Shopping_Lifestyle
}

OUT_COLS = [
    "cust_id", "dr_cr_indctor", "tran_date", "prty_name", "tran_amt_in_ac",
    "tran_partclr", "sal_flag", "self_transfer", "tran_type",
    "category_of_txn", "category_of_txn_l2",
]


def to_iso_date(d):
    return datetime.strptime(d.strip(), "%d-%b-%y").strftime("%Y-%m-%d")


def clean_amount(a):
    val = abs(float(a.replace(",", "").strip()))
    return str(int(val)) if val == int(val) else str(val)


def tran_type_of(desc):
    head = desc.strip().upper()
    if head.startswith("UPI"):
        return "UPI"
    if head.startswith("ACH") or head.startswith("NACH"):
        return "NACH"
    return ""                  # NEFT / IMPS / REV / MB / other -> blank (rgs vocab)


def counterparty(category):
    # source Category looks like "Transfer to X" / "Transfer from X"
    return re.sub(r"^transfer\s+(to|from)\s+", "", category.strip(), flags=re.I)


def classify(desc, src_cat, is_credit):
    """Return (sal_flag, self_transfer, l2) where l2 is a canonical registry L2.

    L1 (category_of_txn) is derived from l2 by the caller via l1_of(), mirroring
    data/loader.py which always overwrites L1 from L2.
    """
    cat = src_cat.strip()
    party = counterparty(cat)

    # 1) Salary: TATA Consultancy credits (per user instruction)
    if is_credit and "TATA CONSULTANCY" in desc.upper():
        return "1", "0", "Salary"

    # 2) Self transfer: counterparty is the customer's own name
    if SELF_NAME_RE.search(party):
        return "", "1", "Self_Transfer"

    # 3) Loan / EMI auto-debits
    if cat.lower() == "loan" or re.search(r"\b(ACH|NACH|EMI)\b", desc.upper()):
        return "", "0", "EMI"

    # 4) P2P transfers (source "Transfer to/from <name>")
    if cat.lower().startswith("transfer"):
        return "", "0", "P2P"

    # 5) Named spend categories from source (Food, Medical, Fuel, Utilities, ...)
    #    mapped to a canonical registry L2; unknown -> P2P.
    return "", "0", CAT_TO_L2.get(cat.lower(), "P2P")


def main():
    rows_out = []
    with open(SRC, newline="") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for r in reader:
            amt_raw = r["Amount"].strip()
            is_credit = not amt_raw.startswith("-")
            desc = r["Description"].strip()
            sal_flag, self_t, l2 = classify(desc, r["Category"], is_credit)
            l1 = l1_of(l2_canonical(l2))  # derive L1 exactly as the loader does
            rows_out.append({
                "cust_id": CUST_ID,
                "dr_cr_indctor": "C" if is_credit else "D",
                "tran_date": to_iso_date(r["Date"]),
                "prty_name": PRTY_NAME,
                "tran_amt_in_ac": clean_amount(amt_raw),
                "tran_partclr": desc,
                "sal_flag": sal_flag,
                "self_transfer": self_t,
                "tran_type": tran_type_of(desc),
                "category_of_txn": l1,
                "category_of_txn_l2": l2,
            })

    with open(OUT, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=OUT_COLS, delimiter="\t",
                           lineterminator="\n")
        w.writeheader()
        w.writerows(rows_out)

    # quick summary
    print(f"wrote {len(rows_out)} rows -> {OUT}")
    from collections import Counter
    for col in ("dr_cr_indctor", "sal_flag", "self_transfer", "tran_type",
                "category_of_txn", "category_of_txn_l2"):
        c = Counter(r[col] or "<blank>" for r in rows_out)
        print(f"  {col:18} {dict(c)}")


if __name__ == "__main__":
    main()
