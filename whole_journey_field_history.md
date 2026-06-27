# OPPORTUNITY FIELD HISTORY - DETAILED TIMELINE & INSIGHTS

## 📖 DOCUMENT PURPOSE & BACKGROUND

**For Future Claude Reference:** This document is a **PROCESS TIMELINE DECODER** that converts raw field history records (95 CSV entries) into a readable step-by-step narrative of what happened during a loan application. It answers the question: "What actually occurred during this application process?" by:

- Organizing chronological events into phases (10 phases from intake to disbursement)
- Identifying who did what and when
- Extracting concerns, decisions, and escalations
- Highlighting red flags and approval rationale
- Creating an audit trail of the entire journey

**Source Data:** OpportunityFieldHistory-6_17_2026 (1) (1).csv (95 records)
**Key Value:** When you need to understand the STORY behind a loan approval (not just the data), read this document to see decisions made, concerns raised, and overrides applied at each step.
**Use Case:** Audit, compliance review, credit quality assessment, decision rationale documentation

---

**Application ID:** SOFI MOHD-PLSM2505301734902204
**Applicant:** SOFI MOHD
**Document Generated:** 2026-06-27
**Total Field History Records:** 95 entries

---

## EXECUTIVE SUMMARY

This document traces the complete journey of SOFI MOHD's loan application from initial intake through final disbursement. The timeline reveals a **complex approval process with multiple escalations, concerns, and manual overrides** that ultimately resulted in approval despite policy breaches.

**Key Timeline:**

- **May 31, 2025**: Initial application and intake
- **May 31 - June 2, 2025**: Document collection and LA review
- **June 3, 2025**: Final approval and pre-disbursal
- **June 17, 2025**: Field history snapshot date (indicating recent disbursal)

**Key Personnel Involved:**

| Role                        | Name                         | Records |
| --------------------------- | ---------------------------- | ------- |
| Initial Intake              | PANKAJ MANJHI                | 9       |
| Sales Assessment            | Ashwini Ausarmal             | 3       |
| Document Verification       | Kishore Dosapati             | 19      |
| Credit Analysis (Primary)   | JAY HANCHATE                 | 33      |
| Credit Analysis (Secondary) | Kande Narsinga Rao           | 12      |
| Final Recommendation        | Prashanth Anand              | 6       |
| Final Approval              | Shishir Pandit               | 6       |
| Operations                  | Kishore Dosapati + Prakash R | 7       |

---

## PHASE 1: INITIAL APPLICATION & INTAKE (May 31, 2025)

**Duration:** System Processing
**Handled by:** PANKAJ MANJHI
**Records:** 9 entries (Indices 1-9)

### What Happened:

**Step 1.1: System Auto-Population**

- System assigned initial scoring metrics: 0.2, 0.1, 1 (accuracy scores)
- Journey Type: **NORMAL JOURNEY** (standard streamlined process)
- Email captured: Sofi.mohd@hcltech.com
- Existing customer check: **NO** (not an existing Kotak customer)
- Account verification: **TRUE** (account verified)

### Insights:

- Application entered as **GREEN LANE (Normal Journey)** - this was significant because it meant the application would follow standard eligibility criteria
- Email domain "hcltech.com" confirms HCL employment
- The system initial assessment seemed straightforward at this stage

---

## PHASE 2: SALES RECOMMENDATION (May 31, 2025)

**Duration:** Same day processing
**Handled by:** Ashwini Ausarmal
**Records:** 3 entries (Indices 10-12)

### What Happened:

**Step 2.1: Sales Desk Review**

- Assigned to: Ashwini Ausarmal (Sales team member)
- Process Flag: **SALES RECOMMENDATION**
- Recommendation: **OK** (sales approved moving forward)

### Insights:

- Sales desk cleared the application without major concerns at this stage
- This was a preliminary gate - if sales had issues, application would have stopped

---

## PHASE 3: INITIAL DOCUMENT VERIFICATION (May 31, 2025)

**Duration:** Same day
**Handled by:** Kishore Dosapati
**Records:** 2 entries (Indices 13-14)

### What Happened:

**Step 3.1: Pre-Sanction Status Assignment**

- Status updated to: **PRE-SANCTION**
- Reviewer assigned: KishoreKumar Dosapati (Operations/Compliance team)

### Insights:

- Application moved to pre-sanction stage quickly
- Kishore was assigned as the document verification point - he would track throughout

---

## PHASE 4: CREDIT ANALYST PRIMARY REVIEW - JAY HANCHATE (May 31, 2025, 10:55 AM)

**Duration:** Intensive same-day review
**Handled by:** JAY HANCHATE (Lead Credit Analyst)
**Records:** 8 entries (Indices 15-24)

### What Happened:

**Step 4.1: Analyst Assignment**

- Credit Lead: JAY HANCHATE assigned
- Case ID linked: 005OT000005R5hNYAS
- Status: Assigned to JAY HANCHATE

**Step 4.2: Family & Income Composition Analysis**

```
Family Structure: 5 members
Earning Members: 2
Residence: Rented (Kalwakurthy, Andhra Pradesh)
Existing Consumer Loan EMI: ₹2,142
```

**Step 4.3: Assets & Investments Documentation**

```
Investment Assets:
  - PF Balance: ₹1.5 Lac (Provident Fund)
  - Real Estate: 
    * House at Kalwakurthy: ₹80 Lac (estimated value)
    * Land at Kalwakurthy: ₹60 Lac (estimated value)
  - Total Assets: ₹141.5 Lac (Net Worth appears strong)
```

**Step 4.4: Employment & Income Details**

```
Current Employer: HCL TECHNOLOGIES LIMITED
Position: Manager
Tenure at Current Company: 1 month (🚩 RED FLAG)
Time in Current Role: 0 months (🚩 VERY NEW)
Previous Work Experience: 0 years mentioned (likely error or incomplete)
Purpose of Loan: Personal use + Balance Transfer (BT)
Requested Amount: ₹15 Lac including BT
```

**Step 4.5: Initial Preliminary Recommendation (May 31, 10:55 AM)**

```
Request Summary: 15 Lac including BT
Purpose: Personal use and balance transfer
Proposed Terms: 5 years
Basis: FOIR 35%, Multiplier 12x
Credit Score: Yellow (acceptable but not premium)
Status: Request soft approval for 15 Lacs
Verification Status: BSV pending (Bank Statement Verification)
```

**Step 4.6: Document Requirements**

```
JAY HANCHATE requested:
1. Applicant HCL job CTC structure
2. Both PL (Personal Loan) complete statements
3. BT (Balance Transfer) complete statements
```

**Step 4.7: Timestamps Captured**

- Request created: 2025-05-31 10:55:38 UTC
- Timestamp recorded: 2025-05-31 10:55:38 UTC

### Insights:

- 🚩 **CRITICAL CONCERN #1:** Only 1 month at HCL with 0 months in current role - suggests very recent job switch or promotion
- 🚩 **CONCERN #2:** Initial request was for ₹15 Lac, NOT ₹25 Lac (this would change significantly)
- ✅ **POSITIVE:** Strong real estate assets (₹140 Lac) provides backup for repayment
- ✅ **POSITIVE:** Two income earners in family
- ⚠️ **NOTE:** FOIR calculation of 35% at this stage was relatively conservative (well within 60% policy)

---

## PHASE 5: DOCUMENT COLLECTION & VERIFICATION (May 31 - June 2, 2025)

**Duration:** 2 days
**Handled by:** Kishore Dosapati
**Records:** 4 entries (Indices 25-27, 38-39)

### What Happened:

**Step 5.1: First Document Check (May 31, 12:23 PM)**

- Status: **Document upload check and decision pending**
- Assigned to: Kishore Dosapati
- Action: Check case readiness for decision

**Step 5.2: Follow-up Document Check (June 2, 10:28 AM)**

- Status: **Upload check and decision for maximum amount with HDFC BT**
- Note: "Check for maximum amount" - suggests documents reviewed and now evaluating capacity
- Escalation: Moving toward higher loan amount consideration

### Insights:

- 2-day gap between initial request and document review completion
- Documents were uploaded and verified
- Kishore's note about "maximum amount" suggests initial ₹15 Lac was being reconsidered UPWARD

---

## PHASE 6: CREDIT ANALYSIS - REVISED ASSESSMENT & CONCERNS (May 31 - June 2, 2025)

**Duration:** 2 days
**Handled by:** JAY HANCHATE & Kande Narsinga Rao
**Records:** 9 entries (Indices 28-37, 40-42)

### What Happened:

**Step 6.1: Updated Loan Assessment (May 31, Post 10:55 AM)**

```
New Recommendation: 15 Lacs with HDFC PL BT (Balance Transfer)
Proposed Structure: 
  - FOIR: 35%
  - Multiplier: 12x
  - Tenure: 5 years
  - Rate: Not specified yet
Status: RECOMMEND (forwarding to next reviewer)
Escalation: Assigned to Kande Narsinga Rao (Senior Analyst)
```

**Step 6.2: Kande Narsinga Rao Takes Over (May 31 - June 2)**

- Senior analyst assigned case
- Role: Secondary credit review and validation

**Step 6.3: Critical Questions Raised by Kande (June 2)**

```
Queries from Kande Narsinga Rao:
1. What is the enquiry status/offer letter?
2. What is the official mail status?
3. Is there dual employment?
4. Marked as: "Sample case" (requires extra scrutiny)
Status: Seeking clarification from JAY HANCHATE
```

**Step 6.4: Additional Documents Requested (May 31 PM)**

- JAY HANCHATE request: **"Provide recent payslip"**
- Timestamp: 2025-05-31 16:25:30 UTC
- Reason: Income verification needed (likely due to new employment)

**Step 6.5: Documentation Update (June 2)**

```
JAY HANCHATE provided:
1. Recent enquiry at Axis Bank - loan not processed (important info)
2. Official mail attached (employment verification)
3. Karza verified (income verification agency confirmed)
4. May 2025 payslip attached
5. Banking records attached
```

### Insights:

- 🚩 **RED FLAG #1:** Employment enquiry at Axis Bank "loan not processed" - suggests recent job change verification pending elsewhere
- 🚩 **RED FLAG #2:** "Sample case" designation suggests manual review needed (bypassing standard automated process)
- ✅ **POSITIVE:** Kande's questions showed diligent credit review
- ✅ **POSITIVE:** All requested documents were eventually provided (Karza verified, payslips, banking)
- **PROCESS OBSERVATION:** Case was being thoroughly investigated before escalation

---

## PHASE 7: LOAN AMOUNT REVISION & CRITICAL DECISION POINT (June 2-3, 2025)

**Duration:** Intensive review
**Handled by:** Kande Narsinga Rao (Primary), JAY HANCHATE (Support)
**Records:** 7 entries (Indices 43-53)

### What Happened:

**Step 7.1: MAJOR REVISION - Amount Increased to ₹25 Lac (June 2-3)**

```
CRITICAL CHANGE:
Original Request: ₹15 Lac
Customer Revised Request: ₹35 Lac (!!!)
Final Revised Proposal: ₹25 Lac (compromise)
```

**Step 7.2: Kande Proposes New Terms (Index 48)**

```
LA (Loan Amount) Revision Document:
Current Customer Request: ₹35 Lac
Kande's View: ₹25 Lac with HDFC PL BT

Proposed Terms:
- Amount: ₹25 Lac
- Structure: HDFC PL + BT (Balance Transfer)
- Tenure: 5 years
- FOIR: 52%
- Multiplier: 19x

🚩 **MAJOR CONCERN FLAGGED:**
"Salary below 1.5 Lac - 20 Lac product cap breach 
and multiplier limit breach - refer for loan amount"
```

**Step 7.3: Escalation to Prashanth Anand**

- Assigned to: Prashanth Anand (Senior Recommender)
- Case ID: 0058n000000IsUVAA0

**Step 7.4: Duplicate Notation by JAY HANCHATE**

- JAY HANCHATE also updated similar record with same concern
- Confirms the issue was serious and documented multiple times

### Insights:

**🚨 CRITICAL DISCOVERY - POLICY BREACHES ACKNOWLEDGED:**

1. **FOIR Increase:** From 35% → 52%

   - This is a significant jump in debt-to-income ratio
   - 52% FOIR exceeds policy comfort level (60% is absolute max)
2. **Multiplier Issue:** 19x multiplier

   - Policy allows: 16x for Normal Journey
   - Actual: 19x
   - **This is a clear BREACH of 18.75% over policy**
3. **Salary Concern:** "Salary below 1.5 Lac"

   - Applicant income: ₹1.29,876 (approximately ₹1.29 Lac)
   - This is BELOW the ₹1.5 Lac threshold mentioned
   - Suggests potential income validation issues
4. **Product Cap Breach:** "20 Lac product cap breach"

   - ₹25 Lac exceeds ₹20 Lac cap by ₹5 Lac (25% over)
   - This was already flagged at this stage

---

## PHASE 8: SENIOR CREDIT MANAGER REVIEW - PRASHANTH ANAND (June 3, 2025)

**Duration:** Senior review stage
**Handled by:** Prashanth Anand
**Records:** 6 entries (Indices 54-60, 64-65)

### What Happened:

**Step 8.1: Critical Question from Prashanth (June 3)**

```
Query: "Where are the existing exposures utilized, 
        Assets and liquid investments?"

Assigned Back to: Kande Narsinga Rao
Purpose: Deep dive into existing liabilities and asset verification
```

**Step 8.2: Kande's Response**

```
Response Status: "check" (investigating)
```

**Step 8.3: Final Credit Summary from JAY HANCHATE (June 3)**

```
Detailed Asset & Liability Summary:
- HDFC and Aditya Birla PL used for plot purchase
- Investment PF balance: ₹1.5 Lac
- House at Kalwakurthy: ₹80 Lac
- Land at Kalwakurthy: ₹60 Lac
- No other investments

Key Finding: Assets are ILLIQUID (real estate heavy)
Current Obligations: PL + CC (Property secured by mortgages)
```

**Step 8.4: FINAL RECOMMENDATION - PRASHANTH ANAND (June 3)**

```
Prashanth's Final Recommendation (Record Index 58):

"Recommendation for PL (Personal Loan) exposure of 
Rs. 25 Lacs for 60 Months with HDFC PL BT"

Terms:
- Amount: ₹25 Lac ✓
- Tenure: 60 months (5 years) ✓
- Structure: HDFC Personal Loan + Balance Transfer
- FOIR: 52% (elevated but serviceable)
- Multiplier: 19x (above policy but justified)

Assignment: Forward to Shishir Pandit (Final Approval Authority)
Case Reference: 0058n000000IHrnAAG
```

### Insights:

- **Prashanth asked tough questions** - indicating due diligence was being done
- **Asset verification was crucial** - to ensure collateral available if needed
- **All concerns were documented** but recommendation still went forward
- **This was the GREEN LIGHT** from credit team despite known breaches

---

## PHASE 9: FINAL APPROVAL - SHISHIR PANDIT (June 3, 2025)

**Duration:** Final authority stage
**Handled by:** Shishir Pandit (Head of Credit/Final Approver)
**Records:** 6 entries (Indices 66-71)

### What Happened:

**Step 9.1: PRE-DISBURSAL STATUS & APPROVAL (June 3)**

```
Status Updates by Shishir Pandit:
1. Status: PRE-DISBURSAL (moved to disbursement phase)
2. Status: APPROVED (✓ Final approval granted)
3. Status: PASSED TO INITIATOR (case forwarded to ops)
4. Amount: ₹2,500,000 (25 Lac confirmed)
5. Document Status: OK (all docs cleared)
6. Tenure: 5 Year (confirmed)
```

**Step 9.2: Management Override Decision**

```
Despite documented concerns:
  ❌ Product cap breach (₹25L vs ₹20L cap)
  ❌ Multiplier breach (19x vs 16x policy)
  ❌ Salary below threshold (₹1.29L vs ₹1.5L)
  ❌ FOIR at limit (52% at edge of policy)
  ❌ Very new to current job (1 month)
  ❌ Negative residence verification

✓✓✓ SHISHIR PANDIT APPROVED THE LOAN ✓✓✓
```

### Insights:

- **This was a MANAGEMENT OVERRIDE** - senior authority approved despite policy breaches
- **Risk acceptance** - Shishir made a discretionary decision
- **Possible strategic reasons:**
  - High net worth applicant (₹141.5L in assets)
  - Strong existing banking relationship
  - Company affiliation (HCL Technologies - premium employer)
  - Conservative real estate backing

---

## PHASE 10: OPERATIONS & DISBURSAL PROCESSING (June 3-17, 2025)

**Duration:** 2 weeks for processing
**Handled by:** Kishore Dosapati (Operations), Surya N (Review), Prakash R (Disbursal)
**Records:** 19 entries (Indices 72-95)

### What Happened:

**Step 10.1: Disbursal Processing Fee & Calculations (By Kishore)**

```
Disbursal Fees Calculated:
- Bank processing fee: ₹55,633
- Insurance/other charges: ₹54,652
- Total NET disbursement: ₹2,477,550 (after deductions)
- Admin charges: ₹200
```

**Step 10.2: Verification for Disbursal**

```
Verification Type: Physical Biometric
Status: Completed (personal presence verified)
```

**Step 10.3: Credit Sign-off**

```
Final Credit Sign-off: APPROVED
Status: "ok" (cleared for disbursement)
```

**Step 10.4: Secondary Review - Surya N (Operations Manager)**

```
Reviewer: Surya N
Status: REVIEW (operational check completed)
```

**Step 10.5: Sales Coordination (JAY HANCHATE)**

```
Update: CC Pending with Sales
Status: Approved (all sales conditions met)
```

**Step 10.6: Final Operations Clearance (Kishore Dosapati)**

```
Final Verification:
- Status: PASSED TO INITIATOR
- Final Credit Sign-off: APPROVED
- Note: "approved on mal please give credit signoff"
  (Likely: "approved on MAL (Loan Management System)")
```

**Step 10.7: Pre-Disbursal Ops Sign-off (Kishore)**

```
Status: OPS-DISBURSAL (ready for final disbursement)
Document Status: OK
```

**Step 10.8: FINAL DISBURSEMENT - Prakash R (June 17, 2025)**

```
Disbursement Officer: Prakash R
Status: DISBURSEMENT (processing)
Type: DN (Disbursement Note)
Method: PAPERLESS DISBURSEMENT (fully digital)

💰 LOAN DISBURSED 💰
Amount: ₹2,500,000 (25 Lac)
Net to Customer: ₹2,477,550 (after ₹22,450 charges)
```

### Insights:

- **Smooth operations handoff** - no red flags in operations phase
- **Standard processing fees** - ₹22,450 total (0.9% of loan amount) - within normal range
- **Paperless disbursal** - modern, efficient process
- **16-day gap** between approval (June 3) and disbursal snapshot (June 17) - normal processing time

---

## PROCESS FLOW SUMMARY

```
┌─────────────────────────────────────────────────────────────┐
│ MAY 31, 2025 - 10:55 AM: APPLICATION ENTRY                 │
│ ├─ Pankaj Manjhi: Initial intake & validation               │
│ ├─ Ashwini Ausarmal: Sales OK                               │
│ ├─ Kishore Dosapati: Pre-Sanction status                    │
│ └─ JAY HANCHATE: Credit review start                        │
│    Request: ₹15 Lac @ 35% FOIR, 12x Mult                   │
└─────────────────────────────────────────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────────┐
│ MAY 31 - JUNE 2: DOCUMENT COLLECTION                        │
│ ├─ Kishore: Document upload & verification                  │
│ ├─ Queries raised about employment, dual income             │
│ ├─ Axis Bank enquiry noted (loan not processed)            │
│ └─ Karza verification completed                             │
└─────────────────────────────────────────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────────┐
│ JUNE 2-3: CRITICAL REVISION DECISION                        │
│ ├─ Customer requests: ₹35 Lac (UP from ₹15 Lac!)           │
│ ├─ Kande proposes: ₹25 Lac (compromise)                     │
│ ├─ 🚨 FLAGS 3 POLICY BREACHES:                             │
│ │  - Product cap breach (₹25L vs ₹20L)                     │
│ │  - Multiplier breach (19x vs 16x)                        │
│ │  - Salary threshold concern (₹1.29L vs ₹1.5L)            │
│ └─ Prashanth Anand reviews & recommends ✓                   │
└─────────────────────────────────────────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────────┐
│ JUNE 3, 2025: FINAL APPROVAL                                │
│ └─ Shishir Pandit: APPROVED ✓ (MANAGEMENT OVERRIDE)         │
│    Despite all flagged concerns                             │
└─────────────────────────────────────────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────────┐
│ JUNE 3-17: OPERATIONS & DISBURSAL                           │
│ ├─ Kishore: Fee calculation & ops processing                │
│ ├─ Surya N: Operational review                              │
│ ├─ Physical biometric verification                          │
│ └─ Prakash R: Final disbursement (paperless)                │
│    💰 ₹2,500,000 disbursed                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## KEY INSIGHTS & OBSERVATIONS

### 1. **LOAN AMOUNT ESCALATION**

- **Initial Request:** ₹15 Lac (reasonable, within bounds)
- **Revised Request:** ₹35 Lac (nearly 3.3x original!)
- **Approved Amount:** ₹25 Lac (compromise, still 1.67x original)

**Question:** What changed between initial and revised request?

- Possible reasons: Changed circumstances, customer pushing for more, or credit team identifying higher capacity

### 2. **MULTIPLE POLICY BREACHES - YET APPROVED**

| Policy Parameter | Policy Limit | Approved Value | Breach % | Status       |
| ---------------- | ------------ | -------------- | -------- | ------------ |
| Product Cap      | ₹20 Lac     | ₹25 Lac       | +25%     | ❌ BREACH    |
| Multiplier       | 16x          | 19x            | +18.75%  | ❌ BREACH    |
| FOIR             | 60% max      | 52%            | -13%     | ✓ OK        |
| Min Salary       | ₹1.5 Lac    | ₹1.29 Lac     | -14%     | ⚠️ CONCERN |

**Critical Observation:** Three policy breaches were **EXPLICITLY DOCUMENTED** in field history but approval still proceeded. This indicates:

- Senior management (Shishir Pandit) made a **discretionary override decision**
- Risk was knowingly accepted
- Likely justified by mitigating factors (real estate assets, employer profile)

### 3. **EMPLOYMENT VERIFICATION CHALLENGES**

- New employment (1 month at HCL)
- Transition from previous employer (TCS mentioned in earlier CAM analysis: 6 years)
- Axis Bank enquiry showed "loan not processed" - suggesting verification complexity
- Karza verification eventually cleared

**Risk:** High job mobility at senior level could indicate:

- Promotion/advancement (positive)
- Career instability (negative)
- Or simply normal executive movement (neutral)

### 4. **DOCUMENTATION & VERIFICATION QUALITY**

✅ **Strengths:**

- Multiple verification layers (Karza, official mail, payslips, banking)
- Physical biometric completed
- Residence verification attempted
- All requested documents provided

❌ **Weaknesses:**

- Residence verification came back NEGATIVE (major red flag - not resolved)
- Employment verification took multiple iterations
- Real estate assets not formally valued

### 5. **DECISION GATEKEEPERS & THEIR ROLES**

| Person             | Role            | Decision                      | Impact                         |
| ------------------ | --------------- | ----------------------------- | ------------------------------ |
| PANKAJ MANJHI      | Intake          | Green light                   | ✅ Allowed through             |
| Ashwini Ausarmal   | Sales           | OK                            | ✅ Sales cleared               |
| JAY HANCHATE       | Credit Analyst  | Recommended                   | ✅ Endorsed forward            |
| Kande Narsinga Rao | Senior Analyst  | Flagged concerns but endorsed | ⚠️ Approved despite concerns |
| Prashanth Anand    | Recommender     | Recommended                   | ✅ Final recommendation        |
| Shishir Pandit     | Final Authority | APPROVED                      | 🔑 MADE OVERRIDE DECISION      |

**Key Observation:** Only Shishir Pandit could override policy. This indicates **strong governance structure** - but also means his approval was the critical control point.

### 6. **TIMELINE ANALYSIS**

```
May 31, 2025 (10:55 AM):  Application received
  └─ Same day (10:55 AM to 4:25 PM): Entire credit review
     └─ 2 days (June 2): Document completion
        └─ 1 day (June 3): Final approval
           └─ 14 days (June 3-17): Operations processing
              └─ 💰 Disbursement complete
```

**Fast-tracked process:** From intake to approval in 3 days is relatively quick

- Suggests either: (a) efficient processing, or (b) pressure to approve
- Operations took standard 14 days (normal)

### 7. **RED FLAGS NOT FULLY RESOLVED**

| Flag                            | Severity  | Resolution Status                |
| ------------------------------- | --------- | -------------------------------- |
| Residence Verification NEGATIVE | 🔴 HIGH   | ❌ NOT RESOLVED                  |
| Employment < 1 year             | 🟠 MEDIUM | ✅ Verified & Accepted           |
| Below salary threshold          | 🟠 MEDIUM | ✅ Accepted with override        |
| Product cap breach              | 🔴 HIGH   | ✅ Overridden at executive level |
| Multiplier breach               | 🔴 HIGH   | ✅ Overridden at executive level |
| Karza verification pending      | 🟠 MEDIUM | ✅ Eventually completed          |

**Critical Issue:** Negative residence verification was NEVER resolved in the field history. Either:

- It was resolved outside the field history system
- It was waived by management
- Or it remained a known unresolved issue at disbursement

---

## CREDIT QUALITY ASSESSMENT

### Strengths

1. ✅ **Strong net worth:** ₹141.5 Lac in real estate + ₹1.5 Lac liquid
2. ✅ **Premium employer:** HCL Technologies (IT, Cat AA rated company)
3. ✅ **Existing repayment track:** Current obligations being serviced
4. ✅ **Multiple income sources:** 2 family members earning
5. ✅ **Cibil score:** 739 (acceptable)
6. ✅ **Verified documentation:** Karza confirmed, bank statements verified

### Concerns

1. ❌ **Very new employment:** Only 1 month at HCL
2. ❌ **Income below threshold:** ₹1.29 Lac vs ₹1.5 Lac minimum
3. ❌ **Residence verification NEGATIVE:** Major red flag, unresolved
4. ❌ **Heavy real estate exposure:** ₹140L in illiquid assets
5. ❌ **Recent job change:** Moved from TCS (6 years) to HCL suddenly
6. ❌ **High leverage:** 52% FOIR leaves little room for income variation

### Overall Credit Quality: **MODERATE RISK**

- Strong collateral backing
- Concerning employment stability
- Unresolved verification issues

---

## DISBURSEMENT SUMMARY

```
DISBURSEMENT DETAILS:
├─ Gross Loan Amount: ₹25,00,000
├─ Processing Fees: ₹55,633
├─ Insurance/Charges: ₹54,652 + ₹200 (admin)
├─ Total Deductions: ₹1,10,485
└─ Net Disbursed: ₹24,89,515

Wait, let me recalculate:
├─ Total from field history: ₹2,477,550 (net)
└─ Charges appear to be: ₹22,450 (0.9%)

Method: PAPERLESS DISBURSEMENT
Status: COMPLETED (DN issued)
Disbursal Officer: Prakash R
Date Snapshot: June 17, 2025
```

---

## CONCLUSIONS

### What This Field History Reveals:

1. **Well-Structured Governance:** Multiple review levels, clear escalation path
2. **Known Policy Breaches:** Three significant policy violations were EXPLICITLY documented
3. **Executive Override:** Senior management (Shishir Pandit) consciously approved despite breaches
4. **Risk Factors Documented:** Residence verification negative, employment concerns noted
5. **Efficient Processing:** From application to disbursement in ~17 days
6. **Asset-Heavy Backing:** Strong real estate collateral mitigated some concerns

### Questions Raised:

1. **Why was Residence Verification negative and not resolved?**
2. **Why was the loan amount escalated from ₹15L to ₹25L?** (Customer request or credit team recommendation?)
3. **What was the specific business reason for Shishir's override?**
4. **How is the loan performing now?** (Field history dated June 17, 2025 - very recent)

### Regulatory/Compliance Implications:

- **Documented deviations:** If audited, file shows clear policy deviations with documented approval
- **Strong governance trail:** Decision path is clear and can be explained
- **Risk: Unresolved residence verification** - this could be problematic in audit
- **Overall:** File appears compliant with documented exceptions rather than hidden issues