#!/usr/bin/env python
"""
Run the bureau-feature SQL chain in DuckDB and emit dpd_data.csv + tl_features.csv.

Pipeline (dependency order), all sourced from ../sql/*.sql, transpiled on the fly:

    seed (this script)        -> sandbox.PP_HS_BASE_1   (crn, reference_date, is_cv)
    CA_BU_FEATs.sql           -> TL_1..TL_4   (join ebix tradelines, dpd_processed)
    CA2_BU_FEATs.sql          -> TL_5, TL_6
    CA3_BU_FEATs.sql          -> TL_7..TL_9   (segment flags, payment counts)
    CA4_BU_FEATs.sql          -> TL_10 (payhist explode), TL_11..TL_13 (features)
    CB_BU_INQ_Feats.sql       -> enquiry feats + TL_14 (final bureau feature row)
    CD_BU_MAX_DPD_FEATs.sql   -> MAXDPD_TL_1  (per-tradeline max_dpd)  => dpd_data

Only external dependencies (paths passed in):
    * ebix tradelines  -> registered as view `ebix_cibil_data_tl`
    * ebix inquiries   -> registered as view `ebix_cibil_data_iq`
    * external columns -> registered as view `ext_cols` (the 15 non-bureau fields)

Outputs (tab-separated, NULL for missing, matching the existing files):
    dpd_data.csv      (from MAXDPD_TL_1, dpd_data column subset)
    tl_features.csv   (TL_14 bureau features, renamed, + external columns)
"""
from __future__ import annotations

import argparse
import os
import sys

import duckdb

from transpile import split_statements, transpile

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_SQL_DIR = os.path.abspath(os.path.join(HERE, "..", "..", "sql"))
DEFAULT_OUT_DIR = os.path.abspath(os.path.join(HERE, ".."))      # Bureau_Agent/

# SQL files in dependency order (A_crns is replaced by the parametrised seed).
SQL_ORDER = [
    "CA_BU_FEATs.sql",
    "CA2_BU_FEATs.sql",
    "CA3_BU_FEATs.sql",
    "CA4_BU_FEATs.sql",
    "CB_BU_INQ_Feats.sql",
    "CD_BU_MAX_DPD_FEATs.sql",
]

# ---- output column layouts (must match the existing CSV headers exactly) ----
DPD_DATE_COLS = ["date_closed", "date_opened", "datereported_trades",
                 "pay_hist_end_date", "pay_hist_start_date", "last_payment_date"]
DPD_PLAIN_COLS = ["crn", "report_month", "creditlimit"] + DPD_DATE_COLS[:3] \
    + ["dpd_string", "pay_hist_end_date", "pay_hist_start_date", "sanction_amount",
       "out_standing_balance", "over_due_amount", "emi", "high_credit_amount",
       "tu_score", "last_payment_date", "loan_type_new", "loan_status",
       "loan_classification", "ownership_type", "sector"]

# Final dpd_data.csv header order
DPD_HEADER = (["crn", "report_month", "creditlimit", "date_closed", "date_opened",
               "datereported_trades", "dpd_string", "pay_hist_end_date",
               "pay_hist_start_date", "sanction_amount", "out_standing_balance",
               "over_due_amount", "emi", "high_credit_amount", "tu_score",
               "last_payment_date", "loan_type_new", "loan_status",
               "loan_classification", "ownership_type", "sector"]
              + [f"payhist_{i}" for i in range(1, 37)]
              + [f"dt{i}" for i in range(1, 37)]
              + ["max_dpd", "max_dpd_date", "months_since_max_dpd"])

# tl_features.csv: (output_name, sql_expression_from_TL_14)
TL_BUREAU = [
    ("crn", "crn"),
    ("monsnclasttrop_pl_onc", "monsnclasttrop_pl_onc"),
    ("monsnclasttrop_uns_onc", "monsnclasttrop_uns_onc"),
    ("no_tr_open_l6m_pl_onc", "no_tr_open_l6m_pl_onc"),
    ("no_trades_all_onc", "no_trades_all_onc"),
    ("max_dpd_l6m_cc_onc", "max_dpd_l6m_cc_onc"),
    ("max_dpd_l6m_pl_onc", "max_dpd_l6m_pl_onc"),
    ("max_dpd_l9m_cc_onc", "max_dpd_l9m_cc_onc"),
    ("mon_sin_last_0p_uns_op", "mon_sin_last_0p_uns_op"),
    ("monsinlast_0p_pl_onc", "monsinlast_0p_pl_onc"),
    ("pct_0p_l24m_all_onc", "pct_0p_l24m_all_onc"),
    ("pct_0p_l24m_pl_onc", "pct_0p_l24m_pl_onc"),
    ("pct_missed_pymt_last18m_all", "pct_missed_pymt_last18m_all"),
    ("pct_tr_0p_l12m_all_onc", "pct_tr_0p_l12m_all_onc"),
    ("uns_enq_l12m", "enq_unsec_12m"),                      # renamed in CB
    ("ratio_good_closed_loans_pl",
     "round(cnt_good_closed_pl::double / nullif(cnt_closed_pl, 0), 4)"),  # derived
    ("pct_bal_cc_lv", "pct_bal_cc_lv"),
    ("pct_bal_pl_lv", "pct_bal_pl_lv"),
    ("tr_to_enq_ratio_uns_l24m", "tr_to_enq_ratio_uns_l24m"),
    ("interpurchase_time_l12m_cl", "interpurchase_time_l12m_cl"),
    ("interpurchase_time_l12m_plbl", "interpurchase_time_l12m_plbl"),
    ("interpurchase_time_l24m_all", "interpurchase_time_l24m_all"),
    ("interpurchase_time_l24m_hl_lap", "interpurchase_time_l24m_hl_lap"),
    ("interpurchase_time_l24m_twl", "interpurchase_time_l24m_twl"),
    ("interpurchase_time_l6m_plbl", "interpurchase_time_l6m_plbl"),
    ("interpurchase_time_l9m_hl_lap", "interpurchase_time_l9m_hl_lap"),
]
# The 15 non-bureau columns supplied from the external file (joined on crn).
TL_EXTERNAL = ["ktk_rel", "customer_segment_1_ordered", "bank_grp", "bu_grp",
               "income_source_new", "node", "aff_emi", "unsecured_emi",
               "affluence_amt_6", "foir", "foir_unsec", "agr_date", "agr_value",
               "min_loan_amt", "max_loan_amt"]


def _reader(path: str) -> str:
    """Return a DuckDB scan expression for a CSV or Parquet file."""
    low = path.lower()
    if low.endswith(".parquet") or low.endswith(".pq"):
        return f"read_parquet('{path}')"
    return f"read_csv_auto('{path}', nullstr='NULL', sample_size=-1)"


def run(con: duckdb.DuckDBPyConnection, args) -> None:
    con.execute("CREATE SCHEMA IF NOT EXISTS sandbox;")

    # ebix + external inputs as views (assumed columns match the SQL references)
    con.execute(f"CREATE OR REPLACE VIEW ebix_cibil_data_tl AS SELECT * FROM {_reader(args.ebix_tl)};")
    con.execute(f"CREATE OR REPLACE VIEW ebix_cibil_data_iq AS SELECT * FROM {_reader(args.ebix_iq)};")
    con.execute(f"CREATE OR REPLACE VIEW ext_cols AS SELECT * FROM {_reader(args.external)};")

    # parametrised seed (replaces A_crns.sql)
    con.execute("DROP TABLE IF EXISTS sandbox.PP_HS_BASE_1;")
    con.execute(
        "CREATE TABLE sandbox.PP_HS_BASE_1 AS "
        f"SELECT {int(args.crn)}::BIGINT AS crn, DATE '{args.reference_date}' AS reference_date, "
        f"{int(args.is_cv)} AS is_cv;"
    )

    # run each transpiled SQL file, statement by statement
    for fname in SQL_ORDER:
        path = os.path.join(args.sql_dir, fname)
        with open(path) as fh:
            raw = fh.read()
        stmts = split_statements(transpile(raw))
        for i, stmt in enumerate(stmts):
            try:
                con.execute(stmt)
            except Exception as exc:
                sys.stderr.write(f"\n[FAIL] {fname} statement #{i + 1}\n{stmt[:500]}\n...\n{exc}\n")
                raise
        print(f"  ran {fname} ({len(stmts)} statements)")

    _write_dpd_data(con, args)
    _write_tl_features(con, args)


def _write_dpd_data(con, args) -> None:
    sel = []
    for c in DPD_HEADER:
        if c in DPD_DATE_COLS:
            sel.append(f"{c}::date AS {c}")
        elif c.startswith("dt") and c[2:].isdigit():
            sel.append(f"{c}::timestamp AS {c}")
        elif c == "max_dpd_date":
            sel.append(f"{c}::timestamp AS {c}")
        else:
            sel.append(c)
    query = f"SELECT {', '.join(sel)} FROM PP_HS_BASE_BU_MAXDPD_TL_1 ORDER BY date_opened"
    out = os.path.join(args.out_dir, "dpd_data.csv")
    con.execute(
        f"COPY ({query}) TO '{out}' "
        "(FORMAT CSV, DELIMITER '\t', HEADER, NULLSTR 'NULL', QUOTE '');"
    )
    n = con.execute(f"SELECT count(*) FROM ({query})").fetchone()[0]
    print(f"  wrote {out}  ({n} tradelines)")


def _write_tl_features(con, args) -> None:
    sel = [f"a.{expr} AS {name}" if expr == name or "(" not in expr and "." not in expr
           else f"{expr} AS {name}" if "(" in expr else f"a.{expr} AS {name}"
           for name, expr in TL_BUREAU]
    # build cleanly to avoid ambiguity: bureau cols from alias a, external from e
    sel = []
    for name, expr in TL_BUREAU:
        if "(" in expr:                       # derived expression -> qualify columns with a.
            expr_q = expr.replace("cnt_good_closed_pl", "a.cnt_good_closed_pl") \
                         .replace("cnt_closed_pl", "a.cnt_closed_pl")
            sel.append(f"{expr_q} AS {name}")
        else:
            sel.append(f"a.{expr} AS {name}")
    sel += [f"e.{c} AS {c}" for c in TL_EXTERNAL]
    query = (f"SELECT {', '.join(sel)} FROM sandbox.PP_HS_BASE_BU_TL_14 a "
             "LEFT JOIN ext_cols e ON a.crn = e.crn")
    out = os.path.join(args.out_dir, "tl_features.csv")
    con.execute(
        f"COPY ({query}) TO '{out}' "
        "(FORMAT CSV, DELIMITER '\t', HEADER, NULLSTR 'NULL', QUOTE '');"
    )
    print(f"  wrote {out}")


def main() -> None:
    data = os.path.join(HERE, "data")
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--ebix-tl", default=os.path.join(data, "ebix_cibil_data_tl.csv"))
    p.add_argument("--ebix-iq", default=os.path.join(data, "ebix_cibil_data_iq.csv"))
    p.add_argument("--external", default=os.path.join(data, "external_columns.csv"))
    p.add_argument("--crn", default="698167220")
    p.add_argument("--reference-date", default="2026-02-28")
    p.add_argument("--is-cv", default="1")
    p.add_argument("--sql-dir", default=DEFAULT_SQL_DIR)
    p.add_argument("--out-dir", default=DEFAULT_OUT_DIR)
    p.add_argument("--db", default=":memory:")
    args = p.parse_args()

    con = duckdb.connect(args.db)
    print(f"DuckDB {duckdb.__version__}  crn={args.crn}  ref={args.reference_date}")
    run(con, args)
    print("done.")


if __name__ == "__main__":
    main()
