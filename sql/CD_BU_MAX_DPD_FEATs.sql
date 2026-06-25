drop table if exists PP_HS_BASE_BU_MAXDPD_TL_1;
CREATE TABLE PP_HS_BASE_BU_MAXDPD_TL_1 AS
select 
        crn,
        reference_date,
        report_month as report_month,
        creditlimit,
        date_closed,
        date_opened,
        datereported_trades,
        dpd_string,
        pay_hist_end_date,
        pay_hist_start_date,
        sanction_amount,
        out_standing_balance,
        over_due_amount,
        emi,
        high_credit_amount,
        tu_score,
        last_payment_date,
        loan_type_new,
        loan_status,
        loan_classification,
        ownership_type,
        sector,
        base,
payhist_1,payhist_2,payhist_3,payhist_4,payhist_5,payhist_6,payhist_7,payhist_8,payhist_9,payhist_10
,payhist_11,payhist_12,payhist_13,payhist_14,payhist_15,payhist_16,payhist_17,payhist_18,payhist_19,payhist_20
,payhist_21,payhist_22,payhist_23,payhist_24,payhist_25,payhist_26,payhist_27,payhist_28,payhist_29,payhist_30
,payhist_31,payhist_32,payhist_33,payhist_34,payhist_35,payhist_36,
dt1,dt2,dt3,dt4,dt5,dt6,dt7,dt8,dt9,dt10
,dt11,dt12,dt13,dt14,dt15,dt16,dt17,dt18,dt19,dt20
,dt21,dt22,dt23,dt24,dt25,dt26,dt27,dt28,dt29,dt30
,dt31,dt32,dt33,dt34,dt35,dt36,
greatest(
payhist_1,payhist_2,payhist_3,payhist_4,payhist_5,payhist_6,payhist_7,payhist_8,payhist_9,payhist_10
,payhist_11,payhist_12,payhist_13,payhist_14,payhist_15,payhist_16,payhist_17,payhist_18,payhist_19,payhist_20
,payhist_21,payhist_22,payhist_23,payhist_24,payhist_25,payhist_26,payhist_27,payhist_28,payhist_29,payhist_30
,payhist_31,payhist_32,payhist_33,payhist_34,payhist_35,payhist_36) as MAX_DPD,

case 
when payhist_1 >= MAX_DPD THEN dt1
WHEN payhist_2 >= MAX_DPD THEN dt2
WHEN payhist_3 >= MAX_DPD THEN dt3
WHEN payhist_4 >= MAX_DPD THEN dt4
WHEN payhist_5 >= MAX_DPD THEN dt5
WHEN payhist_6 >= MAX_DPD THEN dt6
WHEN payhist_7 >= MAX_DPD THEN dt7
WHEN payhist_8 >= MAX_DPD THEN dt8
WHEN payhist_9 >= MAX_DPD THEN dt9
WHEN payhist_10 >= MAX_DPD THEN dt10
WHEN payhist_11 >= MAX_DPD THEN dt11
WHEN payhist_12 >= MAX_DPD THEN dt12
WHEN payhist_13 >= MAX_DPD THEN dt13
WHEN payhist_14 >= MAX_DPD THEN dt14
WHEN payhist_15 >= MAX_DPD THEN dt15
WHEN payhist_16 >= MAX_DPD THEN dt16
WHEN payhist_17 >= MAX_DPD THEN dt17
WHEN payhist_18 >= MAX_DPD THEN dt18
WHEN payhist_19 >= MAX_DPD THEN dt19
WHEN payhist_20 >= MAX_DPD THEN dt20
WHEN payhist_21 >= MAX_DPD THEN dt21
WHEN payhist_22 >= MAX_DPD THEN dt22
WHEN payhist_23 >= MAX_DPD THEN dt23
WHEN payhist_24 >= MAX_DPD THEN dt24
WHEN payhist_25 >= MAX_DPD THEN dt25
WHEN payhist_26 >= MAX_DPD THEN dt26
WHEN payhist_27 >= MAX_DPD THEN dt27
WHEN payhist_28 >= MAX_DPD THEN dt28
WHEN payhist_29 >= MAX_DPD THEN dt29
WHEN payhist_30 >= MAX_DPD THEN dt30
WHEN payhist_31 >= MAX_DPD THEN dt31
WHEN payhist_32 >= MAX_DPD THEN dt32
WHEN payhist_33 >= MAX_DPD THEN dt33
WHEN payhist_34 >= MAX_DPD THEN dt34
WHEN payhist_35 >= MAX_DPD THEN dt35
WHEN payhist_36 >= MAX_DPD THEN dt36
end AS MAX_DPD_DATE,

MONTHS_BETWEEN(SCRUB_DATE,MAX_DPD_DATE) AS MONTHS_SINCE_MAX_DPD

from PP_HS_BASE_BU_TL_10;

drop table if exists PP_HS_BASE_BU_MAXDPD_TL_2;
CREATE TABLE PP_HS_BASE_BU_MAXDPD_TL_2 AS
select * from 
(SELECT *,
ROW_NUMBER() OVER(PARTITION BY CRN,REFERENCE_DATE ORDER BY max_dpd desc, months_since_max_dpd asc) as rnk 
FROM PP_HS_BASE_BU_MAXDPD_TL_1
) where rnk=1;

drop table if exists SANDBOX.PP_HS_BASE_BU_MAXDPD_TL_2;
CREATE TABLE SANDBOX.PP_HS_BASE_BU_MAXDPD_TL_2 AS
SELECT * FROM PP_HS_BASE_BU_MAXDPD_TL_2;

SELECT * FROM PP_HS_BASE_BU_MAXDPD_TL_2;