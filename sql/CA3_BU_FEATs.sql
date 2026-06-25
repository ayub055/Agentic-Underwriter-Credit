-- DPD recency
drop table if exists PP_HS_BASE_BU_TL_7;
create TEMP table PP_HS_BASE_BU_TL_7 as
select *,
-- ================== recency_wtd_avg_dpd_l3m (t_3..t_1) ==================
        CASE
            WHEN t.t_1 IS NULL AND t.t_2 IS NULL AND t.t_3 IS NULL THEN NULL
            ELSE
                (
                    (CASE WHEN t.t_1 IS NOT NULL THEN t.t_1 * ((3-0)/3) ELSE 0 END) +
                    (CASE WHEN t.t_2 IS NOT NULL THEN t.t_2 * ((3-1)/3) ELSE 0 END) +
                    (CASE WHEN t.t_3 IS NOT NULL THEN t.t_3 * ((3-2)/3) ELSE 0 END)
                )
                /
                NULLIF(
                    (CASE WHEN t.t_1 IS NOT NULL THEN ((3-0)/3) ELSE 0 END) +
                    (CASE WHEN t.t_2 IS NOT NULL THEN ((3-1)/3) ELSE 0 END) +
                    (CASE WHEN t.t_3 IS NOT NULL THEN ((3-2)/3) ELSE 0 END),
                    0
                )
        END AS recency_wtd_avg_dpd_l3m,

        -- ================== recency_wtd_avg_dpd_l6m (t_6..t_1) ==================
        CASE
            WHEN t.t_1 IS NULL AND t.t_2 IS NULL AND t.t_3 IS NULL
             AND t.t_4 IS NULL AND t.t_5 IS NULL AND t.t_6 IS NULL THEN NULL
            ELSE
                (
                    (CASE WHEN t.t_1 IS NOT NULL THEN t.t_1 * ((6-0)/6) ELSE 0 END) +
                    (CASE WHEN t.t_2 IS NOT NULL THEN t.t_2 * ((6-1)/6) ELSE 0 END) +
                    (CASE WHEN t.t_3 IS NOT NULL THEN t.t_3 * ((6-2)/6) ELSE 0 END) +
                    (CASE WHEN t.t_4 IS NOT NULL THEN t.t_4 * ((6-3)/6) ELSE 0 END) +
                    (CASE WHEN t.t_5 IS NOT NULL THEN t.t_5 * ((6-4)/6) ELSE 0 END) +
                    (CASE WHEN t.t_6 IS NOT NULL THEN t.t_6 * ((6-5)/6) ELSE 0 END)
                )
                /
                NULLIF(
                    (CASE WHEN t.t_1 IS NOT NULL THEN ((6-0)/6) ELSE 0 END) +
                    (CASE WHEN t.t_2 IS NOT NULL THEN ((6-1)/6) ELSE 0 END) +
                    (CASE WHEN t.t_3 IS NOT NULL THEN ((6-2)/6) ELSE 0 END) +
                    (CASE WHEN t.t_4 IS NOT NULL THEN ((6-3)/6) ELSE 0 END) +
                    (CASE WHEN t.t_5 IS NOT NULL THEN ((6-4)/6) ELSE 0 END) +
                    (CASE WHEN t.t_6 IS NOT NULL THEN ((6-5)/6) ELSE 0 END),
                    0
                )
        END AS recency_wtd_avg_dpd_l6m,

        -- ================== recency_wtd_avg_dpd_l9m (t_9..t_1) ==================
        CASE
            WHEN t.t_1 IS NULL AND t.t_2 IS NULL AND t.t_3 IS NULL
             AND t.t_4 IS NULL AND t.t_5 IS NULL AND t.t_6 IS NULL
             AND t.t_7 IS NULL AND t.t_8 IS NULL AND t.t_9 IS NULL THEN NULL
            ELSE
                (
                    (CASE WHEN t.t_1 IS NOT NULL THEN t.t_1 * ((9-0)/9) ELSE 0 END) +
                    (CASE WHEN t.t_2 IS NOT NULL THEN t.t_2 * ((9-1)/9) ELSE 0 END) +
                    (CASE WHEN t.t_3 IS NOT NULL THEN t.t_3 * ((9-2)/9) ELSE 0 END) +
                    (CASE WHEN t.t_4 IS NOT NULL THEN t.t_4 * ((9-3)/9) ELSE 0 END) +
                    (CASE WHEN t.t_5 IS NOT NULL THEN t.t_5 * ((9-4)/9) ELSE 0 END) +
                    (CASE WHEN t.t_6 IS NOT NULL THEN t.t_6 * ((9-5)/9) ELSE 0 END) +
                    (CASE WHEN t.t_7 IS NOT NULL THEN t.t_7 * ((9-6)/9) ELSE 0 END) +
                    (CASE WHEN t.t_8 IS NOT NULL THEN t.t_8 * ((9-7)/9) ELSE 0 END) +
                    (CASE WHEN t.t_9 IS NOT NULL THEN t.t_9 * ((9-8)/9) ELSE 0 END)
                )
                /
                NULLIF(
                    (CASE WHEN t.t_1 IS NOT NULL THEN ((9-0)/9) ELSE 0 END) +
                    (CASE WHEN t.t_2 IS NOT NULL THEN ((9-1)/9) ELSE 0 END) +
                    (CASE WHEN t.t_3 IS NOT NULL THEN ((9-2)/9) ELSE 0 END) +
                    (CASE WHEN t.t_4 IS NOT NULL THEN ((9-3)/9) ELSE 0 END) +
                    (CASE WHEN t.t_5 IS NOT NULL THEN ((9-4)/9) ELSE 0 END) +
                    (CASE WHEN t.t_6 IS NOT NULL THEN ((9-5)/9) ELSE 0 END) +
                    (CASE WHEN t.t_7 IS NOT NULL THEN ((9-6)/9) ELSE 0 END) +
                    (CASE WHEN t.t_8 IS NOT NULL THEN ((9-7)/9) ELSE 0 END) +
                    (CASE WHEN t.t_9 IS NOT NULL THEN ((9-8)/9) ELSE 0 END),
                    0
                )
        END AS recency_wtd_avg_dpd_l9m,

        -- ================== recency_wtd_avg_dpd_l12m (t_12..t_1) ==================
        CASE
            WHEN t.t_1  IS NULL AND t.t_2  IS NULL AND t.t_3  IS NULL AND t.t_4  IS NULL
             AND t.t_5  IS NULL AND t.t_6  IS NULL AND t.t_7  IS NULL AND t.t_8  IS NULL
             AND t.t_9  IS NULL AND t.t_10 IS NULL AND t.t_11 IS NULL AND t.t_12 IS NULL
            THEN NULL
            ELSE
                (
                    (CASE WHEN t.t_1  IS NOT NULL THEN t.t_1  * ((12-0)/12) ELSE 0 END) +
                    (CASE WHEN t.t_2  IS NOT NULL THEN t.t_2  * ((12-1)/12) ELSE 0 END) +
                    (CASE WHEN t.t_3  IS NOT NULL THEN t.t_3  * ((12-2)/12) ELSE 0 END) +
                    (CASE WHEN t.t_4  IS NOT NULL THEN t.t_4  * ((12-3)/12) ELSE 0 END) +
                    (CASE WHEN t.t_5  IS NOT NULL THEN t.t_5  * ((12-4)/12) ELSE 0 END) +
                    (CASE WHEN t.t_6  IS NOT NULL THEN t.t_6  * ((12-5)/12) ELSE 0 END) +
                    (CASE WHEN t.t_7  IS NOT NULL THEN t.t_7  * ((12-6)/12) ELSE 0 END) +
                    (CASE WHEN t.t_8  IS NOT NULL THEN t.t_8  * ((12-7)/12) ELSE 0 END) +
                    (CASE WHEN t.t_9  IS NOT NULL THEN t.t_9  * ((12-8)/12) ELSE 0 END) +
                    (CASE WHEN t.t_10 IS NOT NULL THEN t.t_10 * ((12-9)/12) ELSE 0 END) +
                    (CASE WHEN t.t_11 IS NOT NULL THEN t.t_11 * ((12-10)/12) ELSE 0 END) +
                    (CASE WHEN t.t_12 IS NOT NULL THEN t.t_12 * ((12-11)/12) ELSE 0 END)
                )
                /
                NULLIF(
                    (CASE WHEN t.t_1  IS NOT NULL THEN ((12-0)/12) ELSE 0 END) +
                    (CASE WHEN t.t_2  IS NOT NULL THEN ((12-1)/12) ELSE 0 END) +
                    (CASE WHEN t.t_3  IS NOT NULL THEN ((12-2)/12) ELSE 0 END) +
                    (CASE WHEN t.t_4  IS NOT NULL THEN ((12-3)/12) ELSE 0 END) +
                    (CASE WHEN t.t_5  IS NOT NULL THEN ((12-4)/12) ELSE 0 END) +
                    (CASE WHEN t.t_6  IS NOT NULL THEN ((12-5)/12) ELSE 0 END) +
                    (CASE WHEN t.t_7  IS NOT NULL THEN ((12-6)/12) ELSE 0 END) +
                    (CASE WHEN t.t_8  IS NOT NULL THEN ((12-7)/12) ELSE 0 END) +
                    (CASE WHEN t.t_9  IS NOT NULL THEN ((12-8)/12) ELSE 0 END) +
                    (CASE WHEN t.t_10 IS NOT NULL THEN ((12-9)/12) ELSE 0 END) +
                    (CASE WHEN t.t_11 IS NOT NULL THEN ((12-10)/12) ELSE 0 END) +
                    (CASE WHEN t.t_12 IS NOT NULL THEN ((12-11)/12) ELSE 0 END),
                    0
                )
        END AS recency_wtd_avg_dpd_l12m,

        -- ================== recency_wtd_avg_dpd_l18m (t_18..t_1) ==================
        CASE
            WHEN t.t_1  IS NULL AND t.t_2  IS NULL AND t.t_3  IS NULL AND t.t_4  IS NULL
             AND t.t_5  IS NULL AND t.t_6  IS NULL AND t.t_7  IS NULL AND t.t_8  IS NULL
             AND t.t_9  IS NULL AND t.t_10 IS NULL AND t.t_11 IS NULL AND t.t_12 IS NULL
             AND t.t_13 IS NULL AND t.t_14 IS NULL AND t.t_15 IS NULL AND t.t_16 IS NULL
             AND t.t_17 IS NULL AND t.t_18 IS NULL
            THEN NULL
            ELSE
                (
                    (CASE WHEN t.t_1  IS NOT NULL THEN t.t_1  * ((18-0)/18) ELSE 0 END) +
                    (CASE WHEN t.t_2  IS NOT NULL THEN t.t_2  * ((18-1)/18) ELSE 0 END) +
                    (CASE WHEN t.t_3  IS NOT NULL THEN t.t_3  * ((18-2)/18) ELSE 0 END) +
                    (CASE WHEN t.t_4  IS NOT NULL THEN t.t_4  * ((18-3)/18) ELSE 0 END) +
                    (CASE WHEN t.t_5  IS NOT NULL THEN t.t_5  * ((18-4)/18) ELSE 0 END) +
                    (CASE WHEN t.t_6  IS NOT NULL THEN t.t_6  * ((18-5)/18) ELSE 0 END) +
                    (CASE WHEN t.t_7  IS NOT NULL THEN t.t_7  * ((18-6)/18) ELSE 0 END) +
                    (CASE WHEN t.t_8  IS NOT NULL THEN t.t_8  * ((18-7)/18) ELSE 0 END) +
                    (CASE WHEN t.t_9  IS NOT NULL THEN t.t_9  * ((18-8)/18) ELSE 0 END) +
                    (CASE WHEN t.t_10 IS NOT NULL THEN t.t_10 * ((18-9)/18) ELSE 0 END) +
                    (CASE WHEN t.t_11 IS NOT NULL THEN t.t_11 * ((18-10)/18) ELSE 0 END) +
                    (CASE WHEN t.t_12 IS NOT NULL THEN t.t_12 * ((18-11)/18) ELSE 0 END) +
                    (CASE WHEN t.t_13 IS NOT NULL THEN t.t_13 * ((18-12)/18) ELSE 0 END) +
                    (CASE WHEN t.t_14 IS NOT NULL THEN t.t_14 * ((18-13)/18) ELSE 0 END) +
                    (CASE WHEN t.t_15 IS NOT NULL THEN t.t_15 * ((18-14)/18) ELSE 0 END) +
                    (CASE WHEN t.t_16 IS NOT NULL THEN t.t_16 * ((18-15)/18) ELSE 0 END) +
                    (CASE WHEN t.t_17 IS NOT NULL THEN t.t_17 * ((18-16)/18) ELSE 0 END) +
                    (CASE WHEN t.t_18 IS NOT NULL THEN t.t_18 * ((18-17)/18) ELSE 0 END)
                )
                /
                NULLIF(
                    (CASE WHEN t.t_1  IS NOT NULL THEN ((18-0)/18) ELSE 0 END) +
                    (CASE WHEN t.t_2  IS NOT NULL THEN ((18-1)/18) ELSE 0 END) +
                    (CASE WHEN t.t_3  IS NOT NULL THEN ((18-2)/18) ELSE 0 END) +
                    (CASE WHEN t.t_4  IS NOT NULL THEN ((18-3)/18) ELSE 0 END) +
                    (CASE WHEN t.t_5  IS NOT NULL THEN ((18-4)/18) ELSE 0 END) +
                    (CASE WHEN t.t_6  IS NOT NULL THEN ((18-5)/18) ELSE 0 END) +
                    (CASE WHEN t.t_7  IS NOT NULL THEN ((18-6)/18) ELSE 0 END) +
                    (CASE WHEN t.t_8  IS NOT NULL THEN ((18-7)/18) ELSE 0 END) +
                    (CASE WHEN t.t_9  IS NOT NULL THEN ((18-8)/18) ELSE 0 END) +
                    (CASE WHEN t.t_10 IS NOT NULL THEN ((18-9)/18) ELSE 0 END) +
                    (CASE WHEN t.t_11 IS NOT NULL THEN ((18-10)/18) ELSE 0 END) +
                    (CASE WHEN t.t_12 IS NOT NULL THEN ((18-11)/18) ELSE 0 END) +
                    (CASE WHEN t.t_13 IS NOT NULL THEN ((18-12)/18) ELSE 0 END) +
                    (CASE WHEN t.t_14 IS NOT NULL THEN ((18-13)/18) ELSE 0 END) +
                    (CASE WHEN t.t_15 IS NOT NULL THEN ((18-14)/18) ELSE 0 END) +
                    (CASE WHEN t.t_16 IS NOT NULL THEN ((18-15)/18) ELSE 0 END) +
                    (CASE WHEN t.t_17 IS NOT NULL THEN ((18-16)/18) ELSE 0 END) +
                    (CASE WHEN t.t_18 IS NOT NULL THEN ((18-17)/18) ELSE 0 END),
                    0
                )
        END AS recency_wtd_avg_dpd_l18m,

        -- ================== recency_wtd_avg_dpd_l24m (t_24..t_1) ==================
        CASE
            WHEN t.t_1  IS NULL AND t.t_2  IS NULL AND t.t_3  IS NULL AND t.t_4  IS NULL
             AND t.t_5  IS NULL AND t.t_6  IS NULL AND t.t_7  IS NULL AND t.t_8  IS NULL
             AND t.t_9  IS NULL AND t.t_10 IS NULL AND t.t_11 IS NULL AND t.t_12 IS NULL
             AND t.t_13 IS NULL AND t.t_14 IS NULL AND t.t_15 IS NULL AND t.t_16 IS NULL
             AND t.t_17 IS NULL AND t.t_18 IS NULL AND t.t_19 IS NULL AND t.t_20 IS NULL
             AND t.t_21 IS NULL AND t.t_22 IS NULL AND t.t_23 IS NULL AND t.t_24 IS NULL
            THEN NULL
            ELSE
                (
                    (CASE WHEN t.t_1  IS NOT NULL THEN t.t_1  * ((24-0)/24) ELSE 0 END) +
                    (CASE WHEN t.t_2  IS NOT NULL THEN t.t_2  * ((24-1)/24) ELSE 0 END) +
                    (CASE WHEN t.t_3  IS NOT NULL THEN t.t_3  * ((24-2)/24) ELSE 0 END) +
                    (CASE WHEN t.t_4  IS NOT NULL THEN t.t_4  * ((24-3)/24) ELSE 0 END) +
                    (CASE WHEN t.t_5  IS NOT NULL THEN t.t_5  * ((24-4)/24) ELSE 0 END) +
                    (CASE WHEN t.t_6  IS NOT NULL THEN t.t_6  * ((24-5)/24) ELSE 0 END) +
                    (CASE WHEN t.t_7  IS NOT NULL THEN t.t_7  * ((24-6)/24) ELSE 0 END) +
                    (CASE WHEN t.t_8  IS NOT NULL THEN t.t_8  * ((24-7)/24) ELSE 0 END) +
                    (CASE WHEN t.t_9  IS NOT NULL THEN t.t_9  * ((24-8)/24) ELSE 0 END) +
                    (CASE WHEN t.t_10 IS NOT NULL THEN t.t_10 * ((24-9)/24) ELSE 0 END) +
                    (CASE WHEN t.t_11 IS NOT NULL THEN t.t_11 * ((24-10)/24) ELSE 0 END) +
                    (CASE WHEN t.t_12 IS NOT NULL THEN t.t_12 * ((24-11)/24) ELSE 0 END) +
                    (CASE WHEN t.t_13 IS NOT NULL THEN t.t_13 * ((24-12)/24) ELSE 0 END) +
                    (CASE WHEN t.t_14 IS NOT NULL THEN t.t_14 * ((24-13)/24) ELSE 0 END) +
                    (CASE WHEN t.t_15 IS NOT NULL THEN t.t_15 * ((24-14)/24) ELSE 0 END) +
                    (CASE WHEN t.t_16 IS NOT NULL THEN t.t_16 * ((24-15)/24) ELSE 0 END) +
                    (CASE WHEN t.t_17 IS NOT NULL THEN t.t_17 * ((24-16)/24) ELSE 0 END) +
                    (CASE WHEN t.t_18 IS NOT NULL THEN t.t_18 * ((24-17)/24) ELSE 0 END) +
                    (CASE WHEN t.t_19 IS NOT NULL THEN t.t_19 * ((24-18)/24) ELSE 0 END) +
                    (CASE WHEN t.t_20 IS NOT NULL THEN t.t_20 * ((24-19)/24) ELSE 0 END) +
                    (CASE WHEN t.t_21 IS NOT NULL THEN t.t_21 * ((24-20)/24) ELSE 0 END) +
                    (CASE WHEN t.t_22 IS NOT NULL THEN t.t_22 * ((24-21)/24) ELSE 0 END) +
                    (CASE WHEN t.t_23 IS NOT NULL THEN t.t_23 * ((24-22)/24) ELSE 0 END) +
                    (CASE WHEN t.t_24 IS NOT NULL THEN t.t_24 * ((24-23)/24) ELSE 0 END)
                )
                /
                NULLIF(
                    (CASE WHEN t.t_1  IS NOT NULL THEN ((24-0)/24) ELSE 0 END) +
                    (CASE WHEN t.t_2  IS NOT NULL THEN ((24-1)/24) ELSE 0 END) +
                    (CASE WHEN t.t_3  IS NOT NULL THEN ((24-2)/24) ELSE 0 END) +
                    (CASE WHEN t.t_4  IS NOT NULL THEN ((24-3)/24) ELSE 0 END) +
                    (CASE WHEN t.t_5  IS NOT NULL THEN ((24-4)/24) ELSE 0 END) +
                    (CASE WHEN t.t_6  IS NOT NULL THEN ((24-5)/24) ELSE 0 END) +
                    (CASE WHEN t.t_7  IS NOT NULL THEN ((24-6)/24) ELSE 0 END) +
                    (CASE WHEN t.t_8  IS NOT NULL THEN ((24-7)/24) ELSE 0 END) +
                    (CASE WHEN t.t_9  IS NOT NULL THEN ((24-8)/24) ELSE 0 END) +
                    (CASE WHEN t.t_10 IS NOT NULL THEN ((24-9)/24) ELSE 0 END) +
                    (CASE WHEN t.t_11 IS NOT NULL THEN ((24-10)/24) ELSE 0 END) +
                    (CASE WHEN t.t_12 IS NOT NULL THEN ((24-11)/24) ELSE 0 END) +
                    (CASE WHEN t.t_13 IS NOT NULL THEN ((24-12)/24) ELSE 0 END) +
                    (CASE WHEN t.t_14 IS NOT NULL THEN ((24-13)/24) ELSE 0 END) +
                    (CASE WHEN t.t_15 IS NOT NULL THEN ((24-14)/24) ELSE 0 END) +
                    (CASE WHEN t.t_16 IS NOT NULL THEN ((24-15)/24) ELSE 0 END) +
                    (CASE WHEN t.t_17 IS NOT NULL THEN ((24-16)/24) ELSE 0 END) +
                    (CASE WHEN t.t_18 IS NOT NULL THEN ((24-17)/24) ELSE 0 END) +
                    (CASE WHEN t.t_19 IS NOT NULL THEN ((24-18)/24) ELSE 0 END) +
                    (CASE WHEN t.t_20 IS NOT NULL THEN ((24-19)/24) ELSE 0 END) +
                    (CASE WHEN t.t_21 IS NOT NULL THEN ((24-20)/24) ELSE 0 END) +
                    (CASE WHEN t.t_22 IS NOT NULL THEN ((24-21)/24) ELSE 0 END) +
                    (CASE WHEN t.t_23 IS NOT NULL THEN ((24-22)/24) ELSE 0 END) +
                    (CASE WHEN t.t_24 IS NOT NULL THEN ((24-23)/24) ELSE 0 END),
                    0
                )
        END AS recency_wtd_avg_dpd_l24m,

        -- ================== recency_wtd_avg_dpd_l36m (t_36..t_1) ==================
        CASE
            WHEN t.t_1  IS NULL AND t.t_2  IS NULL AND t.t_3  IS NULL AND t.t_4  IS NULL
             AND t.t_5  IS NULL AND t.t_6  IS NULL AND t.t_7  IS NULL AND t.t_8  IS NULL
             AND t.t_9  IS NULL AND t.t_10 IS NULL AND t.t_11 IS NULL AND t.t_12 IS NULL
             AND t.t_13 IS NULL AND t.t_14 IS NULL AND t.t_15 IS NULL AND t.t_16 IS NULL
             AND t.t_17 IS NULL AND t.t_18 IS NULL AND t.t_19 IS NULL AND t.t_20 IS NULL
             AND t.t_21 IS NULL AND t.t_22 IS NULL AND t.t_23 IS NULL AND t.t_24 IS NULL
             AND t.t_25 IS NULL AND t.t_26 IS NULL AND t.t_27 IS NULL AND t.t_28 IS NULL
             AND t.t_29 IS NULL AND t.t_30 IS NULL AND t.t_31 IS NULL AND t.t_32 IS NULL
             AND t.t_33 IS NULL AND t.t_34 IS NULL AND t.t_35 IS NULL AND t.t_36 IS NULL
            THEN NULL
            ELSE
                (
                    (CASE WHEN t.t_1  IS NOT NULL THEN t.t_1  * ((36-0)/36) ELSE 0 END) +
                    (CASE WHEN t.t_2  IS NOT NULL THEN t.t_2  * ((36-1)/36) ELSE 0 END) +
                    (CASE WHEN t.t_3  IS NOT NULL THEN t.t_3  * ((36-2)/36) ELSE 0 END) +
                    (CASE WHEN t.t_4  IS NOT NULL THEN t.t_4  * ((36-3)/36) ELSE 0 END) +
                    (CASE WHEN t.t_5  IS NOT NULL THEN t.t_5  * ((36-4)/36) ELSE 0 END) +
                    (CASE WHEN t.t_6  IS NOT NULL THEN t.t_6  * ((36-5)/36) ELSE 0 END) +
                    (CASE WHEN t.t_7  IS NOT NULL THEN t.t_7  * ((36-6)/36) ELSE 0 END) +
                    (CASE WHEN t.t_8  IS NOT NULL THEN t.t_8  * ((36-7)/36) ELSE 0 END) +
                    (CASE WHEN t.t_9  IS NOT NULL THEN t.t_9  * ((36-8)/36) ELSE 0 END) +
                    (CASE WHEN t.t_10 IS NOT NULL THEN t.t_10 * ((36-9)/36) ELSE 0 END) +
                    (CASE WHEN t.t_11 IS NOT NULL THEN t.t_11 * ((36-10)/36) ELSE 0 END) +
                    (CASE WHEN t.t_12 IS NOT NULL THEN t.t_12 * ((36-11)/36) ELSE 0 END) +
                    (CASE WHEN t.t_13 IS NOT NULL THEN t.t_13 * ((36-12)/36) ELSE 0 END) +
                    (CASE WHEN t.t_14 IS NOT NULL THEN t.t_14 * ((36-13)/36) ELSE 0 END) +
                    (CASE WHEN t.t_15 IS NOT NULL THEN t.t_15 * ((36-14)/36) ELSE 0 END) +
                    (CASE WHEN t.t_16 IS NOT NULL THEN t.t_16 * ((36-15)/36) ELSE 0 END) +
                    (CASE WHEN t.t_17 IS NOT NULL THEN t.t_17 * ((36-16)/36) ELSE 0 END) +
                    (CASE WHEN t.t_18 IS NOT NULL THEN t.t_18 * ((36-17)/36) ELSE 0 END) +
                    (CASE WHEN t.t_19 IS NOT NULL THEN t.t_19 * ((36-18)/36) ELSE 0 END) +
                    (CASE WHEN t.t_20 IS NOT NULL THEN t.t_20 * ((36-19)/36) ELSE 0 END) +
                    (CASE WHEN t.t_21 IS NOT NULL THEN t.t_21 * ((36-20)/36) ELSE 0 END) +
                    (CASE WHEN t.t_22 IS NOT NULL THEN t.t_22 * ((36-21)/36) ELSE 0 END) +
                    (CASE WHEN t.t_23 IS NOT NULL THEN t.t_23 * ((36-22)/36) ELSE 0 END) +
                    (CASE WHEN t.t_24 IS NOT NULL THEN t.t_24 * ((36-23)/36) ELSE 0 END) +
                    (CASE WHEN t.t_25 IS NOT NULL THEN t.t_25 * ((36-24)/36) ELSE 0 END) +
                    (CASE WHEN t.t_26 IS NOT NULL THEN t.t_26 * ((36-25)/36) ELSE 0 END) +
                    (CASE WHEN t.t_27 IS NOT NULL THEN t.t_27 * ((36-26)/36) ELSE 0 END) +
                    (CASE WHEN t.t_28 IS NOT NULL THEN t.t_28 * ((36-27)/36) ELSE 0 END) +
                    (CASE WHEN t.t_29 IS NOT NULL THEN t.t_29 * ((36-28)/36) ELSE 0 END) +
                    (CASE WHEN t.t_30 IS NOT NULL THEN t.t_30 * ((36-29)/36) ELSE 0 END) +
                    (CASE WHEN t.t_31 IS NOT NULL THEN t.t_31 * ((36-30)/36) ELSE 0 END) +
                    (CASE WHEN t.t_32 IS NOT NULL THEN t.t_32 * ((36-31)/36) ELSE 0 END) +
                    (CASE WHEN t.t_33 IS NOT NULL THEN t.t_33 * ((36-32)/36) ELSE 0 END) +
                    (CASE WHEN t.t_34 IS NOT NULL THEN t.t_34 * ((36-33)/36) ELSE 0 END) +
                    (CASE WHEN t.t_35 IS NOT NULL THEN t.t_35 * ((36-34)/36) ELSE 0 END) +
                    (CASE WHEN t.t_36 IS NOT NULL THEN t.t_36 * ((36-35)/36) ELSE 0 END)
                )
                /
                NULLIF(
                    (CASE WHEN t.t_1  IS NOT NULL THEN ((36-0)/36) ELSE 0 END) +
                    (CASE WHEN t.t_2  IS NOT NULL THEN ((36-1)/36) ELSE 0 END) +
                    (CASE WHEN t.t_3  IS NOT NULL THEN ((36-2)/36) ELSE 0 END) +
                    (CASE WHEN t.t_4  IS NOT NULL THEN ((36-3)/36) ELSE 0 END) +
                    (CASE WHEN t.t_5  IS NOT NULL THEN ((36-4)/36) ELSE 0 END) +
                    (CASE WHEN t.t_6  IS NOT NULL THEN ((36-5)/36) ELSE 0 END) +
                    (CASE WHEN t.t_7  IS NOT NULL THEN ((36-6)/36) ELSE 0 END) +
                    (CASE WHEN t.t_8  IS NOT NULL THEN ((36-7)/36) ELSE 0 END) +
                    (CASE WHEN t.t_9  IS NOT NULL THEN ((36-8)/36) ELSE 0 END) +
                    (CASE WHEN t.t_10 IS NOT NULL THEN ((36-9)/36) ELSE 0 END) +
                    (CASE WHEN t.t_11 IS NOT NULL THEN ((36-10)/36) ELSE 0 END) +
                    (CASE WHEN t.t_12 IS NOT NULL THEN ((36-11)/36) ELSE 0 END) +
                    (CASE WHEN t.t_13 IS NOT NULL THEN ((36-12)/36) ELSE 0 END) +
                    (CASE WHEN t.t_14 IS NOT NULL THEN ((36-13)/36) ELSE 0 END) +
                    (CASE WHEN t.t_15 IS NOT NULL THEN ((36-14)/36) ELSE 0 END) +
                    (CASE WHEN t.t_16 IS NOT NULL THEN ((36-15)/36) ELSE 0 END) +
                    (CASE WHEN t.t_17 IS NOT NULL THEN ((36-16)/36) ELSE 0 END) +
                    (CASE WHEN t.t_18 IS NOT NULL THEN ((36-17)/36) ELSE 0 END) +
                    (CASE WHEN t.t_19 IS NOT NULL THEN ((36-18)/36) ELSE 0 END) +
                    (CASE WHEN t.t_20 IS NOT NULL THEN ((36-19)/36) ELSE 0 END) +
                    (CASE WHEN t.t_21 IS NOT NULL THEN ((36-20)/36) ELSE 0 END) +
                    (CASE WHEN t.t_22 IS NOT NULL THEN ((36-21)/36) ELSE 0 END) +
                    (CASE WHEN t.t_23 IS NOT NULL THEN ((36-22)/36) ELSE 0 END) +
                    (CASE WHEN t.t_24 IS NOT NULL THEN ((36-23)/36) ELSE 0 END) +
                    (CASE WHEN t.t_25 IS NOT NULL THEN ((36-24)/36) ELSE 0 END) +
                    (CASE WHEN t.t_26 IS NOT NULL THEN ((36-25)/36) ELSE 0 END) +
                    (CASE WHEN t.t_27 IS NOT NULL THEN ((36-26)/36) ELSE 0 END) +
                    (CASE WHEN t.t_28 IS NOT NULL THEN ((36-27)/36) ELSE 0 END) +
                    (CASE WHEN t.t_29 IS NOT NULL THEN ((36-28)/36) ELSE 0 END) +
                    (CASE WHEN t.t_30 IS NOT NULL THEN ((36-29)/36) ELSE 0 END) +
                    (CASE WHEN t.t_31 IS NOT NULL THEN ((36-30)/36) ELSE 0 END) +
                    (CASE WHEN t.t_32 IS NOT NULL THEN ((36-31)/36) ELSE 0 END) +
                    (CASE WHEN t.t_33 IS NOT NULL THEN ((36-32)/36) ELSE 0 END) +
                    (CASE WHEN t.t_34 IS NOT NULL THEN ((36-33)/36) ELSE 0 END) +
                    (CASE WHEN t.t_35 IS NOT NULL THEN ((36-34)/36) ELSE 0 END) +
                    (CASE WHEN t.t_36 IS NOT NULL THEN ((36-35)/36) ELSE 0 END),
                    0
                )
        END AS recency_wtd_avg_dpd_l36m
 from sandbox.PP_HS_BASE_BU_TL_6 t;


alter table PP_HS_BASE_BU_TL_7 add column onus_flag integer;

alter table PP_HS_BASE_BU_TL_7 add column f_all integer;
alter table PP_HS_BASE_BU_TL_7 add column f_lv integer;
alter table PP_HS_BASE_BU_TL_7 add column f_uns integer;
alter table PP_HS_BASE_BU_TL_7 add column f_sec integer;

alter table PP_HS_BASE_BU_TL_7 add column f_pl integer;
alter table PP_HS_BASE_BU_TL_7 add column f_cc integer;
alter table PP_HS_BASE_BU_TL_7 add column f_bl integer;
alter table PP_HS_BASE_BU_TL_7 add column f_gl integer;
alter table PP_HS_BASE_BU_TL_7 add column f_hllap integer;
alter table PP_HS_BASE_BU_TL_7 add column f_hra integer;
alter table PP_HS_BASE_BU_TL_7 add column f_twl integer;
alter table PP_HS_BASE_BU_TL_7 add column f_cd integer;
alter table PP_HS_BASE_BU_TL_7 add column f_cons integer;
alter table PP_HS_BASE_BU_TL_7 add column f_plbl integer;
alter table PP_HS_BASE_BU_TL_7 add column f_onc integer;

alter table PP_HS_BASE_BU_TL_7 add column f_exc_cc integer;
alter table PP_HS_BASE_BU_TL_7 add column f_exccgled integer;

alter table PP_HS_BASE_BU_TL_7 add column f_allsal10k integer;
alter table PP_HS_BASE_BU_TL_7 add column f_allsal20k integer;
alter table PP_HS_BASE_BU_TL_7 add column f_allsal1l integer;
alter table PP_HS_BASE_BU_TL_7 add column f_allsag20k integer;
alter table PP_HS_BASE_BU_TL_7 add column f_allsag1l integer;

alter table PP_HS_BASE_BU_TL_7 add column age_trade decimal(10,2);

update PP_HS_BASE_BU_TL_7
set
    -- onus flag (same as your reference logic)
    onus_flag = case
        when sector in ('KOTAK BANK','KOTAK PRIME') then 1
        else 0
    end,

    -- /* ---------- PRODUCT FLAGS ---------- */
    f_all    = 1,
    f_cc     = case when account_type_cd in (10,16,31,35,36) then 1 else 0 end,
    f_exc_cc = case when account_type_cd not in (10,16,31,35,36) then 1 else 0 end,
    f_cd     = case when account_type_cd in (6) then 1 else 0 end,
    f_hra    = case when account_type_cd in (6,7,13) then 1 else 0 end,
    f_cons   = case when account_type_cd not in (1,17,33,8,2,42,3,34,13) then 1 else 0 end,
    f_plbl   = case when account_type_cd in (5,9,40,50,51,52,53,54,55,56,57,58,59,61,69) then 1 else 0 end,
    f_bl     = case when account_type_cd in (9,40,50,51,52,53,54,55,56,57,58,59,61) then 1 else 0 end,
    f_uns    = case when account_type_cd in (5,6,8,9,12,24,37,38,39,40,41,43,45,47,51,52,53,54,55,56,57,58,61,0,69,70,71) then 1 else 0 end,
    f_sec    = case when account_type_cd in (1,2,3,4,7,11,13,14,15,17,23,32,33,34,42,44,46,50,59) then 1 else 0 end,
    f_exccgled = case when account_type_cd not in (10,16,31,35,36,7,8) then 1 else 0 end,
    f_pl     = case when account_type_cd in (5,69) then 1 else 0 end,
    f_gl     = case when account_type_cd in (7) then 1 else 0 end,
    f_twl    = case when account_type_cd in (13) then 1 else 0 end,
    f_hllap  = case when account_type_cd in (2,3) then 1 else 0 end,

    -- /* ---------- SANCTION FLAGS (guard: sector not null) ---------- */
    f_allsag20k = case when is_sanc_amt_bel20k = 0 and sector is not null then 1 else 0 end,
    f_allsal20k = case when is_sanc_amt_bel20k = 1 and sector is not null then 1 else 0 end,
    f_allsag1l  = case when is_sanc_amt_bel1l  = 0 and sector is not null then 1 else 0 end,
    f_allsal10k = case when is_sanc_amt_bel10k = 1 and sector is not null then 1 else 0 end,
    f_allsal1l  = case when is_sanc_amt_bel1l  = 1 and sector is not null then 1 else 0 end,

    -- /* ---------- STATUS FLAGS ---------- */
    f_onc = case when open_flag is not null then 1 else 0 end,
    f_lv  = case when open_flag = 1 then 1 else 0 end,

    -- /* ---------- TRADE AGE (months, decimal) ---------- */
    age_trade = case
        when open_flag = 1 then greatest(round((datediff(day, date_opened, scrub_date)::float) / 30.5, 2), 0)
        when open_flag = 0 then greatest(round((datediff(day, date_opened, date_closed)::float) / 30.5, 2), 0)
        else null
    end
;

drop table if exists PP_HS_BASE_BU_TL_8;
create TEMP table PP_HS_BASE_BU_TL_8 as
select *,
case when t_1 is not null then 1 else 0 end as v_1,
case when t_2 is not null then 1 else 0 end as v_2,
case when t_3 is not null then 1 else 0 end as v_3,
case when t_4 is not null then 1 else 0 end as v_4,
case when t_5 is not null then 1 else 0 end as v_5,
case when t_6 is not null then 1 else 0 end as v_6,
case when t_7 is not null then 1 else 0 end as v_7,
case when t_8 is not null then 1 else 0 end as v_8,
case when t_9 is not null then 1 else 0 end as v_9,
case when t_10 is not null then 1 else 0 end as v_10,
case when t_11 is not null then 1 else 0 end as v_11,
case when t_12 is not null then 1 else 0 end as v_12,
case when t_13 is not null then 1 else 0 end as v_13,
case when t_14 is not null then 1 else 0 end as v_14,
case when t_15 is not null then 1 else 0 end as v_15,
case when t_16 is not null then 1 else 0 end as v_16,
case when t_17 is not null then 1 else 0 end as v_17,
case when t_18 is not null then 1 else 0 end as v_18,
case when t_19 is not null then 1 else 0 end as v_19,
case when t_20 is not null then 1 else 0 end as v_20,
case when t_21 is not null then 1 else 0 end as v_21,
case when t_22 is not null then 1 else 0 end as v_22,
case when t_23 is not null then 1 else 0 end as v_23,
case when t_24 is not null then 1 else 0 end as v_24,
case when t_25 is not null then 1 else 0 end as v_25,
case when t_26 is not null then 1 else 0 end as v_26,
case when t_27 is not null then 1 else 0 end as v_27,
case when t_28 is not null then 1 else 0 end as v_28,
case when t_29 is not null then 1 else 0 end as v_29,
case when t_30 is not null then 1 else 0 end as v_30,
case when t_31 is not null then 1 else 0 end as v_31,
case when t_32 is not null then 1 else 0 end as v_32,
case when t_33 is not null then 1 else 0 end as v_33,
case when t_34 is not null then 1 else 0 end as v_34,
case when t_35 is not null then 1 else 0 end as v_35,
case when t_36 is not null then 1 else 0 end as v_36,
             
case when t_1>0 then 1 else 0 end as p_1,
case when t_2>0 then 1 else 0 end as p_2,
case when t_3>0 then 1 else 0 end as p_3,
case when t_4>0 then 1 else 0 end as p_4,
case when t_5>0 then 1 else 0 end as p_5,
case when t_6>0 then 1 else 0 end as p_6,
case when t_7>0 then 1 else 0 end as p_7,
case when t_8>0 then 1 else 0 end as p_8,
case when t_9>0 then 1 else 0 end as p_9,
case when t_10>0 then 1 else 0 end as p_10,
case when t_11>0 then 1 else 0 end as p_11,
case when t_12>0 then 1 else 0 end as p_12,
case when t_13>0 then 1 else 0 end as p_13,
case when t_14>0 then 1 else 0 end as p_14,
case when t_15>0 then 1 else 0 end as p_15,
case when t_16>0 then 1 else 0 end as p_16,
case when t_17>0 then 1 else 0 end as p_17,
case when t_18>0 then 1 else 0 end as p_18,
case when t_19>0 then 1 else 0 end as p_19,
case when t_20>0 then 1 else 0 end as p_20,
case when t_21>0 then 1 else 0 end as p_21,
case when t_22>0 then 1 else 0 end as p_22,
case when t_23>0 then 1 else 0 end as p_23,
case when t_24>0 then 1 else 0 end as p_24,
case when t_25>0 then 1 else 0 end as p_25,
case when t_26>0 then 1 else 0 end as p_26,
case when t_27>0 then 1 else 0 end as p_27,
case when t_28>0 then 1 else 0 end as p_28,
case when t_29>0 then 1 else 0 end as p_29,
case when t_30>0 then 1 else 0 end as p_30,
case when t_31>0 then 1 else 0 end as p_31,
case when t_32>0 then 1 else 0 end as p_32,
case when t_33>0 then 1 else 0 end as p_33,
case when t_34>0 then 1 else 0 end as p_34,
case when t_35>0 then 1 else 0 end as p_35,
case when t_36>0 then 1 else 0 end as p_36,

case when t_1>30 then 1 else 0 end as p30_1,
case when t_2>30 then 1 else 0 end as p30_2,
case when t_3>30 then 1 else 0 end as p30_3,
case when t_4>30 then 1 else 0 end as p30_4,
case when t_5>30 then 1 else 0 end as p30_5,
case when t_6>30 then 1 else 0 end as p30_6,
case when t_7>30 then 1 else 0 end as p30_7,
case when t_8>30 then 1 else 0 end as p30_8,
case when t_9>30 then 1 else 0 end as p30_9,
case when t_10>30 then 1 else 0 end as p30_10,
case when t_11>30 then 1 else 0 end as p30_11,
case when t_12>30 then 1 else 0 end as p30_12,
case when t_13>30 then 1 else 0 end as p30_13,
case when t_14>30 then 1 else 0 end as p30_14,
case when t_15>30 then 1 else 0 end as p30_15,
case when t_16>30 then 1 else 0 end as p30_16,
case when t_17>30 then 1 else 0 end as p30_17,
case when t_18>30 then 1 else 0 end as p30_18,
case when t_19>30 then 1 else 0 end as p30_19,
case when t_20>30 then 1 else 0 end as p30_20,
case when t_21>30 then 1 else 0 end as p30_21,
case when t_22>30 then 1 else 0 end as p30_22,
case when t_23>30 then 1 else 0 end as p30_23,
case when t_24>30 then 1 else 0 end as p30_24,
case when t_25>30 then 1 else 0 end as p30_25,
case when t_26>30 then 1 else 0 end as p30_26,
case when t_27>30 then 1 else 0 end as p30_27,
case when t_28>30 then 1 else 0 end as p30_28,
case when t_29>30 then 1 else 0 end as p30_29,
case when t_30>30 then 1 else 0 end as p30_30,
case when t_31>30 then 1 else 0 end as p30_31,
case when t_32>30 then 1 else 0 end as p30_32,
case when t_33>30 then 1 else 0 end as p30_33,
case when t_34>30 then 1 else 0 end as p30_34,
case when t_35>30 then 1 else 0 end as p30_35,
case when t_36>30 then 1 else 0 end as p30_36,
                          
case
    when t_1 is null then null
    when t_2 is null and t_1 > 0 then 1
    when t_2 is not null and (t_1 - t_2) > 5 then 1
    else 0
end as mp_1,
case
    when t_2 is null then null
    when t_3 is null and t_2 > 0 then 1
    when t_3 is not null and (t_2 - t_3) > 5 then 1
    else 0
end as mp_2,
case
    when t_3 is null then null
    when t_4 is null and t_3 > 0 then 1
    when t_4 is not null and (t_3 - t_4) > 5 then 1
    else 0
end as mp_3,
case
    when t_4 is null then null
    when t_5 is null and t_4 > 0 then 1
    when t_5 is not null and (t_4 - t_5) > 5 then 1
    else 0
end as mp_4,
case
    when t_5 is null then null
    when t_6 is null and t_5 > 0 then 1
    when t_6 is not null and (t_5 - t_6) > 5 then 1
    else 0
end as mp_5,
case
    when t_6 is null then null
    when t_7 is null and t_6 > 0 then 1
    when t_7 is not null and (t_6 - t_7) > 5 then 1
    else 0
end as mp_6,
case
    when t_7 is null then null
    when t_8 is null and t_7 > 0 then 1
    when t_8 is not null and (t_7 - t_8) > 5 then 1
    else 0
end as mp_7,
case
    when t_8 is null then null
    when t_9 is null and t_8 > 0 then 1
    when t_9 is not null and (t_8 - t_9) > 5 then 1
    else 0
end as mp_8,
case
    when t_9 is null then null
    when t_10 is null and t_9 > 0 then 1
    when t_10 is not null and (t_9 - t_10) > 5 then 1
    else 0
end as mp_9,
case
    when t_10 is null then null
    when t_11 is null and t_10 > 0 then 1
    when t_11 is not null and (t_10 - t_11) > 5 then 1
    else 0
end as mp_10,
case
    when t_11 is null then null
    when t_12 is null and t_11 > 0 then 1
    when t_12 is not null and (t_11 - t_12) > 5 then 1
    else 0
end as mp_11,
case
    when t_12 is null then null
    when t_13 is null and t_12 > 0 then 1
    when t_13 is not null and (t_12 - t_13) > 5 then 1
    else 0
end as mp_12,
case
    when t_13 is null then null
    when t_14 is null and t_13 > 0 then 1
    when t_14 is not null and (t_13 - t_14) > 5 then 1
    else 0
end as mp_13,
case
    when t_14 is null then null
    when t_15 is null and t_14 > 0 then 1
    when t_15 is not null and (t_14 - t_15) > 5 then 1
    else 0
end as mp_14,
case
    when t_15 is null then null
    when t_16 is null and t_15 > 0 then 1
    when t_16 is not null and (t_15 - t_16) > 5 then 1
    else 0
end as mp_15,
case
    when t_16 is null then null
    when t_17 is null and t_16 > 0 then 1
    when t_17 is not null and (t_16 - t_17) > 5 then 1
    else 0
end as mp_16,
case
    when t_17 is null then null
    when t_18 is null and t_17 > 0 then 1
    when t_18 is not null and (t_17 - t_18) > 5 then 1
    else 0
end as mp_17,
case
    when t_18 is null then null
    when t_19 is null and t_18 > 0 then 1
    when t_19 is not null and (t_18 - t_19) > 5 then 1
    else 0
end as mp_18,
case
    when t_19 is null then null
    when t_20 is null and t_19 > 0 then 1
    when t_20 is not null and (t_19 - t_20) > 5 then 1
    else 0
end as mp_19,
case
    when t_20 is null then null
    when t_21 is null and t_20 > 0 then 1
    when t_21 is not null and (t_20 - t_21) > 5 then 1
    else 0
end as mp_20,
case
    when t_21 is null then null
    when t_22 is null and t_21 > 0 then 1
    when t_22 is not null and (t_21 - t_22) > 5 then 1
    else 0
end as mp_21,
case
    when t_22 is null then null
    when t_23 is null and t_22 > 0 then 1
    when t_23 is not null and (t_22 - t_23) > 5 then 1
    else 0
end as mp_22,
case
    when t_23 is null then null
    when t_24 is null and t_23 > 0 then 1
    when t_24 is not null and (t_23 - t_24) > 5 then 1
    else 0
end as mp_23,
case
    when t_24 is null then null
    when t_25 is null and t_24 > 0 then 1
    when t_25 is not null and (t_24 - t_25) > 5 then 1
    else 0
end as mp_24,
case
    when t_25 is null then null
    when t_26 is null and t_25 > 0 then 1
    when t_26 is not null and (t_25 - t_26) > 5 then 1
    else 0
end as mp_25,
case
    when t_26 is null then null
    when t_27 is null and t_26 > 0 then 1
    when t_27 is not null and (t_26 - t_27) > 5 then 1
    else 0
end as mp_26,
case
    when t_27 is null then null
    when t_28 is null and t_27 > 0 then 1
    when t_28 is not null and (t_27 - t_28) > 5 then 1
    else 0
end as mp_27,
case
    when t_28 is null then null
    when t_29 is null and t_28 > 0 then 1
    when t_29 is not null and (t_28 - t_29) > 5 then 1
    else 0
end as mp_28,
case
    when t_29 is null then null
    when t_30 is null and t_29 > 0 then 1
    when t_30 is not null and (t_29 - t_30) > 5 then 1
    else 0
end as mp_29,
case
    when t_30 is null then null
    when t_31 is null and t_30 > 0 then 1
    when t_31 is not null and (t_30 - t_31) > 5 then 1
    else 0
end as mp_30,
case
    when t_31 is null then null
    when t_32 is null and t_31 > 0 then 1
    when t_32 is not null and (t_31 - t_32) > 5 then 1
    else 0
end as mp_31,
case
    when t_32 is null then null
    when t_33 is null and t_32 > 0 then 1
    when t_33 is not null and (t_32 - t_33) > 5 then 1
    else 0
end as mp_32,
case
    when t_33 is null then null
    when t_34 is null and t_33 > 0 then 1
    when t_34 is not null and (t_33 - t_34) > 5 then 1
    else 0
end as mp_33,
case
    when t_34 is null then null
    when t_35 is null and t_34 > 0 then 1
    when t_35 is not null and (t_34 - t_35) > 5 then 1
    else 0
end as mp_34,
case
    when t_35 is null then null
    when t_36 is null and t_35 > 0 then 1
    when t_36 is not null and (t_35 - t_36) > 5 then 1
    else 0
end as mp_35,

case
    when t_36 is null then null
    when t_36 > 0 then 1
    else 0
end as mp_36
 from PP_HS_BASE_BU_TL_7;

drop table if exists PP_HS_BASE_BU_TL_9;
create table PP_HS_BASE_BU_TL_9 as
select *,
v_1+v_2+v_3 as valid_pymt_cnt_last3m,
p_1+p_2+p_3 as cnt_0p_last3m,
p30_1+p30_2+p30_3 as cnt_30p_last3m,
       case
    when mp_1 is null and mp_2 is null and mp_3 is null then null
    else coalesce(mp_1,0) + coalesce(mp_2,0) + coalesce(mp_3,0)
end as missed_pymt_cnt_last3m,

valid_pymt_cnt_last3m + v_4 + v_5 + v_6 as valid_pymt_cnt_last6m,

	cnt_0p_last3m + p_4 + p_5 + p_6 as cnt_0p_last6m,
cnt_30p_last3m + p30_4 + p30_5 + p30_6 as cnt_30p_last6m,

	 case
    when missed_pymt_cnt_last3m is null and mp_4 is null and mp_5 is null and mp_6 is null then null
    else coalesce(missed_pymt_cnt_last3m,0) + coalesce(mp_4,0) + coalesce(mp_5,0) + coalesce(mp_6,0)
end as missed_pymt_cnt_last6m,

(valid_pymt_cnt_last6m
            + COALESCE(v_7, 0) + COALESCE(v_8, 0) + COALESCE(v_9, 0))
            AS valid_pymt_cnt_last9m,

      
        (cnt_0p_last6m
            + COALESCE(p_7, 0) + COALESCE(p_8, 0) + COALESCE(p_9, 0))
            AS cnt_0p_last9m,

 (cnt_30p_last6m
            + COALESCE(p30_7, 0) + COALESCE(p30_8, 0) + COALESCE(p30_9, 0))
            AS cnt_30p_last9m,

 
        CASE
            WHEN missed_pymt_cnt_last6m IS NULL
                 AND mp_7 IS NULL AND mp_8 IS NULL AND mp_9 IS NULL
            THEN NULL
            ELSE COALESCE(missed_pymt_cnt_last6m, 0)
                 + COALESCE(mp_7, 0) + COALESCE(mp_8, 0) + COALESCE(mp_9, 0)
        END AS missed_pymt_cnt_last9m,

(valid_pymt_cnt_last9m
            + COALESCE(v_10, 0) + COALESCE(v_11, 0) + COALESCE(v_12, 0))
            AS valid_pymt_cnt_last12m,


        (cnt_0p_last9m
            + COALESCE(p_10, 0) + COALESCE(p_11, 0) + COALESCE(p_12, 0))
            AS cnt_0p_last12m,

  (cnt_30p_last9m
            + COALESCE(p30_10, 0) + COALESCE(p30_11, 0) + COALESCE(p30_12, 0))
            AS cnt_30p_last12m,

     
        CASE
            WHEN missed_pymt_cnt_last9m IS NULL
                 AND mp_10 IS NULL AND mp_11 IS NULL AND mp_12 IS NULL
            THEN NULL
            ELSE COALESCE(missed_pymt_cnt_last9m, 0)
                 + COALESCE(mp_10, 0) + COALESCE(mp_11, 0) + COALESCE(mp_12, 0)
        END AS missed_pymt_cnt_last12m,

(valid_pymt_cnt_last12m
            + COALESCE(v_13, 0) + COALESCE(v_14, 0) + COALESCE(v_15, 0)
            + COALESCE(v_16, 0) + COALESCE(v_17, 0) + COALESCE(v_18, 0))
            AS valid_pymt_cnt_last18m,

       
        (cnt_0p_last12m
            + COALESCE(p_13, 0) + COALESCE(p_14, 0) + COALESCE(p_15, 0)
            + COALESCE(p_16, 0) + COALESCE(p_17, 0) + COALESCE(p_18, 0))
            AS cnt_0p_last18m,

 (cnt_30p_last12m
            + COALESCE(p30_13, 0) + COALESCE(p30_14, 0) + COALESCE(p30_15, 0)
            + COALESCE(p30_16, 0) + COALESCE(p30_17, 0) + COALESCE(p30_18, 0))
            AS cnt_30p_last18m,

     
        CASE
            WHEN missed_pymt_cnt_last12m IS NULL
                 AND mp_13 IS NULL AND mp_14 IS NULL AND mp_15 IS NULL
                 AND mp_16 IS NULL AND mp_17 IS NULL AND mp_18 IS NULL
            THEN NULL
            ELSE COALESCE(missed_pymt_cnt_last12m, 0)
                 + COALESCE(mp_13, 0) + COALESCE(mp_14, 0) + COALESCE(mp_15, 0)
                 + COALESCE(mp_16, 0) + COALESCE(mp_17, 0) + COALESCE(mp_18, 0)
        END AS missed_pymt_cnt_last18m,

(valid_pymt_cnt_last18m
            + COALESCE(v_19, 0) + COALESCE(v_20, 0) + COALESCE(v_21, 0)
            + COALESCE(v_22, 0) + COALESCE(v_23, 0) + COALESCE(v_24, 0))
            AS valid_pymt_cnt_last24m,

    
        (cnt_0p_last18m
            + COALESCE(p_19, 0) + COALESCE(p_20, 0) + COALESCE(p_21, 0)
            + COALESCE(p_22, 0) + COALESCE(p_23, 0) + COALESCE(p_24, 0))
            AS cnt_0p_last24m,

 (cnt_30p_last18m
            + COALESCE(p30_19, 0) + COALESCE(p30_20, 0) + COALESCE(p30_21, 0)
            + COALESCE(p30_22, 0) + COALESCE(p30_23, 0) + COALESCE(p30_24, 0))
            AS cnt_30p_last24m,

   
        CASE
            WHEN missed_pymt_cnt_last18m IS NULL
                 AND mp_19 IS NULL AND mp_20 IS NULL AND mp_21 IS NULL
                 AND mp_22 IS NULL AND mp_23 IS NULL AND mp_24 IS NULL
            THEN NULL
            ELSE COALESCE(missed_pymt_cnt_last18m, 0)
                 + COALESCE(mp_19, 0) + COALESCE(mp_20, 0) + COALESCE(mp_21, 0)
                 + COALESCE(mp_22, 0) + COALESCE(mp_23, 0) + COALESCE(mp_24, 0)
        END AS missed_pymt_cnt_last24m,

(valid_pymt_cnt_last24m
            + COALESCE(v_25, 0) + COALESCE(v_26, 0) + COALESCE(v_27, 0)
            + COALESCE(v_28, 0) + COALESCE(v_29, 0) + COALESCE(v_30, 0)
            + COALESCE(v_31, 0) + COALESCE(v_32, 0) + COALESCE(v_33, 0)
            + COALESCE(v_34, 0) + COALESCE(v_35, 0) + COALESCE(v_36, 0))
            AS valid_pymt_cnt_last36m,

    
        (cnt_0p_last24m
            + COALESCE(p_25, 0) + COALESCE(p_26, 0) + COALESCE(p_27, 0)
            + COALESCE(p_28, 0) + COALESCE(p_29, 0) + COALESCE(p_30, 0)
            + COALESCE(p_31, 0) + COALESCE(p_32, 0) + COALESCE(p_33, 0)
            + COALESCE(p_34, 0) + COALESCE(p_35, 0) + COALESCE(p_36, 0))
            AS cnt_0p_last36m,


 (cnt_30p_last24m
            + COALESCE(p30_25, 0) + COALESCE(p30_26, 0) + COALESCE(p30_27, 0)
            + COALESCE(p30_28, 0) + COALESCE(p30_29, 0) + COALESCE(p30_30, 0)
            + COALESCE(p30_31, 0) + COALESCE(p30_32, 0) + COALESCE(p30_33, 0)
            + COALESCE(p30_34, 0) + COALESCE(p30_35, 0) + COALESCE(p30_36, 0))
            AS cnt_30p_last36m,

 
        CASE
            WHEN missed_pymt_cnt_last24m IS NULL
                 AND mp_25 IS NULL AND mp_26 IS NULL AND mp_27 IS NULL
                 AND mp_28 IS NULL AND mp_29 IS NULL AND mp_30 IS NULL
                 AND mp_31 IS NULL AND mp_32 IS NULL AND mp_33 IS NULL
                 AND mp_34 IS NULL AND mp_35 IS NULL AND mp_36 IS NULL
            THEN NULL
            ELSE COALESCE(missed_pymt_cnt_last24m, 0)
                 + COALESCE(mp_25, 0) + COALESCE(mp_26, 0) + COALESCE(mp_27, 0)
                 + COALESCE(mp_28, 0) + COALESCE(mp_29, 0) + COALESCE(mp_30, 0)
                 + COALESCE(mp_31, 0) + COALESCE(mp_32, 0) + COALESCE(mp_33, 0)
                 + COALESCE(mp_34, 0) + COALESCE(mp_35, 0) + COALESCE(mp_36, 0)
        END AS missed_pymt_cnt_last36m,

        greatest(0, valid_pymt_cnt_last3m  - missed_pymt_cnt_last3m )::int as made_pymt_cnt_last3m,
        greatest(0, valid_pymt_cnt_last6m  - missed_pymt_cnt_last6m )::int as made_pymt_cnt_last6m,
        greatest(0, valid_pymt_cnt_last9m  - missed_pymt_cnt_last9m )::int as made_pymt_cnt_last9m,
        greatest(0, valid_pymt_cnt_last12m - missed_pymt_cnt_last12m)::int as made_pymt_cnt_last12m,
        greatest(0, valid_pymt_cnt_last18m - missed_pymt_cnt_last18m)::int as made_pymt_cnt_last18m,
        greatest(0, valid_pymt_cnt_last24m - missed_pymt_cnt_last24m)::int as made_pymt_cnt_last24m,
        greatest(0, valid_pymt_cnt_last36m - missed_pymt_cnt_last36m)::int as made_pymt_cnt_last36m


 from PP_HS_BASE_BU_TL_8 ;

drop table if exists sandbox.PP_HS_BASE_BU_TL_9;
create table sandbox.PP_HS_BASE_BU_TL_9 as
select * from PP_HS_BASE_BU_TL_9;

select * from PP_HS_BASE_BU_TL_9;