DROP TABLE IF EXISTS PP_HS_BASE_1;
Create table PP_HS_BASE_1 AS
select 496453826 AS crn, TO_DATE('05-07-2025','dd-MM-yyyy') AS REFERENCE_DATE, 1 AS IS_CV;
-- select crn, REFERENCE_DATE FROM sc_rl_final_cc_ntb;

-- select DISTINCT crn,agr_date AS REFERENCE_DATE
-- from kmbl_dex.bl_vw.dim_retail_loan_account
-- where appl = 'SPLN'
-- and agr_date='2026-03-31'
-- limit 100;

DROP TABLE IF EXISTS SANDBOX.PP_HS_BASE_1;
CREATE TABLE SANDBOX.PP_HS_BASE_1 AS
SELECT * FROM PP_HS_BASE_1;

SELECT * FROM PP_HS_BASE_1;