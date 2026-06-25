
drop table if exists PP_HS_BASE_BU_TL_10;
create table PP_HS_BASE_BU_TL_10 as
select * ,
least(36, (length(dpd_processed) / 3))::int as last_non_bl,
CASE WHEN last_non_bl >= 1  THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed,  1, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed,  1, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_1,

            CASE WHEN last_non_bl >= 2  THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed,  4, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed,  4, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_2,

            CASE WHEN last_non_bl >= 3  THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed,  7, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed,  7, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_3,

            CASE WHEN last_non_bl >= 4  THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 10, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 10, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_4,

            CASE WHEN last_non_bl >= 5  THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 13, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 13, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_5,

            CASE WHEN last_non_bl >= 6  THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 16, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 16, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_6,

            CASE WHEN last_non_bl >= 7  THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 19, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 19, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_7,

            CASE WHEN last_non_bl >= 8  THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 22, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 22, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_8,

            CASE WHEN last_non_bl >= 9  THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 25, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 25, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_9,

            CASE WHEN last_non_bl >= 10 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 28, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 28, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_10,

            CASE WHEN last_non_bl >= 11 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 31, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 31, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_11,

            CASE WHEN last_non_bl >= 12 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 34, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 34, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_12,

            CASE WHEN last_non_bl >= 13 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 37, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 37, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_13,

            CASE WHEN last_non_bl >= 14 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 40, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 40, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_14,

            CASE WHEN last_non_bl >= 15 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 43, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 43, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_15,

            CASE WHEN last_non_bl >= 16 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 46, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 46, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_16,

            CASE WHEN last_non_bl >= 17 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 49, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 49, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_17,

            CASE WHEN last_non_bl >= 18 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 52, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 52, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_18,

            CASE WHEN last_non_bl >= 19 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 55, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 55, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_19,

            CASE WHEN last_non_bl >= 20 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 58, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 58, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_20,

            CASE WHEN last_non_bl >= 21 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 61, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 61, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_21,

            CASE WHEN last_non_bl >= 22 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 64, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 64, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_22,

            CASE WHEN last_non_bl >= 23 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 67, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 67, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_23,

            CASE WHEN last_non_bl >= 24 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 70, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 70, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_24,

            CASE WHEN last_non_bl >= 25 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 73, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 73, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_25,

            CASE WHEN last_non_bl >= 26 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 76, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 76, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_26,

            CASE WHEN last_non_bl >= 27 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 79, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 79, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_27,

            CASE WHEN last_non_bl >= 28 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 82, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 82, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_28,

            CASE WHEN last_non_bl >= 29 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 85, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 85, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_29,

            CASE WHEN last_non_bl >= 30 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 88, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 88, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_30,

            CASE WHEN last_non_bl >= 31 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 91, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 91, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_31,

            CASE WHEN last_non_bl >= 32 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 94, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 94, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_32,

            CASE WHEN last_non_bl >= 33 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 97, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 97, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_33,

            CASE WHEN last_non_bl >= 34 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 100, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 100, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_34,

            CASE WHEN last_non_bl >= 35 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 103, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 103, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_35,

            CASE WHEN last_non_bl >= 36 THEN
              CASE WHEN REGEXP_INSTR(TRIM(SUBSTRING(dpd_processed, 106, 3)), '^[0-9]+$') > 0
                   THEN CAST(TRIM(SUBSTRING(dpd_processed, 106, 3)) AS INT)
                   ELSE NULL END
            ELSE NULL END AS payhist_36,

            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,  0, rec_end_date))) AS dt1,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month, -1, rec_end_date))) AS dt2,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month, -2, rec_end_date))) AS dt3,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month, -3, rec_end_date))) AS dt4,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month, -4, rec_end_date))) AS dt5,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month, -5, rec_end_date))) AS dt6,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month, -6, rec_end_date))) AS dt7,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month, -7, rec_end_date))) AS dt8,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month, -8, rec_end_date))) AS dt9,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month, -9, rec_end_date))) AS dt10,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-10, rec_end_date))) AS dt11,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-11, rec_end_date))) AS dt12,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-12, rec_end_date))) AS dt13,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-13, rec_end_date))) AS dt14,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-14, rec_end_date))) AS dt15,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-15, rec_end_date))) AS dt16,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-16, rec_end_date))) AS dt17,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-17, rec_end_date))) AS dt18,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-18, rec_end_date))) AS dt19,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-19, rec_end_date))) AS dt20,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-20, rec_end_date))) AS dt21,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-21, rec_end_date))) AS dt22,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-22, rec_end_date))) AS dt23,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-23, rec_end_date))) AS dt24,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-24, rec_end_date))) AS dt25,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-25, rec_end_date))) AS dt26,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-26, rec_end_date))) AS dt27,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-27, rec_end_date))) AS dt28,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-28, rec_end_date))) AS dt29,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-29, rec_end_date))) AS dt30,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-30, rec_end_date))) AS dt31,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-31, rec_end_date))) AS dt32,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-32, rec_end_date))) AS dt33,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-33, rec_end_date))) AS dt34,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-34, rec_end_date))) AS dt35,
            DATEADD(day, -1, DATE_TRUNC('month', DATEADD(month,-35, rec_end_date))) AS dt36,

        CASE 
            WHEN coalesce(payhist_1,0)  > 0 THEN (DATEDIFF(day, dt1, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_2,0)  > 0 THEN (DATEDIFF(day, dt2 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_3,0)  > 0 THEN (DATEDIFF(day, dt3 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_4,0)  > 0 THEN (DATEDIFF(day, dt4 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_5,0)  > 0 THEN (DATEDIFF(day, dt5 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_6,0)  > 0 THEN (DATEDIFF(day, dt6 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_7,0)  > 0 THEN (DATEDIFF(day, dt7 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_8,0)  > 0 THEN (DATEDIFF(day, dt8 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_9,0)  > 0 THEN (DATEDIFF(day, dt9 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_10,0) > 0 THEN (DATEDIFF(day, dt10, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_11,0) > 0 THEN (DATEDIFF(day, dt11, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_12,0) > 0 THEN (DATEDIFF(day, dt12, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_13,0) > 0 THEN (DATEDIFF(day, dt13, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_14,0) > 0 THEN (DATEDIFF(day, dt14, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_15,0) > 0 THEN (DATEDIFF(day, dt15, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_16,0) > 0 THEN (DATEDIFF(day, dt16, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_17,0) > 0 THEN (DATEDIFF(day, dt17, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_18,0) > 0 THEN (DATEDIFF(day, dt18, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_19,0) > 0 THEN (DATEDIFF(day, dt19, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_20,0) > 0 THEN (DATEDIFF(day, dt20, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_21,0) > 0 THEN (DATEDIFF(day, dt21, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_22,0) > 0 THEN (DATEDIFF(day, dt22, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_23,0) > 0 THEN (DATEDIFF(day, dt23, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_24,0) > 0 THEN (DATEDIFF(day, dt24, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_25,0) > 0 THEN (DATEDIFF(day, dt25, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_26,0) > 0 THEN (DATEDIFF(day, dt26, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_27,0) > 0 THEN (DATEDIFF(day, dt27, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_28,0) > 0 THEN (DATEDIFF(day, dt28, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_29,0) > 0 THEN (DATEDIFF(day, dt29, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_30,0) > 0 THEN (DATEDIFF(day, dt30, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_31,0) > 0 THEN (DATEDIFF(day, dt31, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_32,0) > 0 THEN (DATEDIFF(day, dt32, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_33,0) > 0 THEN (DATEDIFF(day, dt33, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_34,0) > 0 THEN (DATEDIFF(day, dt34, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_35,0) > 0 THEN (DATEDIFF(day, dt35, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_36,0) > 0 THEN (DATEDIFF(day, dt36, scrub_date) - 1)::DECIMAL / 30.5
            ELSE NULL
        END AS time_since_last_0p,

        CASE
            WHEN coalesce(payhist_1,0)  >= 30 THEN (DATEDIFF(day, dt1 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_2,0)  >= 30 THEN (DATEDIFF(day, dt2 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_3,0)  >= 30 THEN (DATEDIFF(day, dt3 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_4,0)  >= 30 THEN (DATEDIFF(day, dt4 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_5,0)  >= 30 THEN (DATEDIFF(day, dt5 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_6,0)  >= 30 THEN (DATEDIFF(day, dt6 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_7,0)  >= 30 THEN (DATEDIFF(day, dt7 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_8,0)  >= 30 THEN (DATEDIFF(day, dt8 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_9,0)  >= 30 THEN (DATEDIFF(day, dt9 , scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_10,0) >= 30 THEN (DATEDIFF(day, dt10, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_11,0) >= 30 THEN (DATEDIFF(day, dt11, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_12,0) >= 30 THEN (DATEDIFF(day, dt12, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_13,0) >= 30 THEN (DATEDIFF(day, dt13, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_14,0) >= 30 THEN (DATEDIFF(day, dt14, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_15,0) >= 30 THEN (DATEDIFF(day, dt15, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_16,0) >= 30 THEN (DATEDIFF(day, dt16, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_17,0) >= 30 THEN (DATEDIFF(day, dt17, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_18,0) >= 30 THEN (DATEDIFF(day, dt18, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_19,0) >= 30 THEN (DATEDIFF(day, dt19, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_20,0) >= 30 THEN (DATEDIFF(day, dt20, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_21,0) >= 30 THEN (DATEDIFF(day, dt21, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_22,0) >= 30 THEN (DATEDIFF(day, dt22, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_23,0) >= 30 THEN (DATEDIFF(day, dt23, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_24,0) >= 30 THEN (DATEDIFF(day, dt24, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_25,0) >= 30 THEN (DATEDIFF(day, dt25, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_26,0) >= 30 THEN (DATEDIFF(day, dt26, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_27,0) >= 30 THEN (DATEDIFF(day, dt27, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_28,0) >= 30 THEN (DATEDIFF(day, dt28, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_29,0) >= 30 THEN (DATEDIFF(day, dt29, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_30,0) >= 30 THEN (DATEDIFF(day, dt30, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_31,0) >= 30 THEN (DATEDIFF(day, dt31, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_32,0) >= 30 THEN (DATEDIFF(day, dt32, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_33,0) >= 30 THEN (DATEDIFF(day, dt33, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_34,0) >= 30 THEN (DATEDIFF(day, dt34, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_35,0) >= 30 THEN (DATEDIFF(day, dt35, scrub_date) - 1)::DECIMAL / 30.5
            WHEN coalesce(payhist_36,0) >= 30 THEN (DATEDIFF(day, dt36, scrub_date) - 1)::DECIMAL / 30.5
            ELSE NULL
        END AS time_since_last_30p

from sandbox.PP_HS_BASE_BU_TL_9;


drop table if exists PP_HS_BASE_BU_TL_11;
create TEMP table PP_HS_BASE_BU_TL_11 as
select *,

greatest(
        coalesce(t_1,0), coalesce(t_2,0), coalesce(t_3,0),
        coalesce(t_4,0), coalesce(t_5,0), coalesce(t_6,0)
    )::int as max_dpd_l6m_tr,

greatest(
        coalesce(t_1,0), coalesce(t_2,0), coalesce(t_3,0),
        coalesce(t_4,0), coalesce(t_5,0), coalesce(t_6,0),
        coalesce(t_7,0), coalesce(t_8,0), coalesce(t_9,0)
    )::int as max_dpd_l9m_tr,

greatest(
        coalesce(t_1,0), coalesce(t_2,0), coalesce(t_3,0),
        coalesce(t_4,0), coalesce(t_5,0), coalesce(t_6,0),
        coalesce(t_7,0), coalesce(t_8,0), coalesce(t_9,0),
        coalesce(t_10,0), coalesce(t_11,0), coalesce(t_12,0)
    )::int as max_dpd_l12m_tr,

GREATEST(
            COALESCE(payhist_1,0),  COALESCE(payhist_2,0),
            COALESCE(payhist_3,0),  COALESCE(payhist_4,0),
            COALESCE(payhist_5,0),  COALESCE(payhist_6,0),
            COALESCE(payhist_7,0),  COALESCE(payhist_8,0),
            COALESCE(payhist_9,0),  COALESCE(payhist_10,0),
            COALESCE(payhist_11,0), COALESCE(payhist_12,0),
            COALESCE(payhist_13,0), COALESCE(payhist_14,0),
            COALESCE(payhist_15,0), COALESCE(payhist_16,0),
            COALESCE(payhist_17,0), COALESCE(payhist_18,0),
            COALESCE(payhist_19,0), COALESCE(payhist_20,0),
            COALESCE(payhist_21,0), COALESCE(payhist_22,0),
            COALESCE(payhist_23,0), COALESCE(payhist_24,0),
            COALESCE(payhist_25,0), COALESCE(payhist_26,0),
            COALESCE(payhist_27,0), COALESCE(payhist_28,0),
            COALESCE(payhist_29,0), COALESCE(payhist_30,0),
            COALESCE(payhist_31,0), COALESCE(payhist_32,0),
            COALESCE(payhist_33,0), COALESCE(payhist_34,0),
            COALESCE(payhist_35,0), COALESCE(payhist_36,0)
        ) AS max_dpd
 from PP_HS_BASE_BU_TL_10;

drop table if exists PP_HS_BASE_BU_TL_12;
create TEMP table PP_HS_BASE_BU_TL_12 as
select crn,reference_date,report_month,

MIN(CASE WHEN f_pl = 1 AND f_onc = 1 THEN time_since_tr_open END) AS MONSNCLASTTROP_PL_ONC,
MIN(CASE WHEN f_uns = 1 AND f_onc = 1 THEN time_since_tr_open END) AS MONSNCLASTTROP_UNS_ONC,

SUM(case when f_pl =1 and  f_onc = 1 and (date_opened >= dateadd(month,-6,scrub_date)) then 1 else null end)  AS NO_TR_OPEN_L6M_PL_ONC,
 SUM(f_all * f_onc)         AS NO_TRADES_ALL_ONC,


max(case when coalesce(f_cc,0)=1 then max_dpd_l6m_tr end) as max_dpd_l6m_cc_onc,
max(case when coalesce(f_pl,0)=1  then max_dpd_l6m_tr  end) as max_dpd_l6m_pl_onc,
max(case when coalesce(f_cc,0)=1 then max_dpd_l9m_tr end) as max_dpd_l9m_cc_onc,
min(case when coalesce(f_uns,0)=1 and coalesce(open_flag,0)=1 then time_since_last_0p end) as mon_sin_last_0p_uns_op,
min(case when coalesce(f_pl,0)=1 then time_since_last_0p end) as monsinlast_0p_pl_onc,

case when sum(coalesce(valid_pymt_cnt_last24m,0))=0
         then null
         else 100.0 * sum(coalesce(cnt_0p_last24m,0)) / nullif(sum(coalesce(valid_pymt_cnt_last24m,0)),0)
    end as pct_0p_l24m_all_onc,

case when sum(case when coalesce(f_pl,0)=1 then coalesce(valid_pymt_cnt_last24m,0) else 0 end)=0
         then null
         else 100.0 * sum(case when coalesce(f_pl,0)=1 then coalesce(cnt_0p_last24m,0) else 0 end)
                    / nullif(sum(case when coalesce(f_pl,0)=1 then coalesce(valid_pymt_cnt_last24m,0) else 0 end),0)
    end as pct_0p_l24m_pl_onc,

case when sum(coalesce(valid_pymt_cnt_last18m,0))=0 then null
         else 100.0*sum(coalesce(missed_pymt_cnt_last18m,0))/nullif(sum(coalesce(valid_pymt_cnt_last18m,0)),0)
    end as pct_missed_pymt_last18m_all,

ROUND(
            100.0 * SUM(
                CASE
                    WHEN ACCOUNT_TYPE_CD IS NOT NULL
                     AND (open_flag = 1 OR date_closed >= dateadd(month, -12, scrub_date))
                     AND max_dpd_l12m_tr > 0
                    THEN 1 ELSE NULL
                END
            )
            / NULLIF(
                SUM(
                    CASE
                        WHEN ACCOUNT_TYPE_CD IS NOT NULL
                         AND (open_flag = 1 OR date_closed >= dateadd(month, -12, scrub_date))
                        THEN 1 ELSE NULL
                    END
                ), 0
            )
        ,4) AS pct_tr_0p_l12m_all_onc,

SUM(CASE
            WHEN ACCOUNT_TYPE_CD IN (05,69)
             AND open_flag = 0 THEN 1 ELSE 0 END
        ) AS cnt_closed_pl,

SUM(CASE
            WHEN ACCOUNT_TYPE_CD IN (05,69)
             AND open_flag = 0
             AND max_dpd < 1 THEN 1 ELSE 0 END
        ) AS cnt_good_closed_pl,

SUM(CASE WHEN (account_type_cd IN (5,69) AND open_flag = 1)
            THEN sanction_amount ELSE 0 END) AS sum_sanc_amt_pl_lv,
SUM(CASE WHEN account_type_cd in (10, 16, 31, 35, 36) AND open_flag = 1
            THEN sanction_amount ELSE 0 END) AS sum_sanc_amt_cc_lv,     

 MAX(CASE WHEN f_cc = 1 and f_lv =1 then time_since_tr_open  ELSE NULL END) AS MONSNCFIRSTTROP_CC_LV,

        MIN(CASE WHEN f_allsal1l = 1 and f_onc =1 then time_since_tr_open  ELSE NULL END) AS MONSNCLASTTROP_ALLSAL1L_ONC,

        MAX(CASE WHEN f_lv =1 then time_since_tr_open  ELSE NULL END) AS MONSNCFIRSTTROP_ALL_LV,

        MAX(CASE WHEN f_allsag20k = 1 and f_lv =1 then time_since_tr_open  ELSE NULL END) AS MONSNCFIRSTTROP_ALL_SAG20K_LV,

        -- MAX(CASE WHEN f_allsag1l = 1 and f_onc =1 then time_since_tr_open  ELSE NULL END) AS MONSNCFIRSTTROP_ALLSAG1L_ONC,

        MIN(CASE WHEN f_hra = 1 and f_onc =1 then time_since_tr_open  ELSE NULL END) AS MONSNCLASTTROP_HRA_ONC,

        MAX(CASE WHEN f_exccgled = 1 and f_lv =1 then time_since_tr_open  ELSE NULL END) AS MONSNCFIRSTTROP_EXCCGLED_LV,

        MIN(CASE WHEN f_pl = 1 and f_allsag20k=1 and  f_onc =1 then time_since_tr_open  ELSE NULL END) AS MONSNCLASTTROP_PL_SAG20K_ONC,


        MAX(CASE WHEN f_allsag1l = 1 and f_lv =1 then time_since_tr_open  ELSE NULL END) AS MONSNCFIRSTTROP_ALLSAG1L_LV,
        MAX(CASE WHEN f_allsal1l = 1 and f_lv =1 then time_since_tr_open  ELSE NULL END) AS MONSNCFIRSTTROP_ALLSAL1L_LV,

        


        MAX(CASE WHEN f_cc = 1 and f_onc =1 then time_since_tr_open  ELSE NULL END) AS MONSNCFIRSTTROP_CC_ONC,
        MAX(CASE WHEN f_onc=1 then time_since_tr_open  ELSE NULL END) AS MONSNCFIRSTTROP_ALL_ONC,
        MAX(CASE WHEN f_exc_cc = 1 and f_onc =1 then time_since_tr_open  ELSE NULL END) AS TIMESNCFIRSTTROP_EXC_CC_ONC,


        MIN(CASE WHEN f_exccgled = 1 and f_lv =1 then time_since_tr_open  ELSE NULL END) AS monsnclasttrop_exccgled_lv,

        MIN(CASE WHEN f_cc = 1 and f_onc =1 then time_since_tr_open  ELSE NULL END) AS monsnclasttrop_cc_onc,


        MIN(CASE WHEN f_allsal1l = 1 and f_lv =1 then time_since_tr_open  ELSE NULL END) AS MONSNCLASTTROP_ALLSAL1L_LV,


        MIN(CASE WHEN f_exccgled = 1 and f_onc =1 then time_since_tr_open  ELSE NULL END) AS MONSNCLASTTROP_EXCCGLED_ONC,
        -- MIN(CASE WHEN f_uns = 1 and f_onc =1 then time_since_tr_open  ELSE NULL END) AS MONSNCLASTTROP_UNS_ONC,

        MIN(CASE WHEN f_pl = 1 and f_allsal20k = 1 and f_onc =1 then time_since_tr_open  ELSE NULL END) AS monsnclasttrop_pl_sal20k_onc,
        MIN(CASE WHEN f_pl = 1 and f_allsag20k = 1 and f_onc =1 then time_since_tr_close ELSE NULL END) AS monsnclasttrcl_pl_sag20k_onc,
           -- -------- CONSUMER DURABLE --------
        MAX(CASE WHEN f_cd = 1 AND f_onc = 1 THEN time_since_tr_open ELSE NULL END) AS MONSNCFIRSTTROP_CD_ONC,
        MIN(CASE WHEN f_cd = 1 AND f_onc = 1 THEN time_since_tr_open ELSE NULL END) AS MONSNCLASTTROP_CD_ONC,
        SUM(CASE WHEN f_cd = 1 AND f_onc = 1 THEN 1 ELSE 0 END) AS NO_TRADES_CD_ONC,

        -- -------- ALL_SAG20K --------
        MAX(CASE WHEN f_allsag20k = 1 AND f_onc = 1 THEN time_since_tr_open ELSE NULL END) AS MONSNCFIRSTTROP_ALL_SAG20K_ONC,
        MIN(CASE WHEN f_allsag20k = 1 AND f_onc = 1 THEN time_since_tr_open ELSE NULL END) AS MONSNCLASTTROP_ALL_SAG20K_ONC,
        SUM(CASE WHEN f_allsag20k = 1 AND f_onc = 1 THEN 1 ELSE 0 END) AS NO_TRADES_ALL_SAG20K_ONC,

        -- -------- ALL_SAG1L --------
        MAX(CASE WHEN f_allsag1l = 1 AND f_onc = 1 THEN time_since_tr_open ELSE NULL END) AS MONSNCFIRSTTROP_allSAG1L_ONC,
        MIN(CASE WHEN f_allsag1l = 1 AND f_onc = 1 THEN time_since_tr_open ELSE NULL END) AS MONSNCLASTTROP_allSAG1L_ONC,
        SUM(CASE WHEN f_allsag1l = 1 AND f_onc = 1 THEN 1 ELSE 0 END) AS NO_TRADES_allSAG1L_ONC,

      
           -- UNS:
           MAX(CASE WHEN f_uns = 1 AND f_onc = 1 THEN time_since_tr_open END) AS MONSNCFIRSTTROP_UNS_ONC,
        --    MIN(CASE WHEN f_uns = 1 AND f_onc = 1 THEN time_since_tr_open END) AS MONSNCLASTTROP_UNS_ONC,
           SUM(CASE WHEN f_uns = 1 AND f_onc = 1 THEN 1 ELSE 0 END) AS NO_TRADES_UNS_ONC,

           -- BL:
          MAX(CASE WHEN f_bl = 1 AND f_onc = 1 THEN time_since_tr_open END) AS MONSNCFIRSTTROP_BL_ONC,
            MIN(CASE WHEN f_bl = 1 AND f_onc = 1 THEN time_since_tr_open END) AS MONSNCLASTTROP_BL_ONC,
           SUM(CASE WHEN f_bl = 1 AND f_onc = 1 THEN 1 ELSE 0 END) AS NO_TRADES_BL_ONC,

           -- PL:
            MAX(CASE WHEN f_pl = 1 AND f_onc = 1 THEN time_since_tr_open END) AS MONSNCFIRSTTROP_PL_ONC,
            -- MIN(CASE WHEN f_pl = 1 AND f_onc = 1 THEN time_since_tr_open END) AS MONSNCLASTTROP_PL_ONC,
            SUM(CASE WHEN f_pl = 1 AND f_onc = 1 THEN 1 ELSE 0 END) AS NO_TRADES_PL_ONC,


            MAX(CASE WHEN f_plbl = 1 AND f_onc = 1 AND date_opened >= dateadd(month,-12,scrub_date) THEN time_since_tr_open END) AS MONSNCFIRSTTROP_PLBL_ONC_L12M,
            MIN(CASE WHEN f_plbl = 1 AND f_onc = 1 AND date_opened >= dateadd(month,-12,scrub_date) THEN time_since_tr_open END) AS MONSNCLASTTROP_PLBL_ONC_L12M,
            SUM(CASE WHEN f_plbl = 1 AND f_onc = 1 AND date_opened >= dateadd(month,-12,scrub_date) THEN 1 ELSE 0 END) AS NO_TRADES_PLBL_ONC_L12M,


        -- ---------------- PLBL — last 6 months ----------------
        MAX(CASE WHEN f_plbl = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -6, scrub_date)
                 THEN time_since_tr_open END) AS MONSNCFIRSTTROP_PLBL_ONC_L6M,
        MIN(CASE WHEN f_plbl = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -6, scrub_date)
                 THEN time_since_tr_open END) AS MONSNCLASTTROP_PLBL_ONC_L6M,
        SUM(CASE WHEN f_plbl = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -6, scrub_date)
                 THEN 1 ELSE 0 END) AS NO_TRADES_PLBL_ONC_L6M,

        -- ---------------- HL_LAP — last 9 months ----------------
        MAX(CASE WHEN f_hllap = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -9, scrub_date)
                 THEN time_since_tr_open END) AS MONSNCFIRSTTROP_HL_LAP_ONC_L9M,
        MIN(CASE WHEN f_hllap = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -9, scrub_date)
                 THEN time_since_tr_open END) AS MONSNCLASTTROP_HL_LAP_ONC_L9M,
        SUM(CASE WHEN f_hllap = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -9, scrub_date)
                 THEN 1 ELSE 0 END) AS NO_TRADES_HL_LAP_ONC_L9M,

        -- ---------------- TWL — last 24 months ----------------
        MAX(CASE WHEN f_twl = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -24, scrub_date)
                 THEN time_since_tr_open END) AS MONSNCFIRSTTROP_TWL_ONC_L24M,
        MIN(CASE WHEN f_twl = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -24, scrub_date)
                 THEN time_since_tr_open END) AS MONSNCLASTTROP_TWL_ONC_L24M,
        SUM(CASE WHEN f_twl = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -24, scrub_date)
                 THEN 1 ELSE 0 END) AS NO_TRADES_TWL_ONC_L24M,

        -- ---------------- HL_LAP — last 24 months ----------------
        MAX(CASE WHEN f_hllap = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -24, scrub_date)
                 THEN time_since_tr_open END) AS MONSNCFIRSTTROP_HL_LAP_ONC_L24M,
        MIN(CASE WHEN f_hllap = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -24, scrub_date)
                 THEN time_since_tr_open END) AS MONSNCLASTTROP_HL_LAP_ONC_L24M,
        SUM(CASE WHEN f_hllap = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -24, scrub_date)
                 THEN 1 ELSE 0 END) AS NO_TRADES_HL_LAP_ONC_L24M,

        -- ---------------- ALL — last 24 months ----------------
        MAX(CASE WHEN f_all = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -24, scrub_date)
                 THEN time_since_tr_open END) AS MONSNCFIRSTTROP_ALL_ONC_L24M,
        MIN(CASE WHEN f_all = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -24, scrub_date)
                 THEN time_since_tr_open END) AS MONSNCLASTTROP_ALL_ONC_L24M,
        SUM(CASE WHEN f_all = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -24, scrub_date)
                 THEN 1 ELSE 0 END) AS NO_TRADES_ALL_ONC_L24M,

        -- ---------------- CL — last 12 months ----------------
        MAX(CASE WHEN f_cd = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -12, scrub_date)
                 THEN time_since_tr_open END) AS MONSNCFIRSTTROP_CL_ONC_L12M,
        MIN(CASE WHEN f_cd = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -12, scrub_date)
                 THEN time_since_tr_open END) AS MONSNCLASTTROP_CL_ONC_L12M,
        SUM(CASE WHEN f_cd = 1 AND f_onc = 1 AND date_opened >= dateadd(month, -12, scrub_date)
                 THEN 1 ELSE 0 END) AS NO_TRADES_CL_ONC_L12M,

        SUM(CASE WHEN (account_type_cd in (10, 16, 31, 35, 36) AND open_flag = 1)
            THEN out_standing_balance ELSE 0 END) AS sum_currbal_cc_lv,
        SUM(CASE WHEN (account_type_cd IN (5,69) AND open_flag = 1)
            THEN out_standing_balance ELSE 0 END) AS sum_currbal_pl_lv,

sum(case when f_uns = 1 and f_onc = 1 and (date_opened >= dateadd(month,-24,scrub_date)) then 1 else null end) as no_tr_open_l24m_uns_onc

from PP_HS_BASE_BU_TL_11
group by crn,reference_date,report_month;

drop table if exists PP_HS_BASE_BU_TL_13;
create table PP_HS_BASE_BU_TL_13 as
select *,
CASE WHEN sum_sanc_amt_cc_lv = 0 THEN NULL
         ELSE ROUND((sum_currbal_cc_lv / sum_sanc_amt_cc_lv) * 100, 4) END AS pct_bal_cc_lv,

CASE WHEN sum_sanc_amt_pl_lv = 0 THEN NULL
         ELSE ROUND((sum_currbal_pl_lv / sum_sanc_amt_pl_lv) * 100, 4) END AS pct_bal_pl_lv,

CASE 
        WHEN (MONSNCFIRSTTROP_CL_ONC_L12M <= 0 OR MONSNCFIRSTTROP_CL_ONC_L12M IS NULL)
          OR (MONSNCLASTTROP_CL_ONC_L12M <= 0 OR MONSNCLASTTROP_CL_ONC_L12M IS NULL)
          OR (NO_TRADES_CL_ONC_L12M <= 0 OR NO_TRADES_CL_ONC_L12M IS NULL)
        THEN NULL
        ELSE (MONSNCFIRSTTROP_CL_ONC_L12M - MONSNCLASTTROP_CL_ONC_L12M) / NO_TRADES_CL_ONC_L12M
    END AS interpurchase_time_l12m_CL,

CASE 
        WHEN (MONSNCFIRSTTROP_PLBL_ONC_L12M <= 0 OR MONSNCFIRSTTROP_PLBL_ONC_L12M IS NULL)
          OR (MONSNCLASTTROP_PLBL_ONC_L12M <= 0 OR MONSNCLASTTROP_PLBL_ONC_L12M IS NULL)
          OR (NO_TRADES_PLBL_ONC_L12M <= 0 OR NO_TRADES_PLBL_ONC_L12M IS NULL)
        THEN NULL
        ELSE (MONSNCFIRSTTROP_PLBL_ONC_L12M - MONSNCLASTTROP_PLBL_ONC_L12M) / NO_TRADES_PLBL_ONC_L12M
      END AS interpurchase_time_l12m_PLBL,

CASE 
        WHEN (MONSNCFIRSTTROP_ALL_ONC_L24M <= 0 OR MONSNCFIRSTTROP_ALL_ONC_L24M IS NULL)
          OR (MONSNCLASTTROP_ALL_ONC_L24M <= 0 OR MONSNCLASTTROP_ALL_ONC_L24M IS NULL)
          OR (NO_TRADES_ALL_ONC_L24M <= 0 OR NO_TRADES_ALL_ONC_L24M IS NULL)
        THEN NULL
        ELSE (MONSNCFIRSTTROP_ALL_ONC_L24M - MONSNCLASTTROP_ALL_ONC_L24M) / NO_TRADES_ALL_ONC_L24M
    END AS interpurchase_time_l24m_ALL,

CASE 
        WHEN (MONSNCFIRSTTROP_HL_LAP_ONC_L24M <= 0 OR MONSNCFIRSTTROP_HL_LAP_ONC_L24M IS NULL)
          OR (MONSNCLASTTROP_HL_LAP_ONC_L24M <= 0 OR MONSNCLASTTROP_HL_LAP_ONC_L24M IS NULL)
          OR (NO_TRADES_HL_LAP_ONC_L24M <= 0 OR NO_TRADES_HL_LAP_ONC_L24M IS NULL)
        THEN NULL
        ELSE (MONSNCFIRSTTROP_HL_LAP_ONC_L24M - MONSNCLASTTROP_HL_LAP_ONC_L24M) / NO_TRADES_HL_LAP_ONC_L24M
    END AS interpurchase_time_l24m_HL_LAP,

CASE 
        WHEN (MONSNCFIRSTTROP_TWL_ONC_L24M <= 0 OR MONSNCFIRSTTROP_TWL_ONC_L24M IS NULL)
          OR (MONSNCLASTTROP_TWL_ONC_L24M <= 0 OR MONSNCLASTTROP_TWL_ONC_L24M IS NULL)
          OR (NO_TRADES_TWL_ONC_L24M <= 0 OR NO_TRADES_TWL_ONC_L24M IS NULL)
        THEN NULL
        ELSE (MONSNCFIRSTTROP_TWL_ONC_L24M - MONSNCLASTTROP_TWL_ONC_L24M) / NO_TRADES_TWL_ONC_L24M
    END AS interpurchase_time_l24m_TWL,

CASE 
        WHEN (MONSNCFIRSTTROP_PLBL_ONC_L6M <= 0 OR MONSNCFIRSTTROP_PLBL_ONC_L6M IS NULL)
          OR (MONSNCLASTTROP_PLBL_ONC_L6M <= 0 OR MONSNCLASTTROP_PLBL_ONC_L6M IS NULL)
          OR (NO_TRADES_PLBL_ONC_L6M <= 0 OR NO_TRADES_PLBL_ONC_L6M IS NULL)
        THEN NULL
        ELSE (MONSNCFIRSTTROP_PLBL_ONC_L6M - MONSNCLASTTROP_PLBL_ONC_L6M) / NO_TRADES_PLBL_ONC_L6M
    END AS interpurchase_time_l6m_PLBL,
CASE 
        WHEN (MONSNCFIRSTTROP_HL_LAP_ONC_L9M <= 0 OR MONSNCFIRSTTROP_HL_LAP_ONC_L9M IS NULL)
          OR (MONSNCLASTTROP_HL_LAP_ONC_L9M <= 0 OR MONSNCLASTTROP_HL_LAP_ONC_L9M IS NULL)
          OR (NO_TRADES_HL_LAP_ONC_L9M <= 0 OR NO_TRADES_HL_LAP_ONC_L9M IS NULL)
        THEN NULL
        ELSE (MONSNCFIRSTTROP_HL_LAP_ONC_L9M - MONSNCLASTTROP_HL_LAP_ONC_L9M) / NO_TRADES_HL_LAP_ONC_L9M
    END AS interpurchase_time_l9m_HL_LAP

from PP_HS_BASE_BU_TL_12;

drop table if exists SANDBOX.PP_HS_BASE_BU_TL_13;
create table SANDBOX.PP_HS_BASE_BU_TL_13 as
SELECT * FROM PP_HS_BASE_BU_TL_13;

SELECT * FROM PP_HS_BASE_BU_TL_13;