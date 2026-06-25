"""
Snowflake/Redshift -> DuckDB SQL transpiler for the bureau feature SQL.

The bureau SQL files under ../sql were written for a Snowflake-flavoured engine.
DuckDB supports almost all of it natively (datediff, last_day, substring FROM/FOR,
greatest with NULL-skip, ilike, char_length, ::casts, ALTER ... ADD COLUMN, UPDATE).

Only a handful of constructs need rewriting. We do it with a balanced-paren parser
(NOT regex) because the calls nest, e.g.

    DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month, 0, rec_end_date)))

Handled:
  - DATEADD(part, n, d)        -> (d + ((n) * INTERVAL 1 PART))
  - DATEDIFF(part, a, b)       -> datediff('part', a, b)        (quote the bare part)
  - MONTHS_BETWEEN(a, b)       -> datediff('month', b, a)
  - REGEXP_INSTR(s, pat)       -> (CASE WHEN regexp_matches(s, pat) THEN 1 ELSE 0 END)
  - TO_CHAR(d, fmt)            -> strftime(d, '<duck fmt>')
  - TO_DATE(s, fmt)            -> strptime(s, '<duck fmt>')::date
  - LISTAGG(x, sep) WITHIN GROUP (ORDER BY ...) -> string_agg(x, sep ORDER BY ...)
  - strip "kmbl_dex.srcl_vw."  (the ebix views become bare names we register)

The "sandbox." schema prefix is intentionally KEPT: we create a real `sandbox`
schema in DuckDB so the original create-table-into-sandbox statements run verbatim
(stripping it would turn `CREATE TABLE X AS SELECT * FROM X` into a self-reference).
"""

import re

# functions we rewrite; matched case-insensitively as <name>(
_TARGETS = ("dateadd", "datediff", "months_between", "regexp_instr",
            "to_char", "to_date", "listagg")
_CALL_RE = re.compile(r"(?i)\b(" + "|".join(_TARGETS) + r")\s*\(")
_WITHIN_RE = re.compile(r"(?i)\s*within\s+group\s*\(")

# Snowflake date-format token -> DuckDB strftime/strptime token.
# Longest tokens first so YYYY is consumed before YY, etc.
_FMT_TOKENS = [
    ("yyyy", "%Y"), ("yy", "%y"),
    ("mm", "%m"), ("dd", "%d"),
    ("hh24", "%H"), ("hh", "%H"),
    ("mi", "%M"), ("ss", "%S"),
]


def _convert_fmt(fmt: str) -> str:
    """Translate a Snowflake date format mask to a DuckDB strftime mask."""
    out, i, low = [], 0, fmt.lower()
    while i < len(fmt):
        for tok, repl in _FMT_TOKENS:
            if low.startswith(tok, i):
                out.append(repl)
                i += len(tok)
                break
        else:
            out.append(fmt[i])
            i += 1
    return "".join(out)


def _match_paren(s: str, open_idx: int) -> int:
    """Return index of the ')' matching the '(' at open_idx, ignoring string literals."""
    depth, i, instr, q = 0, open_idx, False, ""
    while i < len(s):
        c = s[i]
        if instr:
            if c == q:
                instr = False
        elif c in ("'", '"'):
            instr, q = True, c
        elif c == "(":
            depth += 1
        elif c == ")":
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise ValueError("unbalanced parentheses")


def _split_args(inner: str):
    """Split the text between parens on top-level commas (respecting nesting/strings)."""
    args, depth, cur, instr, q = [], 0, [], False, ""
    for c in inner:
        if instr:
            cur.append(c)
            if c == q:
                instr = False
        elif c in ("'", '"'):
            instr, q = True, c
            cur.append(c)
        elif c == "(":
            depth += 1
            cur.append(c)
        elif c == ")":
            depth -= 1
            cur.append(c)
        elif c == "," and depth == 0:
            args.append("".join(cur))
            cur = []
        else:
            cur.append(c)
    if cur or args:
        args.append("".join(cur))
    return [a.strip() for a in args]


def _unquote(tok: str) -> str:
    tok = tok.strip()
    if len(tok) >= 2 and tok[0] in ("'", '"') and tok[-1] == tok[0]:
        return tok[1:-1]
    return tok


def transpile(sql: str) -> str:
    """Rewrite one chunk of Snowflake SQL to DuckDB-compatible SQL."""
    # 1. strip the ebix schema prefix so `ebix_cibil_data_tl/_iq` become bare names
    sql = re.sub(r"(?i)kmbl_dex\.srcl_vw\.", "", sql)

    # 2. rewrite the function calls, innermost handled via recursion on the args
    while True:
        m = _CALL_RE.search(sql)
        if not m:
            break
        fname = m.group(1).lower()
        open_idx = m.end() - 1
        close_idx = _match_paren(sql, open_idx)
        args = [transpile(a) for a in _split_args(sql[open_idx + 1:close_idx])]
        end_idx = close_idx  # may be extended for LISTAGG ... WITHIN GROUP

        if fname == "dateadd":
            part = _unquote(args[0]).upper()
            repl = f"({args[2]} + (({args[1]}) * INTERVAL 1 {part}))"
        elif fname == "datediff":
            repl = f"datediff('{_unquote(args[0]).lower()}', {args[1]}, {args[2]})"
        elif fname == "months_between":
            repl = f"datediff('month', {args[1]}, {args[0]})"
        elif fname == "regexp_instr":
            repl = f"(CASE WHEN regexp_matches({args[0]}, {args[1]}) THEN 1 ELSE 0 END)"
        elif fname == "to_char":
            repl = f"strftime({args[0]}, '{_convert_fmt(_unquote(args[1]))}')"
        elif fname == "to_date":
            repl = f"strptime({args[0]}, '{_convert_fmt(_unquote(args[1]))}')::date"
        elif fname == "listagg":
            sep = args[1] if len(args) > 1 else "''"
            wg = _WITHIN_RE.match(sql, close_idx + 1)
            if wg:
                wg_open = wg.end() - 1
                wg_close = _match_paren(sql, wg_open)
                order_clause = transpile(sql[wg_open + 1:wg_close]).strip()
                repl = f"string_agg({args[0]}, {sep} {order_clause})"
                end_idx = wg_close
            else:
                repl = f"string_agg({args[0]}, {sep})"
        else:  # pragma: no cover
            repl = sql[m.start():end_idx + 1]

        sql = sql[:m.start()] + repl + sql[end_idx + 1:]

    return sql


def split_statements(sql: str):
    """Split a script into statements on top-level semicolons (ignoring strings)."""
    stmts, cur, instr, q = [], [], False, ""
    for c in sql:
        if instr:
            cur.append(c)
            if c == q:
                instr = False
        elif c in ("'", '"'):
            instr, q = True, c
            cur.append(c)
        elif c == ";":
            s = "".join(cur).strip()
            if s:
                stmts.append(s)
            cur = []
        else:
            cur.append(c)
    s = "".join(cur).strip()
    if s:
        stmts.append(s)
    return stmts


if __name__ == "__main__":
    # quick self-test
    samples = [
        "DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month, -3, rec_end_date)))",
        "DATEDIFF(DAY, DATEOFENQUIRY, scrub_date)",
        "MONTHS_BETWEEN(SCRUB_DATE, MAX_DPD_DATE)",
        "REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 1, 3)), '^[0-9]+$') > 0",
        "cast(to_char(a.reference_date,'yyyyMM') as int)",
        "to_date(report_month::varchar || '01', 'YYYYMMDD')",
        "listagg(x, '') within group (order by n.idx)",
        "from kmbl_dex.srcl_vw.ebix_cibil_data_tl b",
    ]
    for s in samples:
        print(s, "\n  ->", transpile(s), "\n")
