"""Append a `merchant` column to new_data_rgs.csv by parsing each tran_partclr.

Extraction is format-driven (UPI / NEFT / IMPS / ACH / TPT / etc.). The merchant
is the counterparty/payee/remitter entity; bank-internal lines (interest, fees,
cash deposit, card bill) get a descriptive label.
"""
import csv
import re

PATH = "new_data_rgs.csv"
PARTCLR_COL = "tran_partclr"


def clean(s):
    return re.sub(r"\s+", " ", s).strip()


def strip_ref(d):
    return re.sub(r"\s*\(Ref#.*?\)\s*$", "", d).strip()


def extract_merchant(desc):
    d = strip_ref(desc)
    u = d.upper()

    # REV-UPI-<acct>-<handle>@bank-...  (refund/reversal to own handle)
    if u.startswith("REV-UPI"):
        m = re.search(r"-([A-Za-z0-9.]+)@", d)
        return clean(m.group(1)) if m else "Reversal"

    # UPI-<NAME>-<vpa/qr>@bank-<ifsc>-<ref>-<purpose>
    if u.startswith("UPI-"):
        return clean(d[4:].split("-")[0])

    # NEFT CR/DR-<IFSC>-<NAME>-<beneficiary>-<ref>
    if u.startswith("NEFT"):
        parts = d.split("-")
        return clean(parts[2]) if len(parts) >= 3 else clean(d)

    # IMPS-<ref>-<NAME>-<bank>-...
    if u.startswith("IMPS"):
        parts = d.split("-")
        return clean(parts[2]) if len(parts) >= 3 else clean(d)

    # ACH D-<MERCHANT>-<code>  (loan / EMI auto-debit; may carry "TP ACH " noise)
    if u.startswith("ACH"):
        body = re.sub(r"^ACH\s+[DC]-", "", d, flags=re.I)
        body = body.split("-")[0]
        body = re.sub(r"^\s*TP\s+ACH\s+", "", body, flags=re.I)
        return clean(body)

    # EMI <loan-no> CHQ ...  (no named entity)
    if u.startswith("EMI"):
        return "Loan EMI"

    # <acct>-TPT-<purpose>-<NAME>  (third-party transfer)
    if "-TPT-" in u:
        return clean(d.split("-")[-1])

    # <code>/LIC OF INDIA  (biller after the slash)
    if "/" in d and not u.startswith(("UPI", "NEFT", "IMPS")):
        return clean(d.split("/", 1)[1])

    # bank-internal / non-merchant lines
    if u.startswith("FUND TRF CC"):
        return "Credit Card"
    if u.startswith("IB BILLPAY"):
        return "Credit Card Bill"
    if u.startswith("CASH DEPOSIT"):
        return "Cash Deposit"
    if u.startswith("INTEREST"):
        return "Bank Interest"
    if u.startswith("CARD"):
        return "Bank Charges"

    return clean(d.split("-")[0])  # fallback: leading token


def main():
    with open(PATH, newline="") as f:
        reader = csv.DictReader(f, delimiter="\t")
        fields = reader.fieldnames[:]
        rows = list(reader)

    if "merchant" not in fields:
        fields.append("merchant")

    for r in rows:
        r["merchant"] = extract_merchant(r[PARTCLR_COL])

    with open(PATH, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, delimiter="\t",
                           lineterminator="\n")
        w.writeheader()
        w.writerows(rows)

    print(f"added merchant to {len(rows)} rows")
    from collections import Counter
    c = Counter(r["merchant"] for r in rows)
    print(f"distinct merchants: {len(c)}")
    print("top 15:")
    for name, n in c.most_common(15):
        print(f"  {n:4}  {name}")
    empties = [r for r in rows if not r["merchant"]]
    print(f"empty merchants: {len(empties)}")


if __name__ == "__main__":
    main()
