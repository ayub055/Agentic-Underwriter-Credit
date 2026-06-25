drop table if exists sandbox.PP_HS_BASE_BU_1;
create table sandbox.PP_HS_BASE_BU_1 as
select a.crn,a.reference_date, a.IS_CV
,max(b.report_month) as report_month
from sandbox.PP_HS_BASE_1 a
left join kmbl_dex.srcl_vw.ebix_cibil_data_tl b
on a.crn = b.crn and cast(to_char(a.reference_date,'yyyyMM') as int)>=b.report_month
group by a.crn,a.reference_date,a.IS_CV;

drop table if exists PP_HS_BU_tl_1;
create TEMP table PP_HS_BU_tl_1 as
select A.crn as CUST_ID,
        A.REFERENCE_DATE,
        b.crn,
        b.report_month as report_month,
        b.creditlimit,
        b.date_closed,
        b.date_opened,
        b.datereported_trades,
        b.dpd_string,
        b.pay_hist_end_date,
        b.pay_hist_start_date,
        b.sanction_amount,
        b.out_standing_balance,
        b.over_due_amount,
        b.emi,
        b.high_credit_amount,
        b.tu_score,
        b.last_payment_date,
        b.loan_type_new,
        b.loan_status,
        b.loan_classification,
        b.ownership_type,
        b.sector,
        b.base,
        b.Loan_Type,
        CASE WHEN a.IS_CV = 1 THEN ROW_NUMBER() OVER(ORDER BY b.sanction_amount) ELSE 1 END AS CV_RN 

from  sandbox.PP_HS_BASE_BU_1 A
LEFT JOIN kmbl_dex.srcl_vw.ebix_cibil_data_tl b
ON A.CRN = B.CRN AND A.report_month = B.report_month
and upper(b.BASE) in ('ASSET','RL');

drop table if exists PP_HS_BASE_BU_TL_2;
create TEMP table PP_HS_BASE_BU_TL_2 as
select *,
(to_date(report_month::varchar || '01', 'YYYYMMDD') - interval '1 day')::date as scrub_date,
case upper(loan_type_new)
            when 'AUTO LOAN (PERSONAL)' then 1
            when 'HOUSING LOAN' then 2
            when 'PROPERTY LOAN' then 3
            when 'LOAN AGAINST SHARES/SECURITIES' then 4
            when 'LOAN AGAINST SHARES / SECURITIES' then 4
            when 'PERSONAL LOAN' then 5
            when 'CONSUMER LOAN' then 6
            when 'GOLD LOAN' then 7
            when 'EDUCATION LOAN' then 8
            when 'LOAN TO PROFESSIONAL' then 9
            when 'CREDIT CARD' then 10
            when 'LEASING' then 11
            when 'OVERDRAFT' then 12
            when 'TWO-WHEELER LOAN' then 13
            when 'NON-FUNDED CREDIT FACILITY' then 14
            when 'LOAN AGAINST BANK DEPOSITS' then 15
            when 'FLEET CARD' then 16
            when 'COMMERCIAL VEHICLE LOAN' then 17
            when 'TELCO - WIRELESS' then 18
            when 'TELCO - BROADBAND' then 19
            when 'TELCO - LANDLINE' then 20
            when 'SELLER FINANCING' then 21
            when 'SELLER FINANCING SOFT (APPLICABLE TO ENQUIRY PURPOSE ONLY)' then 22
            when 'GECL LOAN SECURED' then 23
            when 'GECL LOAN UNSECURED' then 24
            when 'SECURED CREDIT CARD' then 31
            when 'USED CAR LOAN' then 32
            when 'CONSTRUCTION EQUIPMENT LOAN' then 33
            when 'TRACTOR LOAN' then 34
            when 'CORPORATE CREDIT CARD' then 35
            when 'KISAN CREDIT CARD' then 36
            when 'LOAN ON CREDIT CARD' then 37
            when 'PRIME MINISTER JAAN DHAN YOJANA - OVERDRAFT' then 38
            when 'MUDRA LOANS - SHISHU / KISHOR / TARUN' then 39
            when 'MICROFINANCE - BUSINESS LOAN' then 40
            when 'MICROFINANCE - PERSONAL LOAN' then 41
            when 'MICROFINANCE - HOUSING LOAN' then 42
            when 'MICROFINANCE - OTHER' then 43
            when 'MICROFINANCE - OTHERS' then 43
            when 'PRADHAN MANTRI AWAS YOJANA - CREDIT LINK SUBSIDY SCHEME MAY CLSS' then 44
            when 'P2P PERSONAL LOAN' then 45
            when 'P2P AUTO LOAN' then 46
            when 'P2P EDUCATION LOAN' then 47
            when 'BUSINESS LOAN - SECURED' then 50
            when 'BUSINESS LOAN - GENERAL' then 51
            when 'BUSINESS LOAN - PRIORITY SECTOR - SMALL BUSINESS' then 52
            when 'BUSINESS LOAN - PRIORITY SECTOR - AGRICULTURE' then 53
            when 'BUSINESS LOAN - PRIORITY SECTOR - OTHERS' then 54
            when 'BUSINESS NON-FUNDED CREDIT FACILITY - GENERAL' then 55
            when 'BUSINESS NON-FUNDED CREDIT FACILITY - PRIORITY SECTOR - SMALL BUSINESS' then 56
            when 'BUSINESS NON-FUNDED CREDIT FACILITY-PRIORITY SECTOR- SMALL BUSINESS' then 56
            when 'BUSINESS NON-FUNDED CREDIT FACILITY - PRIORITY SECTOR - AGRICULTURE' then 57
            when 'BUSINESS NON-FUNDED CREDIT FACILITY-PRIORITY SECTOR-AGRICULTURE' then 57
            when 'BUSINESS NON-FUNDED CREDIT FACILITY - PRIORITY SECTOR-OTHERS' then 58
            when 'BUSINESS NON-FUNDED CREDIT FACILITY-PRIORITY SECTOR-OTHERS' then 58
            when 'BUSINESS LOAN AGAINST BANK DEPOSITS' then 59
            when 'BUSINESS LOAN - UNSECURED' then 61
            when 'SHORT TERM PERSONAL LOAN' then 69
            when 'PRIORITY SECTOR - GOLD LOAN' then 70
            when 'TEMPORARY OVERDRAFT' then 71
            when 'MICROFINANCE DETAILED REPORT (APPLICABLE TO ENQUIRY PURPOSE ONLY)' then 80
            when 'SUMMARY REPORT (APPLICABLE TO ENQUIRY PURPOSE ONLY)' then 81
            when 'LOCATE PLUS FOR INSURANCE (APPLICABLE TO ENQUIRY PURPOSE ONLY)' then 88
            when 'ACCOUNT REVIEW (APPLICABLE TO ENQUIRY PURPOSE ONLY)' then 90
            when 'RETRO ENQUIRY (APPLICABLE TO ENQUIRY PURPOSE ONLY)' then 91
            when 'LOCATE PLUS (APPLICABLE TO ENQUIRY PURPOSE ONLY)' then 92
            when 'ADVISER LIABILITY (APPLICABLE TO ENQUIRY PURPOSE ONLY)' then 97
            when 'SECURED (ACCOUNT GROUP FOR PORTFOLIO REVIEW RESPONSE)' then 98
            when 'UNSECURED (ACCOUNT GROUP FOR PORTFOLIO REVIEW RESPONSE)' then 99
            when 'OTHER' then 0
            when 'NONE'  then 0
            else 0
        end::int as account_type_cd,

(dateadd('month', -3,  scrub_date))::date  as datebck3,
(dateadd('month', -6,  scrub_date))::date  as datebck6,
(dateadd('month', -9,  scrub_date))::date  as datebck9,
(dateadd('month', -12, scrub_date))::date  as datebck12,
(dateadd('month', -18, scrub_date))::date  as datebck18,
(dateadd('month', -24, scrub_date))::date  as datebck24,
(dateadd('month', -36, scrub_date))::date  as datebck36,

greatest(out_standing_balance, 0) as out_standing_balance_clean,
greatest(over_due_amount, 0)      as over_due_amount_clean,
case 
            when upper(loan_type_new) in (
                'CREDIT CARD','SECURED CREDIT CARD','CORPORATE CREDIT CARD',
                'KISAN CREDIT CARD','FLEET CARD'
            ) then
                case 
                    when creditlimit > 0 then creditlimit
                    when (creditlimit <= 0 or creditlimit is null)
                         and sanction_amount is null
                         and out_standing_balance_clean is not null
                    then out_standing_balance_clean
                    else sanction_amount
                end
            else sanction_amount
        end::numeric(18,2) as sanction_amount_adj,

case when sanction_amount_adj <=  10000 then 1 else 0 end::int as is_sanc_amt_bel10k,
case when sanction_amount_adj <=  20000 then 1 else 0 end::int as is_sanc_amt_bel20k,
case when sanction_amount_adj <= 100000 then 1 else 0 end::int as is_sanc_amt_bel1l,
case when sanction_amount_adj <= 300000 then 1 else 0 end::int as is_sanc_amt_bel3l,

date_trunc('month',
        case
            when 
             pay_hist_start_date > scrub_date
            then scrub_date
            else pay_hist_start_date
        end
    )::date as pay_hist_end_month,
 
    date_trunc('month',
        case
            when 
             pay_hist_start_date > scrub_date
            then scrub_date
            else pay_hist_start_date
        end
    )::date as rec_end_date,
 
    dateadd(
        'month',
        - ((char_length(coalesce(dpd_string, '')) / 3) - 1),
        date_trunc(
            'month',
            case
                when 
                  pay_hist_start_date > scrub_date
                then scrub_date
                else pay_hist_start_date
            end
        )::date
    )::date as rec_start_date,

    case 
            when date_opened is null
                 and char_length(coalesce(dpd_string,'')) < 108
                 and rec_start_date is not null
            then rec_start_date
            else date_opened
        end as date_opened_filled,

    case 
            when 
                (date_opened_filled is not null or datereported_trades is not null)
                and upper(loan_type_new) not in (
                    'CREDIT CARD','SECURED CREDIT CARD','CORPORATE CREDIT CARD',
                    'KISAN CREDIT CARD','FLEET CARD'
                )
                and out_standing_balance_clean <= 0
            then 1
            when 
                (date_opened_filled is not null or datereported_trades is not null)
                and date_closed IS NOT NULL
                THEN 1
            WHEN  (date_opened_filled is not null or datereported_trades is not null)
                AND date_closed IS NULL
      THEN 0
      ELSE NULL 
    END::int AS close_flag,

    coalesce(
            date_closed,
            case 
                when close_flag = 1 
                     and date_closed is null 
                     and last_payment_date is not null
                then last_payment_date
                else null
            end,
            case 
                when close_flag = 1
                     and date_closed is null
                     and last_payment_date is null
                     and datereported_trades is not null
                then datereported_trades
                else null
            end
        ) as date_closed_filled,

    CASE
            WHEN close_flag IS NULL THEN NULL
            ELSE 1 - close_flag
            END::int AS open_flag,
    case 
            when date_opened_filled is not null and scrub_date is not null
            then round( (datediff('day', date_opened_filled, scrub_date)::numeric / 30.5), 2)
            else null
        end as time_since_tr_open,
        case 
            when date_closed_filled is not null and scrub_date is not null
            then round( (datediff('day', date_closed_filled, scrub_date)::numeric / 30.5), 2)
            else null
        end as time_since_tr_close
 from PP_HS_BU_tl_1
where
 date_opened <= scrub_date;

drop table if exists PP_HS_BASE_BU_TL_3;
create TEMP table PP_HS_BASE_BU_TL_3 as
with nums as (
    select 1 as idx union all select 2  union all select 3  union all select 4  union all select 5 union all
    select 6 union all select 7  union all select 8  union all select 9  union all select 10 union all
    select 11 union all select 12 union all select 13 union all select 14 union all select 15 union all
    select 16 union all select 17 union all select 18 union all select 19 union all select 20 union all
    select 21 union all select 22 union all select 23 union all select 24 union all select 25 union all
    select 26 union all select 27 union all select 28 union all select 29 union all select 30 union all
    select 31 union all select 32 union all select 33 union all select 34 union all select 35 union all
    select 36 union all select 37 union all select 38 union all select 39 union all select 40
),

op13 as (
    -- compute dpd_processed in one grouped step (no correlated subquery)
    select
        o.crn,
        o.reference_date,
        o.report_month,
        o.CV_RN,
        o.creditlimit,
        o.date_closed_filled         as date_closed,
        o.date_opened_filled         as date_opened,
        o.datereported_trades,
        o.dpd_string,
        -- EXACT same logic as your working one_row snippet, but per row
        listagg(
            CASE
            WHEN UPPER(TRIM(substring(o.dpd_string FROM (n.idx - 1) * 3 + 1 FOR 3))) = 'STD' THEN
                CASE
                WHEN n.idx = 1 THEN
                    CASE
                    WHEN COALESCE(o.emi, 0) > 0 AND COALESCE(o.over_due_amount_clean, 0) >= 500 THEN
                        -- Padded 3-char day count
                        LPAD(
                        CAST(
                            CASE
                            WHEN CEIL(COALESCE(o.over_due_amount_clean, 0)::numeric / NULLIF(COALESCE(o.emi, 0)::numeric, 0)) * 30 > 900 THEN 900
                            WHEN CEIL(COALESCE(o.over_due_amount_clean, 0)::numeric / NULLIF(COALESCE(o.emi, 0)::numeric, 0)) * 30 = 0 THEN 30
                            ELSE CEIL(COALESCE(o.over_due_amount_clean, 0)::numeric / NULLIF(COALESCE(o.emi, 0)::numeric, 0)) * 30
                            END AS INT
                        )::varchar,
                        3, '0'
                        )

                    WHEN COALESCE(o.emi, 0) <= 0 AND COALESCE(o.over_due_amount_clean, 0) >= 500 THEN '030'
                    WHEN COALESCE(o.over_due_amount_clean, 0) < 500 THEN '000'
                    ELSE '000'
                    END
                ELSE '000'
                END


                when substring(o.dpd_string from (n.idx - 1)*3 + 1 for 3) = 'SUB' then '091'
                when substring(o.dpd_string from (n.idx - 1)*3 + 1 for 3) = 'DBT' then '181'
                when substring(o.dpd_string from (n.idx - 1)*3 + 1 for 3) = 'LSS' then '361'
                when substring(o.dpd_string from (n.idx - 1)*3 + 1 for 3) = 'SMA' then '061'
                when substring(o.dpd_string from (n.idx - 1)*3 + 1 for 3) in ('X','XX','XXX') then '   '

                else substring(o.dpd_string from (n.idx - 1)*3 + 1 for 3)
            end,
            ''
        ) within group (order by n.idx) as dpd_processed,
        o.pay_hist_end_date,
        o.pay_hist_start_date,
        o.rec_start_date,
        o.rec_end_date,
        o.sanction_amount_adj        as sanction_amount,
        o.out_standing_balance_clean as out_standing_balance,
        o.over_due_amount_clean      as over_due_amount,
        o.emi,
        o.high_credit_amount,
        o.tu_score,
        o.last_payment_date,
        o.loan_type_new,
        o.loan_status,
        o.loan_classification,
        o.ownership_type,
        o.sector,
        o.base,
        o.account_type_cd,
        o.is_sanc_amt_bel10k,
        o.is_sanc_amt_bel20k,
        o.is_sanc_amt_bel1l,
        o.is_sanc_amt_bel3l,
        o.open_flag,
        o.close_flag,
        o.scrub_date,
        o.datebck3,
        o.datebck6,
        o.datebck9,
        o.datebck12,
        o.datebck18,
        o.datebck24,
        o.datebck36,
        o.time_since_tr_open,
        o.time_since_tr_close
    from PP_HS_BASE_BU_TL_2 o
    left join nums n
      on n.idx <= ceil(char_length(coalesce(o.dpd_string,''))::numeric / 3)
    group by
        o.crn,
        o.reference_date,
        o.report_month,
        o.CV_RN,
        o.creditlimit,
        o.date_closed_filled,
        o.date_opened_filled,
        o.datereported_trades,
        o.dpd_string,
        o.pay_hist_end_date,
        o.pay_hist_start_date,
        o.rec_start_date,
        o.rec_end_date,
        o.sanction_amount_adj,
        o.out_standing_balance_clean,
        o.over_due_amount_clean,
        o.emi,
        o.high_credit_amount,
        o.tu_score,
        o.last_payment_date,
        o.loan_type_new,
        o.loan_status,
        o.loan_classification,
        o.ownership_type,
        o.sector,
        o.base,
        o.account_type_cd,
        o.is_sanc_amt_bel10k,
        o.is_sanc_amt_bel20k,
        o.is_sanc_amt_bel1l,
        o.is_sanc_amt_bel3l,
        o.open_flag,
        o.close_flag,
        o.scrub_date,
        o.datebck3,
        o.datebck6,
        o.datebck9,
        o.datebck12,
        o.datebck18,
        o.datebck24,
        o.datebck36,
        o.time_since_tr_open,
        o.time_since_tr_close
)
select * from op13;

drop table if exists PP_HS_BASE_BU_TL_4;
create table PP_HS_BASE_BU_TL_4 as
select *,
date_trunc('month', o.rec_end_date)::date   as rec_end_month,
        date_trunc('month', o.scrub_date)::date     as scrub_month,
        (char_length(coalesce(o.dpd_processed, '')) / 3)::int as hist_months 
from PP_HS_BASE_BU_TL_3 o;

drop table if exists SANDBOX.PP_HS_BASE_BU_TL_4;
create table SANDBOX.PP_HS_BASE_BU_TL_4 as
SELECT * FROM PP_HS_BASE_BU_TL_4;

SELECT * FROM PP_HS_BASE_BU_TL_4;