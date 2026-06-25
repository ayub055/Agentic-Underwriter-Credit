drop table if exists PP_HS_BASE_BU_TL_5;
create TEMP table PP_HS_BASE_BU_TL_5 as
select *,
case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -35, scrub_month),  -- T-36
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -35, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_36,

    -- T-35 (t_35)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -34, scrub_month),  -- T-35
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -34, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_35,

    -- T-34 (t_34)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -33, scrub_month),  -- T-34
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -33, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_34,

    -- T-33 (t_33)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -32, scrub_month),  -- T-33
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -32, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_33,

    -- T-32 (t_32)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -31, scrub_month),  -- T-32
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -31, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_32,

    -- T-31 (t_31)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -30, scrub_month),  -- T-31
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -30, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_31,

    -- T-30 (t_30)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -29, scrub_month),  -- T-30
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -29, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_30,

    -- T-29 (t_29)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -28, scrub_month),  -- T-29
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -28, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_29,

    -- T-28 (t_28)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -27, scrub_month),  -- T-28
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -27, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_28,

    -- T-27 (t_27)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -26, scrub_month),  -- T-27
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -26, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_27,

    -- T-26 (t_26)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -25, scrub_month),  -- T-26
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -25, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_26,

    -- T-25 (t_25)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -24, scrub_month),  -- T-25
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -24, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_25,

    -- T-24 (t_24)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -23, scrub_month),  -- T-24
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -23, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_24,

    -- T-23 (t_23)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -22, scrub_month),  -- T-23
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -22, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_23,

    -- T-22 (t_22)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -21, scrub_month),  -- T-22
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -21, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_22,

    -- T-21 (t_21)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -20, scrub_month),  -- T-21
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -20, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_21,

    -- T-20 (t_20)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -19, scrub_month),  -- T-20
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -19, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_20,

    -- T-19 (t_19)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -18, scrub_month),  -- T-19
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -18, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_19,

    -- T-18 (t_18)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -17, scrub_month),  -- T-18
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -17, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_18,

    -- T-17 (t_17)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -16, scrub_month),  -- T-17
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -16, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_17,

    -- T-16 (t_16)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -15, scrub_month),  -- T-16
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -15, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_16,

    -- T-15 (t_15)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -14, scrub_month),  -- T-15
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -14, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_15,

    -- T-14 (t_14)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -13, scrub_month),  -- T-14
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -13, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_14,

    -- T-13 (t_13)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -12, scrub_month),  -- T-13
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -12, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_13,

    -- T-12 (t_12)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -11, scrub_month),  -- T-12
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -11, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_12,

    -- T-11 (t_11)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -10, scrub_month),  -- T-11
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -10, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_11,

    -- T-10 (t_10)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -9, scrub_month),  -- T-10
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -9, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_10,

    -- T-9 (t_9)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -8, scrub_month),  -- T-9
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -8, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_9,

    -- T-8 (t_8)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -7, scrub_month),  -- T-8
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -7, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_8,

    -- T-7 (t_7)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -6, scrub_month),  -- T-7
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -6, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_7,

    -- T-6 (t_6)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -5, scrub_month),  -- T-6
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -5, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_6,

    -- T-5 (t_5)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -4, scrub_month),  -- T-5
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -4, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_5,

    -- T-4 (t_4)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -3, scrub_month),  -- T-4
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -3, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_4,

    -- T-3 (t_3)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -2, scrub_month),  -- T-3
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -2, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_3,

    -- T-2 (t_2)
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', -1, scrub_month),  -- T-2
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', -1, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_2,

    -- T-1 (t_1) = SCRUB month
    case
        when hist_months is null or hist_months <= 0
             or rec_end_month is null
             or scrub_month   is null
        then null::int
        when datediff(
                 'month',
                 dateadd('month', 0, scrub_month),   -- T-1
                 rec_end_month
             ) not between 0 and hist_months - 1
        then null::int
        else cast(
            nullif(
                trim(
                    substring(
                        dpd_processed,
                        (
                            datediff(
                                'month',
                                dateadd('month', 0, scrub_month),
                                rec_end_month
                            ) * 3 + 1
                        )::int,
                        3
                    )
                ),
                ''
            ) as int
        )
    end as t_1
 from sandbox.PP_HS_BASE_BU_TL_4;

drop table if exists PP_HS_BASE_BU_TL_6;
create table PP_HS_BASE_BU_TL_6 as 
select *,
(
            CASE
                WHEN (
                    CASE
                        WHEN t.t_3 IS NOT NULL THEN 1
                        WHEN t.t_2 IS NOT NULL THEN 2
                        WHEN t.t_1 IS NOT NULL THEN 3
                    END
                ) IS NULL THEN NULL
                ELSE
                    (
                        COALESCE(t.t_3, 0)
                      + COALESCE(t.t_2, 0)
                      + COALESCE(t.t_1, 0)
                    )::NUMERIC(10,4)
                    /
                    (
                        (
                            CASE
                                WHEN t.t_1 IS NOT NULL THEN 3
                                WHEN t.t_2 IS NOT NULL THEN 2
                                WHEN t.t_3 IS NOT NULL THEN 1
                            END
                        )
                        -
                        (
                            CASE
                                WHEN t.t_3 IS NOT NULL THEN 1
                                WHEN t.t_2 IS NOT NULL THEN 2
                                WHEN t.t_1 IS NOT NULL THEN 3
                            END
                        )
                        + 1
                    )
            END
        ) AS avg_dpd_l3m,

        /* ====================== last 6 months ====================== */
        (
            CASE
                WHEN (
                    CASE
                        WHEN t.t_6 IS NOT NULL THEN 1
                        WHEN t.t_5 IS NOT NULL THEN 2
                        WHEN t.t_4 IS NOT NULL THEN 3
                        WHEN t.t_3 IS NOT NULL THEN 4
                        WHEN t.t_2 IS NOT NULL THEN 5
                        WHEN t.t_1 IS NOT NULL THEN 6
                    END
                ) IS NULL THEN NULL
                ELSE
                    (
                        COALESCE(t.t_6, 0)
                      + COALESCE(t.t_5, 0)
                      + COALESCE(t.t_4, 0)
                      + COALESCE(t.t_3, 0)
                      + COALESCE(t.t_2, 0)
                      + COALESCE(t.t_1, 0)
                    )::NUMERIC(10,4)
                    /
                    (
                        (
                            CASE
                                WHEN t.t_1 IS NOT NULL THEN 6
                                WHEN t.t_2 IS NOT NULL THEN 5
                                WHEN t.t_3 IS NOT NULL THEN 4
                                WHEN t.t_4 IS NOT NULL THEN 3
                                WHEN t.t_5 IS NOT NULL THEN 2
                                WHEN t.t_6 IS NOT NULL THEN 1
                            END
                        )
                        -
                        (
                            CASE
                                WHEN t.t_6 IS NOT NULL THEN 1
                                WHEN t.t_5 IS NOT NULL THEN 2
                                WHEN t.t_4 IS NOT NULL THEN 3
                                WHEN t.t_3 IS NOT NULL THEN 4
                                WHEN t.t_2 IS NOT NULL THEN 5
                                WHEN t.t_1 IS NOT NULL THEN 6
                            END
                        )
                        + 1
                    )
            END
        ) AS avg_dpd_l6m,

        /* ====================== last 9 months ====================== */
        (
            CASE
                WHEN (
                    CASE
                        WHEN t.t_9 IS NOT NULL THEN 1
                        WHEN t.t_8 IS NOT NULL THEN 2
                        WHEN t.t_7 IS NOT NULL THEN 3
                        WHEN t.t_6 IS NOT NULL THEN 4
                        WHEN t.t_5 IS NOT NULL THEN 5
                        WHEN t.t_4 IS NOT NULL THEN 6
                        WHEN t.t_3 IS NOT NULL THEN 7
                        WHEN t.t_2 IS NOT NULL THEN 8
                        WHEN t.t_1 IS NOT NULL THEN 9
                    END
                ) IS NULL THEN NULL
                ELSE
                    (
                        COALESCE(t.t_9, 0)
                      + COALESCE(t.t_8, 0)
                      + COALESCE(t.t_7, 0)
                      + COALESCE(t.t_6, 0)
                      + COALESCE(t.t_5, 0)
                      + COALESCE(t.t_4, 0)
                      + COALESCE(t.t_3, 0)
                      + COALESCE(t.t_2, 0)
                      + COALESCE(t.t_1, 0)
                    )::NUMERIC(10,4)
                    /
                    (
                        (
                            CASE
                                WHEN t.t_1 IS NOT NULL THEN 9
                                WHEN t.t_2 IS NOT NULL THEN 8
                                WHEN t.t_3 IS NOT NULL THEN 7
                                WHEN t.t_4 IS NOT NULL THEN 6
                                WHEN t.t_5 IS NOT NULL THEN 5
                                WHEN t.t_6 IS NOT NULL THEN 4
                                WHEN t.t_7 IS NOT NULL THEN 3
                                WHEN t.t_8 IS NOT NULL THEN 2
                                WHEN t.t_9 IS NOT NULL THEN 1
                            END
                        )
                        -
                        (
                            CASE
                                WHEN t.t_9 IS NOT NULL THEN 1
                                WHEN t.t_8 IS NOT NULL THEN 2
                                WHEN t.t_7 IS NOT NULL THEN 3
                                WHEN t.t_6 IS NOT NULL THEN 4
                                WHEN t.t_5 IS NOT NULL THEN 5
                                WHEN t.t_4 IS NOT NULL THEN 6
                                WHEN t.t_3 IS NOT NULL THEN 7
                                WHEN t.t_2 IS NOT NULL THEN 8
                                WHEN t.t_1 IS NOT NULL THEN 9
                            END
                        )
                        + 1
                    )
            END
        ) AS avg_dpd_l9m,

        /* ====================== last 12 months ====================== */
        (
            CASE
                WHEN (
                    CASE
                        WHEN t.t_12 IS NOT NULL THEN 1
                        WHEN t.t_11 IS NOT NULL THEN 2
                        WHEN t.t_10 IS NOT NULL THEN 3
                        WHEN t.t_9 IS NOT NULL THEN 4
                        WHEN t.t_8 IS NOT NULL THEN 5
                        WHEN t.t_7 IS NOT NULL THEN 6
                        WHEN t.t_6 IS NOT NULL THEN 7
                        WHEN t.t_5 IS NOT NULL THEN 8
                        WHEN t.t_4 IS NOT NULL THEN 9
                        WHEN t.t_3 IS NOT NULL THEN 10
                        WHEN t.t_2 IS NOT NULL THEN 11
                        WHEN t.t_1 IS NOT NULL THEN 12
                    END
                ) IS NULL THEN NULL
                ELSE
                    (
                        COALESCE(t.t_12, 0) + COALESCE(t.t_11, 0)
                      + COALESCE(t.t_10, 0) + COALESCE(t.t_9, 0)
                      + COALESCE(t.t_8, 0)  + COALESCE(t.t_7, 0)
                      + COALESCE(t.t_6, 0)  + COALESCE(t.t_5, 0)
                      + COALESCE(t.t_4, 0)  + COALESCE(t.t_3, 0)
                      + COALESCE(t.t_2, 0)  + COALESCE(t.t_1, 0)
                    )::NUMERIC(10,4)
                    /
                    (
                        (
                            CASE
                                WHEN t.t_1 IS NOT NULL THEN 12
                                WHEN t.t_2 IS NOT NULL THEN 11
                                WHEN t.t_3 IS NOT NULL THEN 10
                                WHEN t.t_4 IS NOT NULL THEN 9
                                WHEN t.t_5 IS NOT NULL THEN 8
                                WHEN t.t_6 IS NOT NULL THEN 7
                                WHEN t.t_7 IS NOT NULL THEN 6
                                WHEN t.t_8 IS NOT NULL THEN 5
                                WHEN t.t_9 IS NOT NULL THEN 4
                                WHEN t.t_10 IS NOT NULL THEN 3
                                WHEN t.t_11 IS NOT NULL THEN 2
                                WHEN t.t_12 IS NOT NULL THEN 1
                            END
                        )
                        -
                        (
                            CASE
                                WHEN t.t_12 IS NOT NULL THEN 1
                                WHEN t.t_11 IS NOT NULL THEN 2
                                WHEN t.t_10 IS NOT NULL THEN 3
                                WHEN t.t_9 IS NOT NULL THEN 4
                                WHEN t.t_8 IS NOT NULL THEN 5
                                WHEN t.t_7 IS NOT NULL THEN 6
                                WHEN t.t_6 IS NOT NULL THEN 7
                                WHEN t.t_5 IS NOT NULL THEN 8
                                WHEN t.t_4 IS NOT NULL THEN 9
                                WHEN t.t_3 IS NOT NULL THEN 10
                                WHEN t.t_2 IS NOT NULL THEN 11
                                WHEN t.t_1 IS NOT NULL THEN 12
                            END
                        )
                        + 1
                    )
            END
        ) AS avg_dpd_l12m,

        /* ====================== last 18 months ====================== */
        (
            CASE
                WHEN (
                    CASE
                        WHEN t.t_18 IS NOT NULL THEN 1
                        WHEN t.t_17 IS NOT NULL THEN 2
                        WHEN t.t_16 IS NOT NULL THEN 3
                        WHEN t.t_15 IS NOT NULL THEN 4
                        WHEN t.t_14 IS NOT NULL THEN 5
                        WHEN t.t_13 IS NOT NULL THEN 6
                        WHEN t.t_12 IS NOT NULL THEN 7
                        WHEN t.t_11 IS NOT NULL THEN 8
                        WHEN t.t_10 IS NOT NULL THEN 9
                        WHEN t.t_9 IS NOT NULL THEN 10
                        WHEN t.t_8 IS NOT NULL THEN 11
                        WHEN t.t_7 IS NOT NULL THEN 12
                        WHEN t.t_6 IS NOT NULL THEN 13
                        WHEN t.t_5 IS NOT NULL THEN 14
                        WHEN t.t_4 IS NOT NULL THEN 15
                        WHEN t.t_3 IS NOT NULL THEN 16
                        WHEN t.t_2 IS NOT NULL THEN 17
                        WHEN t.t_1 IS NOT NULL THEN 18
                    END
                ) IS NULL THEN NULL
                ELSE
                    (
                        COALESCE(t.t_18,0) + COALESCE(t.t_17,0)
                      + COALESCE(t.t_16,0) + COALESCE(t.t_15,0)
                      + COALESCE(t.t_14,0) + COALESCE(t.t_13,0)
                      + COALESCE(t.t_12,0) + COALESCE(t.t_11,0)
                      + COALESCE(t.t_10,0) + COALESCE(t.t_9,0)
                      + COALESCE(t.t_8,0)  + COALESCE(t.t_7,0)
                      + COALESCE(t.t_6,0)  + COALESCE(t.t_5,0)
                      + COALESCE(t.t_4,0)  + COALESCE(t.t_3,0)
                      + COALESCE(t.t_2,0)  + COALESCE(t.t_1,0)
                    )::NUMERIC(10,4)
                    /
                    (
                        (
                            CASE
                                WHEN t.t_1 IS NOT NULL THEN 18
                                WHEN t.t_2 IS NOT NULL THEN 17
                                WHEN t.t_3 IS NOT NULL THEN 16
                                WHEN t.t_4 IS NOT NULL THEN 15
                                WHEN t.t_5 IS NOT NULL THEN 14
                                WHEN t.t_6 IS NOT NULL THEN 13
                                WHEN t.t_7 IS NOT NULL THEN 12
                                WHEN t.t_8 IS NOT NULL THEN 11
                                WHEN t.t_9 IS NOT NULL THEN 10
                                WHEN t.t_10 IS NOT NULL THEN 9
                                WHEN t.t_11 IS NOT NULL THEN 8
                                WHEN t.t_12 IS NOT NULL THEN 7
                                WHEN t.t_13 IS NOT NULL THEN 6
                                WHEN t.t_14 IS NOT NULL THEN 5
                                WHEN t.t_15 IS NOT NULL THEN 4
                                WHEN t.t_16 IS NOT NULL THEN 3
                                WHEN t.t_17 IS NOT NULL THEN 2
                                WHEN t.t_18 IS NOT NULL THEN 1
                            END
                        )
                        -
                        (
                            CASE
                                WHEN t.t_18 IS NOT NULL THEN 1
                                WHEN t.t_17 IS NOT NULL THEN 2
                                WHEN t.t_16 IS NOT NULL THEN 3
                                WHEN t.t_15 IS NOT NULL THEN 4
                                WHEN t.t_14 IS NOT NULL THEN 5
                                WHEN t.t_13 IS NOT NULL THEN 6
                                WHEN t.t_12 IS NOT NULL THEN 7
                                WHEN t.t_11 IS NOT NULL THEN 8
                                WHEN t.t_10 IS NOT NULL THEN 9
                                WHEN t.t_9 IS NOT NULL THEN 10
                                WHEN t.t_8 IS NOT NULL THEN 11
                                WHEN t.t_7 IS NOT NULL THEN 12
                                WHEN t.t_6 IS NOT NULL THEN 13
                                WHEN t.t_5 IS NOT NULL THEN 14
                                WHEN t.t_4 IS NOT NULL THEN 15
                                WHEN t.t_3 IS NOT NULL THEN 16
                                WHEN t.t_2 IS NOT NULL THEN 17
                                WHEN t.t_1 IS NOT NULL THEN 18
                            END
                        )
                        + 1
                    )
            END
        ) AS avg_dpd_l18m,

        /* ====================== last 24 months ====================== */
        (
            CASE
                WHEN (
                    CASE
                        WHEN t.t_24 IS NOT NULL THEN 1
                        WHEN t.t_23 IS NOT NULL THEN 2
                        WHEN t.t_22 IS NOT NULL THEN 3
                        WHEN t.t_21 IS NOT NULL THEN 4
                        WHEN t.t_20 IS NOT NULL THEN 5
                        WHEN t.t_19 IS NOT NULL THEN 6
                        WHEN t.t_18 IS NOT NULL THEN 7
                        WHEN t.t_17 IS NOT NULL THEN 8
                        WHEN t.t_16 IS NOT NULL THEN 9
                        WHEN t.t_15 IS NOT NULL THEN 10
                        WHEN t.t_14 IS NOT NULL THEN 11
                        WHEN t.t_13 IS NOT NULL THEN 12
                        WHEN t.t_12 IS NOT NULL THEN 13
                        WHEN t.t_11 IS NOT NULL THEN 14
                        WHEN t.t_10 IS NOT NULL THEN 15
                        WHEN t.t_9 IS NOT NULL THEN 16
                        WHEN t.t_8 IS NOT NULL THEN 17
                        WHEN t.t_7 IS NOT NULL THEN 18
                        WHEN t.t_6 IS NOT NULL THEN 19
                        WHEN t.t_5 IS NOT NULL THEN 20
                        WHEN t.t_4 IS NOT NULL THEN 21
                        WHEN t.t_3 IS NOT NULL THEN 22
                        WHEN t.t_2 IS NOT NULL THEN 23
                        WHEN t.t_1 IS NOT NULL THEN 24
                    END
                ) IS NULL THEN NULL
                ELSE
                    (
                        COALESCE(t.t_24,0) + COALESCE(t.t_23,0) + COALESCE(t.t_22,0) + COALESCE(t.t_21,0)
                      + COALESCE(t.t_20,0) + COALESCE(t.t_19,0) + COALESCE(t.t_18,0) + COALESCE(t.t_17,0)
                      + COALESCE(t.t_16,0) + COALESCE(t.t_15,0) + COALESCE(t.t_14,0) + COALESCE(t.t_13,0)
                      + COALESCE(t.t_12,0) + COALESCE(t.t_11,0) + COALESCE(t.t_10,0) + COALESCE(t.t_9,0)
                      + COALESCE(t.t_8,0)  + COALESCE(t.t_7,0)  + COALESCE(t.t_6,0)  + COALESCE(t.t_5,0)
                      + COALESCE(t.t_4,0)  + COALESCE(t.t_3,0)  + COALESCE(t.t_2,0)  + COALESCE(t.t_1,0)
                    )::NUMERIC(10,4)
                    /
                    (
                        (
                            CASE
                                WHEN t.t_1 IS NOT NULL THEN 24
                                WHEN t.t_2 IS NOT NULL THEN 23
                                WHEN t.t_3 IS NOT NULL THEN 22
                                WHEN t.t_4 IS NOT NULL THEN 21
                                WHEN t.t_5 IS NOT NULL THEN 20
                                WHEN t.t_6 IS NOT NULL THEN 19
                                WHEN t.t_7 IS NOT NULL THEN 18
                                WHEN t.t_8 IS NOT NULL THEN 17
                                WHEN t.t_9 IS NOT NULL THEN 16
                                WHEN t.t_10 IS NOT NULL THEN 15
                                WHEN t.t_11 IS NOT NULL THEN 14
                                WHEN t.t_12 IS NOT NULL THEN 13
                                WHEN t.t_13 IS NOT NULL THEN 12
                                WHEN t.t_14 IS NOT NULL THEN 11
                                WHEN t.t_15 IS NOT NULL THEN 10
                                WHEN t.t_16 IS NOT NULL THEN 9
                                WHEN t.t_17 IS NOT NULL THEN 8
                                WHEN t.t_18 IS NOT NULL THEN 7
                                WHEN t.t_19 IS NOT NULL THEN 6
                                WHEN t.t_20 IS NOT NULL THEN 5
                                WHEN t.t_21 IS NOT NULL THEN 4
                                WHEN t.t_22 IS NOT NULL THEN 3
                                WHEN t.t_23 IS NOT NULL THEN 2
                                WHEN t.t_24 IS NOT NULL THEN 1
                            END
                        )
                        -
                        (
                            CASE
                                WHEN t.t_24 IS NOT NULL THEN 1
                                WHEN t.t_23 IS NOT NULL THEN 2
                                WHEN t.t_22 IS NOT NULL THEN 3
                                WHEN t.t_21 IS NOT NULL THEN 4
                                WHEN t.t_20 IS NOT NULL THEN 5
                                WHEN t.t_19 IS NOT NULL THEN 6
                                WHEN t.t_18 IS NOT NULL THEN 7
                                WHEN t.t_17 IS NOT NULL THEN 8
                                WHEN t.t_16 IS NOT NULL THEN 9
                                WHEN t.t_15 IS NOT NULL THEN 10
                                WHEN t.t_14 IS NOT NULL THEN 11
                                WHEN t.t_13 IS NOT NULL THEN 12
                                WHEN t.t_12 IS NOT NULL THEN 13
                                WHEN t.t_11 IS NOT NULL THEN 14
                                WHEN t.t_10 IS NOT NULL THEN 15
                                WHEN t.t_9 IS NOT NULL THEN 16
                                WHEN t.t_8 IS NOT NULL THEN 17
                                WHEN t.t_7 IS NOT NULL THEN 18
                                WHEN t.t_6 IS NOT NULL THEN 19
                                WHEN t.t_5 IS NOT NULL THEN 20
                                WHEN t.t_4 IS NOT NULL THEN 21
                                WHEN t.t_3 IS NOT NULL THEN 22
                                WHEN t.t_2 IS NOT NULL THEN 23
                                WHEN t.t_1 IS NOT NULL THEN 24
                            END
                        )
                        + 1
                    )
            END
        ) AS avg_dpd_l24m,

        /* ====================== last 36 months ====================== */
        (
            CASE
                WHEN (
                    CASE
                        WHEN t.t_36 IS NOT NULL THEN 1
                        WHEN t.t_35 IS NOT NULL THEN 2
                        WHEN t.t_34 IS NOT NULL THEN 3
                        WHEN t.t_33 IS NOT NULL THEN 4
                        WHEN t.t_32 IS NOT NULL THEN 5
                        WHEN t.t_31 IS NOT NULL THEN 6
                        WHEN t.t_30 IS NOT NULL THEN 7
                        WHEN t.t_29 IS NOT NULL THEN 8
                        WHEN t.t_28 IS NOT NULL THEN 9
                        WHEN t.t_27 IS NOT NULL THEN 10
                        WHEN t.t_26 IS NOT NULL THEN 11
                        WHEN t.t_25 IS NOT NULL THEN 12
                        WHEN t.t_24 IS NOT NULL THEN 13
                        WHEN t.t_23 IS NOT NULL THEN 14
                        WHEN t.t_22 IS NOT NULL THEN 15
                        WHEN t.t_21 IS NOT NULL THEN 16
                        WHEN t.t_20 IS NOT NULL THEN 17
                        WHEN t.t_19 IS NOT NULL THEN 18
                        WHEN t.t_18 IS NOT NULL THEN 19
                        WHEN t.t_17 IS NOT NULL THEN 20
                        WHEN t.t_16 IS NOT NULL THEN 21
                        WHEN t.t_15 IS NOT NULL THEN 22
                        WHEN t.t_14 IS NOT NULL THEN 23
                        WHEN t.t_13 IS NOT NULL THEN 24
                        WHEN t.t_12 IS NOT NULL THEN 25
                        WHEN t.t_11 IS NOT NULL THEN 26
                        WHEN t.t_10 IS NOT NULL THEN 27
                        WHEN t.t_9 IS NOT NULL THEN 28
                        WHEN t.t_8 IS NOT NULL THEN 29
                        WHEN t.t_7 IS NOT NULL THEN 30
                        WHEN t.t_6 IS NOT NULL THEN 31
                        WHEN t.t_5 IS NOT NULL THEN 32
                        WHEN t.t_4 IS NOT NULL THEN 33
                        WHEN t.t_3 IS NOT NULL THEN 34
                        WHEN t.t_2 IS NOT NULL THEN 35
                        WHEN t.t_1 IS NOT NULL THEN 36
                    END
                ) IS NULL THEN NULL
                ELSE
                    (
                        COALESCE(t.t_36,0) + COALESCE(t.t_35,0) + COALESCE(t.t_34,0) + COALESCE(t.t_33,0)
                      + COALESCE(t.t_32,0) + COALESCE(t.t_31,0) + COALESCE(t.t_30,0) + COALESCE(t.t_29,0)
                      + COALESCE(t.t_28,0) + COALESCE(t.t_27,0) + COALESCE(t.t_26,0) + COALESCE(t.t_25,0)
                      + COALESCE(t.t_24,0) + COALESCE(t.t_23,0) + COALESCE(t.t_22,0) + COALESCE(t.t_21,0)
                      + COALESCE(t.t_20,0) + COALESCE(t.t_19,0) + COALESCE(t.t_18,0) + COALESCE(t.t_17,0)
                      + COALESCE(t.t_16,0) + COALESCE(t.t_15,0) + COALESCE(t.t_14,0) + COALESCE(t.t_13,0)
                      + COALESCE(t.t_12,0) + COALESCE(t.t_11,0) + COALESCE(t.t_10,0) + COALESCE(t.t_9,0)
                      + COALESCE(t.t_8,0)  + COALESCE(t.t_7,0)  + COALESCE(t.t_6,0)  + COALESCE(t.t_5,0)
                      + COALESCE(t.t_4,0)  + COALESCE(t.t_3,0)  + COALESCE(t.t_2,0)  + COALESCE(t.t_1,0)
                    )::NUMERIC(10,4)
                    /
                    (
                        (
                            CASE
                                WHEN t.t_1 IS NOT NULL THEN 36
                                WHEN t.t_2 IS NOT NULL THEN 35
                                WHEN t.t_3 IS NOT NULL THEN 34
                                WHEN t.t_4 IS NOT NULL THEN 33
                                WHEN t.t_5 IS NOT NULL THEN 32
                                WHEN t.t_6 IS NOT NULL THEN 31
                                WHEN t.t_7 IS NOT NULL THEN 30
                                WHEN t.t_8 IS NOT NULL THEN 29
                                WHEN t.t_9 IS NOT NULL THEN 28
                                WHEN t.t_10 IS NOT NULL THEN 27
                                WHEN t.t_11 IS NOT NULL THEN 26
                                WHEN t.t_12 IS NOT NULL THEN 25
                                WHEN t.t_13 IS NOT NULL THEN 24
                                WHEN t.t_14 IS NOT NULL THEN 23
                                WHEN t.t_15 IS NOT NULL THEN 22
                                WHEN t.t_16 IS NOT NULL THEN 21
                                WHEN t.t_17 IS NOT NULL THEN 20
                                WHEN t.t_18 IS NOT NULL THEN 19
                                WHEN t.t_19 IS NOT NULL THEN 18
                                WHEN t.t_20 IS NOT NULL THEN 17
                                WHEN t.t_21 IS NOT NULL THEN 16
                                WHEN t.t_22 IS NOT NULL THEN 15
                                WHEN t.t_23 IS NOT NULL THEN 14
                                WHEN t.t_24 IS NOT NULL THEN 13
                                WHEN t.t_25 IS NOT NULL THEN 12
                                WHEN t.t_26 IS NOT NULL THEN 11
                                WHEN t.t_27 IS NOT NULL THEN 10
                                WHEN t.t_28 IS NOT NULL THEN 9
                                WHEN t.t_29 IS NOT NULL THEN 8
                                WHEN t.t_30 IS NOT NULL THEN 7
                                WHEN t.t_31 IS NOT NULL THEN 6
                                WHEN t.t_32 IS NOT NULL THEN 5
                                WHEN t.t_33 IS NOT NULL THEN 4
                                WHEN t.t_34 IS NOT NULL THEN 3
                                WHEN t.t_35 IS NOT NULL THEN 2
                                WHEN t.t_36 IS NOT NULL THEN 1
                            END
                        )
                        -
                        (
                            CASE
                                WHEN t.t_36 IS NOT NULL THEN 1
                                WHEN t.t_35 IS NOT NULL THEN 2
                                WHEN t.t_34 IS NOT NULL THEN 3
                                WHEN t.t_33 IS NOT NULL THEN 4
                                WHEN t.t_32 IS NOT NULL THEN 5
                                WHEN t.t_31 IS NOT NULL THEN 6
                                WHEN t.t_30 IS NOT NULL THEN 7
                                WHEN t.t_29 IS NOT NULL THEN 8
                                WHEN t.t_28 IS NOT NULL THEN 9
                                WHEN t.t_27 IS NOT NULL THEN 10
                                WHEN t.t_26 IS NOT NULL THEN 11
                                WHEN t.t_25 IS NOT NULL THEN 12
                                WHEN t.t_24 IS NOT NULL THEN 13
                                WHEN t.t_23 IS NOT NULL THEN 14
                                WHEN t.t_22 IS NOT NULL THEN 15
                                WHEN t.t_21 IS NOT NULL THEN 16
                                WHEN t.t_20 IS NOT NULL THEN 17
                                WHEN t.t_19 IS NOT NULL THEN 18
                                WHEN t.t_18 IS NOT NULL THEN 19
                                WHEN t.t_17 IS NOT NULL THEN 20
                                WHEN t.t_16 IS NOT NULL THEN 21
                                WHEN t.t_15 IS NOT NULL THEN 22
                                WHEN t.t_14 IS NOT NULL THEN 23
                                WHEN t.t_13 IS NOT NULL THEN 24
                                WHEN t.t_12 IS NOT NULL THEN 25
                                WHEN t.t_11 IS NOT NULL THEN 26
                                WHEN t.t_10 IS NOT NULL THEN 27
                                WHEN t.t_9 IS NOT NULL THEN 28
                                WHEN t.t_8 IS NOT NULL THEN 29
                                WHEN t.t_7 IS NOT NULL THEN 30
                                WHEN t.t_6 IS NOT NULL THEN 31
                                WHEN t.t_5 IS NOT NULL THEN 32
                                WHEN t.t_4 IS NOT NULL THEN 33
                                WHEN t.t_3 IS NOT NULL THEN 34
                                WHEN t.t_2 IS NOT NULL THEN 35
                                WHEN t.t_1 IS NOT NULL THEN 36
                            END
                        )
                        + 1
                    )
            END
        ) AS avg_dpd_l36m
 from PP_HS_BASE_BU_TL_5 t;

drop table if exists SANDBOX.PP_HS_BASE_BU_TL_6;
create table SANDBOX.PP_HS_BASE_BU_TL_6 as 
SELECT * FROM PP_HS_BASE_BU_TL_6;

SELECT * FROM PP_HS_BASE_BU_TL_6;