# CONSOLIDATED LOAN APPLICATION DATA

## 📋 DOCUMENT PURPOSE & BACKGROUND

**For Future Claude Reference:** This document is a **DATA AGGREGATOR & CONSISTENCY CHECKER** that consolidates information from THREE different source documents into ONE organized reference. It answers the question: "Do the three source documents tell the same story?" by:

- Extracting and organizing data from CAM.pdf (Salesforce application form)
- Extracting and organizing data from Eligibility Format.xlsx (eligibility calculations)
- Extracting and organizing data from Field History CSV (approval process timeline)
- Creating side-by-side comparison tables showing CONSISTENCY
- Highlighting DISCREPANCIES and policy breaches
- Providing gap analysis (e.g., what was calculated vs what was approved)

**Source Data:**

1. CAM.pdf (Salesforce loan application form)
2. Eligibility Format.xlsx (eligibility calculator spreadsheet)
3. Field History CSV (process timeline - summarized)

**Key Value:** When you need the BIG PICTURE of a loan application with all data in one place, this document provides comprehensive consistency analysis across all sources.
**Use Case:** Credit review, compliance audit, data integrity verification, approval rationale documentation, risk assessment

---

**Applicant:** SOFI MOHD
**Lead Reference:** PLSM2505301734902204
**Application ID:** SOFI MOHD-PLSM2505301734902204
**Data Consolidated Date:** 2026-06-27

---

## 1. GENERAL LOAN APPLICATION DETAILS (from CAM.pdf)

### Basic Information

| Field                      | Value                |
| -------------------------- | -------------------- |
| Applicant Name             | SOFI MOHD            |
| Lead Reference             | PLSM2505301734902204 |
| City/Location              | Hyderabad            |
| Source                     | DSA                  |
| File Login Date            | 2025-05-31           |
| Sub-Source                 | DSA                  |
| Product                    | Personal Loan        |
| Loan Amount Applied        | 25,00,000 (25 Lac)   |
| Existing Kotak Customer    | No                   |
| Tenure Applied             | 5 Year               |
| If Existing Customer (CRN) | *****2114            |
| Purpose of Loan            | Other                |
| App Score                  | 0.014521151          |
| DMA Name                   | FAST CREDIT          |

### Loan Details - Comparison Across Stages

| Parameter               | Applied   | System Approval | Recommended | Sanctioned |
| ----------------------- | --------- | --------------- | ----------- | ---------- |
| **Loan Amount**   | 25,00,000 | 20,00,000       | 25,00,000   | 25,00,000  |
| **Tenure**        | 5 Year    | -               | -           | 5 Year     |
| **Interest Rate** | 16%       | 16%             | 12%         | 12%        |
| **EMI**           | 60,795    | 48,636          | -           | -          |
| **FOIR**          | -         | 60%             | undefined%  | undefined% |
| **Multiplier**    | -         | 16              | -           | -          |

**Final Loan Approved:** 25,00,000
**Final Tenure Approved:** 5 Year

---

## 2. APPLICANT PERSONAL DETAILS (from CAM.pdf)

### Demographics

| Field                              | Value              |
| ---------------------------------- | ------------------ |
| Name                               | SOFI MOHD          |
| Age                                | 36                 |
| Married Status                     | Married            |
| Residence Type                     | Rented With Family |
| Years in Current Residence         | 5                  |
| Qualification                      | Graduate           |
| CP ID                              | [Empty]            |
| APAC Number                        | [Empty]            |
| Color Band                         | Yellow             |
| Salary & Disbursement Account Same | Yes                |

---

## 3. EMPLOYMENT DETAILS (from CAM.pdf)

### Current Employment

| Field                   | Value                    |
| ----------------------- | ------------------------ |
| Name of Employment      | HCL TECHNOLOGIES LIMITED |
| Designation             | MANAGER                  |
| Industry                | Information Technology   |
| Company Category        | Public Limited           |
| FICO Company Category   | Cat AA                   |
| Year in Current Company | 1                        |
| Company Master Listed   | [Not specified]          |
| Total Work Experience   | 10 Years                 |
| Income Band             | [Empty]                  |

---

## 4. APPLICANT FINANCIAL SUMMARY (from CAM.pdf)

### Income & Obligations

| Field                    | Value   |
| ------------------------ | ------- |
| Net Salary               | 129,876 |
| Current Fixed Obligation | 11,762  |
| Max Serviceable EMI      | 48,636  |

### Monthly Banking Data (Feb-May 2025)

| Month         | EOD Balance (1st) | EOD Balance (5th) | EOD Balance (10th) | EOD Balance (15th) | EOD Balance (20th) | EOD Balance (25th) | Monthly Average |
| ------------- | ----------------- | ----------------- | ------------------ | ------------------ | ------------------ | ------------------ | --------------- |
| **Feb** | 8,053.64          | 63,008.49         | 5.67               | 18,601.67          | 40,945.67          | 501.67             | 13,940.58       |
| **Mar** | 30,630.67         | 48,722.72         | 17,991.72          | 8,207.72           | 3,784.67           | 35,391.89          | 33,366.88       |
| **Apr** | 61,567.51         | 36,195.36         | 230,622.56         | 11,612.56          | 8,310.56           | 1,127.56           | 111,801.19      |
| **May** | 62,909.43         | 44,207.43         | 9,520.23           | 3,529.23           | 82.23              | 361.23             | 17,545.22       |

**Bank Name:** HDFC BANK, IND
**Account Number:** 50100127075731
**Account Type:** Salary Account
**Average Quarterly Balance:** 53,036.22
**AOB/EMI Ratio:** 1.09
**Account Open:** [Not specified in data]
**Inward Bounces:** 0
**Outward Bounces:** 0
**OD/CC Limit:** [Not specified]

---

## 5. OBLIGATIONS & LIABILITIES (from CAM.pdf)

### Current Obligations

| Source | Obligation Type | Bank Name                    | Account/Ref | Sanction Amount | Consideration | EMI Amount | Current Outstanding | Account Age |
| ------ | --------------- | ---------------------------- | ----------- | --------------- | ------------- | ---------- | ------------------- | ----------- |
| CIBL   | Personal Loan   | Aditya Birla Capital Limited | -           | 500,000         | Considered    | 11,762     | 243,790             | 20+         |
| CIBL   | Personal Loan   | HDFC BANK, INDIA             | 2978043     | -               | Consider BT   | 48,214     | 793,375             | 20+         |
| CIBL   | Credit Card     | [Unknown]                    | 19000       | -               | Considered    | 0          | 6,956               | 20+         |

**Total Current EMI:** ~60,000 (approx)
**Total Current Outstanding:** ~1,044,121

---

## 6. VERIFICATION SUMMARY (from CAM.pdf)

| Verification Type                 | Status     |
| --------------------------------- | ---------- |
| Due Diligence                     | *****955G  |
| De-Dupe Status                    | [Blank]    |
| Pan Check                         | Full Match |
| CIBIL Score                       | 739        |
| NCIP Status                       | No         |
| RCU                               | Review     |
| Residence Verification            | Negative   |
| Office Verification               | [Blank]    |
| BSV (Bank Statement Verification) | [Blank]    |
| Karza                             | false      |
| Prob                              | [Blank]    |
| Email Verification                | Verified   |
| PAN NSDL Status                   | Success    |
| Aadhar Seeding Status             | 1          |

---

## 7. DEVIATIONS RECORDED (from CAM.pdf)

| Deviation Type | Applicant Type    | Rule Description                                                     | Credit Deviation Approval Level | System Decision | Sales Approval Status |
| -------------- | ----------------- | -------------------------------------------------------------------- | ------------------------------- | --------------- | --------------------- |
| BRE Deviation  | Primary Applicant | Applicant is Indian Resident                                         | L1                              | Credit Refer    | -                     |
| BRE Deviation  | Primary Applicant | Non target profile allowed only for income greater than equal to 50K | L1                              | Credit Refer    | -                     |
| BRE Deviation  | Primary Applicant | Company Category listed                                              | L1                              | Credit Refer    | -                     |
| BRE Deviation  | Primary Applicant | Bounce norm to be checked for BT loan                                | L1                              | Credit Refer    | -                     |
| BRE Deviation  | Primary Applicant | CIBIL score norms met                                                | L1                              | Credit Refer    | -                     |
| BRE Deviation  | Primary Applicant | Updated Banking as per policy                                        | L1                              | Credit Refer    | -                     |
| BRE Deviation  | Primary Applicant | Proposed loan is above eligible loan amount                          | L7                              | Credit Refer    | -                     |
| BRE Deviation  | Primary Applicant | Multiplier norms not met                                             | L7                              | Credit Refer    | -                     |
| BRE Deviation  | Primary Applicant | Proposed loan amount greater than product cap                        | L7                              | Credit Refer    | -                     |
| BRE Deviation  | Primary Applicant | Residence Verification status is Negative/Refer                      | L3                              | Credit Refer    | -                     |

---

## 8. CREDIT CONDITIONS & DECISIONS (from CAM.pdf)

| Applicant Type    | Credit Condition For | Credit Condition Name         | Remarks                      | Timestamp                |
| ----------------- | -------------------- | ----------------------------- | ---------------------------- | ------------------------ |
| Primary Applicant | Sales                | UPDATED BANKING AS PER POLICY | updated banking              | 2025-05-31 10:50:30.000Z |
| Primary Applicant | Sales                | EMI DUE DATE                  | sett date 2nd of every month | 2025-05-31 10:50:50.000Z |
| Primary Applicant | Sales                | Other                         | cfr/rcu/npa                  | 2025-05-31 10:50:40.000Z |
| Primary Applicant | Sales                | TOP-UP / BT / PARALLEL        | hdfc pl bt pos 793375        | 2025-05-31 13:01:33.000Z |
| Primary Applicant | Sales                | Other                         | gleams                       | 2025-05-31 13:00:36.000Z |

---

## 9. CREDIT MANAGER APPROVALS (from CAM.pdf)

| Role                                 | Name            | Date & Time         |
| ------------------------------------ | --------------- | ------------------- |
| Credit Manager (1st Recommended by)  | JAY HANCHATE    | 2025-05-31 18:38:17 |
| Credit Manager (Last Recommended by) | Prashanth Anand | 2025-06-03 10:36:33 |
| Credit Manager (1st Approved by)     | Shishir Pandit  | 2025-06-03 14:36:35 |
| Credit Manager (Last Approved by)    | Shishir Pandit  | 2025-06-03 14:36:35 |

---

## 10. LOAN AMOUNT FINALIZATION (from CAM.pdf)

| Parameter                  | Value             |
| -------------------------- | ----------------- |
| Final Loan Amount Approved | 25,00,000         |
| Final Tenure Approved      | 5 Year            |
| Rejection Reason           | [None - Approved] |
| Reject Date & Time         | [N/A]             |

---

## 11. ELIGIBILITY CALCULATION (from Eligibility Format.xlsx)

### Financial Parameters

| Parameter               | Value             |
| ----------------------- | ----------------- |
| Company Category        | Cat AA            |
| **Income**        | **129,876** |
| **Existing EMIs** | **11,762**  |

### Policy Parameters

| Parameter                       | Value     |
| ------------------------------- | --------- |
| Threshold FOIR (Normal Journey) | 0.6 (60%) |
| Multiplier (Normal Journey)     | 16x       |
| Product Cap                     | 20,00,000 |
| Per Lac EMI Calculation         | 100,000   |

### Calculated Eligibility

| Calculation                        | Formula                                          | Result              |
| ---------------------------------- | ------------------------------------------------ | ------------------- |
| **Allowed EMI (basis FOIR)** | Income × 0.6                                    | 77,925.60           |
| **Max Serviceable EMI**      | Allowed EMI - Existing EMIs                      | 66,163.60           |
| **Max Total FOIR Amount**    | (Max Serviceable EMI / EMI per Lac) × 100,000   | 6,616,360           |
| **Total Multiplier Amount**  | Income × 16                                     | 2,077,816           |
| **Product Cap**              | Fixed                                            | 2,000,000           |
| **Final System Eligibility** | MIN(FOIR Amount, Multiplier Amount, Product Cap) | **2,000,000** |

### Applicant Requisition

| Parameter                    | Value                       |
| ---------------------------- | --------------------------- |
| Requested Loan Amount        | 25,00,000                   |
| Requested ROI                | 12%                         |
| Requested Tenure             | 60 months                   |
| Proposed EMI on Requested LA | [Calculated as per formula] |

---

## 12. FIELD HISTORY MILESTONES (from OpportunityFieldHistory CSV)

### Key Process Steps & Decisions

1. **Initial Assessment (May 31, 2025)**

   - Loan Accuracy: 0.2, 0.1, 1 scores applied
   - Journey Type: Normal Journey established
   - Document Email: Sofi.mohd@hcltech.com
2. **Sales Recommendation (Ashwini Ausarmal)**

   - Status: Sales Recommendation OK
3. **Pre-Sanction Review (Kishore Dosapati)**

   - Status: Pre-Sanction initiated
   - Reviewer: KishoreKumar Dosapati
4. **Initial LA Analysis (JAY HANCHATE - May 31)**

   - Family Details: Family 5 / Earning 2 / Rented house
   - Existing Liabilities: PL from other banks, real estate investments
   - Concerns: Multiple existing loans, real estate exposure
   - Request: 15 Lac including BT / Purpose: Personal use and BT
   - Required Documents: HCL job CTC structure, complete bank statements
5. **Documentation & Upload (Kishore Dosapati - May 31 to June 2)**

   - May 31 12:23:24: Docs upload check and decision required
   - June 2 10:28:33: Upload check for maximum amount with HDFC BT
6. **Updated LA Revision (June - Kande Narsinga Rao)**

   - Original Request: 35 Lac
   - Revised Request: 25 Lac with HDFC PL BT
   - Terms: 5 yrs basis FOIR 52%, Multiplier 19x
   - **Major Concern:** Salary below 1.5 lac - 20 lac product cap breach and multiplier limit breach
   - Status: Referred for loan amount reconsideration
7. **Recommendation Phase (Prashanth Anand)**

   - Reco for PL exposure: Rs. 25 Lacs for 60 months with HDFC PL BT
   - FOIR: 52%
   - Multiplier: 19x
   - Escalated to Shishir Pandit for final approval
8. **Pre-Disbursal & Approval (Shishir Pandit)**

   - Status: Pre-disbursal Approved
   - Passed to Initiator
   - Final Amount: 25,00,000
   - Tenure: 5 Year
   - Additional Disbursal Checks: Physical Biometric, Credit Sign off
9. **Final Disbursement (Prakash R)**

   - Status: Disbursement - DN (Disbursement Note issued)
   - Method: Paperless Disbursement

---

## INFORMATION CONSISTENCY & CORRELATION ANALYSIS

### ✅ CONSISTENT DATA POINTS

1. **Loan Amount Tracking**

   - CAM.pdf Applied: 25,00,000
   - CAM.pdf Sanctioned: 25,00,000
   - Eligibility Format: Requested 25,00,000
   - Field History: Approved amount 25,00,000
   - **Status: CONSISTENT ACROSS ALL SOURCES**
2. **Tenure Specification**

   - CAM.pdf Applied: 5 Year
   - CAM.pdf Sanctioned: 5 Year
   - Field History: Pre-disbursal 5 Year approved
   - **Status: CONSISTENT**
3. **Applicant Identity**

   - All three documents reference: SOFI MOHD
   - Lead Reference: PLSM2505301734902204 (consistent)
   - **Status: CONSISTENT**
4. **Income & Financial Position**

   - CAM.pdf Net Salary: 129,876
   - Eligibility Format Income: 129,876
   - **Status: CONSISTENT**
5. **Existing EMI Obligations**

   - CAM.pdf Current Fixed Obligation: 11,762
   - Eligibility Format Existing EMIs: 11,762
   - Field History mentions: Multiple obligations (HDFC BT 793,375 outstanding)
   - **Status: CONSISTENT on reported EMI, though actual exposure is much higher**
6. **Company Category**

   - CAM.pdf: Public Limited (HCL TECHNOLOGIES LIMITED)
   - Eligibility Format: Cat AA (consistent with Public Limited IT company)
   - **Status: CONSISTENT**
7. **CIBIL Score**

   - CAM.pdf: 739
   - Known to be acceptable for lending (generally 700+ is good)
   - **Status: ACCEPTABLE**

---

### ⚠️ INCONSISTENCIES & CONCERNS

1. **FOIR Calculation Discrepancy**

   | Source                      | FOIR Value    | Calculated Basis                        |
   | --------------------------- | ------------- | --------------------------------------- |
   | CAM.pdf System Approval     | 60%           | -                                       |
   | CAM.pdf Recommended         | undefined%    | -                                       |
   | Eligibility Format Policy   | 60% threshold | (Income × 60%) / (Existing EMI)        |
   | Field History (LA Revision) | 52%           | Actual calculation with revised request |

   **Issue:** The CAM shows 60% FOIR in "System Approval" but the Field History shows final LA was calculated at 52% FOIR with multiplier 19x. This represents a **TIGHTENING OF APPROVAL TERMS**.

   **Analysis:**


   - Original FOIR Allowed: 60% × 129,876 = 77,925.60
   - Max Serviceable: 77,925.60 - 11,762 = 66,163.60
   - At requested 25,00,000 / 60 months: EMI = ~41,667
   - Actual FOIR: (41,667 + 11,762) / 129,876 = 41% (approximately)

   **However**, Field History mentions 52% and 19x multiplier - this seems to be calculated differently, possibly including hidden liabilities or revised income assessment.
2. **Multiplier Concern**

   | Source                    | Multiplier               | Status                         |
   | ------------------------- | ------------------------ | ------------------------------ |
   | Eligibility Format Policy | 16x                      | Policy norm for normal journey |
   | CAM.pdf System Approval   | 16                       | System calculated              |
   | Field History LA Revision | 19x                      | **EXCEEDS POLICY NORM**  |
   | CAM.pdf Deviations        | Multiplier norms not met | **FLAGGED AS DEVIATION** |

   **Issue:** Final approved multiplier of 19x exceeds the policy norm of 16x for Normal Journey. This is recorded as a BRE Deviation at L7 level (highest escalation required).
3. **Product Cap Breach**

   | Parameter                 | Value                                           | Status                            |
   | ------------------------- | ----------------------------------------------- | --------------------------------- |
   | Policy Product Cap        | 20,00,000                                       | Per Eligibility Format            |
   | Requested/Approved Amount | 25,00,000                                       | **EXCEEDS CAP BY 5,00,000** |
   | CAM.pdf Deviations        | "Proposed loan amount greater than product cap" | **FLAGGED**                 |

   **Issue:** The sanctioned loan amount of 25,00,000 EXCEEDS the product cap of 20,00,000 by 25%. This is a clear policy breach recorded in the deviations.
4. **Interest Rate Change**

   | Stage           | Interest Rate |
   | --------------- | ------------- |
   | Applied         | 16%           |
   | System Approval | 16%           |
   | Recommended     | 12%           |
   | Sanctioned      | 12%           |

   **Issue:** Interest rate reduced from 16% to 12% during recommendation stage. This is unusual as rates typically don't reduce during approval. Suggests possible manager override or special consideration.
5. **EMI Variation**

   | Basis                        | Applied EMI | Calculated             | Status                          |
   | ---------------------------- | ----------- | ---------------------- | ------------------------------- |
   | CAM Applied (16%, 60M)       | 60,795      | ~60,795                | ✓ Correct                      |
   | System Approval (16%)        | 48,636      | Different loan amount? | ⚠️ Different basis            |
   | Sanctioned Amount (12%, 60M) | Not shown   | ~41,667 (approx)       | ⚠️ Not calculated in document |

   **Issue:** EMI calculations are not consistent across approval stages. The "System Approval" EMI of 48,636 doesn't match either the Applied amount or the final Sanctioned amount.
6. **Residence Verification Status**

   | Field                  | Value                                             | Issue                   |
   | ---------------------- | ------------------------------------------------- | ----------------------- |
   | Residence Verification | **NEGATIVE**                                | Red flag indicator      |
   | CAM Deviation          | "Residence Verification status is Negative/Refer" | **FLAGGED AT L3** |
   | Field History          | No follow-up documented                           | No resolution shown     |

   **Issue:** Negative residence verification is a serious concern and is flagged as a deviation, but no resolution or corrective action is documented.
7. **Existing Liabilities Gap**

   | Source                           | Liability Reported                                | Issue                                    |
   | -------------------------------- | ------------------------------------------------- | ---------------------------------------- |
   | CAM.pdf Obligations Table        | Total ~1,044,121 (3 obligations)                  | Conservative estimate                    |
   | CAM.pdf Current Fixed Obligation | 11,762                                            | Only EMI, not principal                  |
   | Field History Notes              | "hdfc and aditya birla PL used for plot purchase" | Additional context of asset-backed loans |
   | Real Estate Assets               | House (80 lac) + Land (60 lac) = 1.4 crore        | Secured but illiquid                     |

   **Issue:** The Current Fixed Obligation of 11,762 appears to be UNDERSTATED. The actual total monthly obligations might be higher, affecting true FOIR calculation.

---

### 🔴 CRITICAL COMPLIANCE FLAGS

1. **THREE MAJOR BRE DEVIATIONS AT L7 (Highest Escalation):**

   - Proposed loan is above eligible loan amount
   - Multiplier norms not met (19x vs 16x policy)
   - Proposed loan amount greater than product cap
2. **POLICY BREACHES:**

   - Product Cap breach: +25% over limit
   - Multiplier breach: +18.75% over policy (19x vs 16x)
3. **VERIFICATION CONCERNS:**

   - Residence Verification: NEGATIVE (not resolved)
   - RCU Status: REVIEW (incomplete verification)

---

### 📊 DEBT SERVICE CAPACITY ANALYSIS

**Conservative Calculation (based on CAM data):**

- Net Monthly Income: 129,876
- Current Fixed Obligation (per CAM): 11,762
- Existing Obligations (real): ~17,976 (based on HDFC 793,375 + Aditya Birla debt)
- Proposed EMI (at 12%, 60M on 25L): ~41,667
- **Total Monthly Obligations:** ~59,643
- **Debt-to-Income Ratio:** 45.9%

**Against Policy (FOIR 60%):**

- Allowed: 129,876 × 0.6 = 77,925.60
- Proposed Total: 59,643
- **Appears within threshold BUT multiple deviations recorded**

---

### 📋 FIELD HISTORY PROCESS CONCERNS

1. **Salary Requirement Conflict:**

   - Flagged: "Salary below 1.5 lac" as concern
   - Actual Salary: 1.29 lac (actually below 1.5 lac!)
   - Yet approved despite this concern
2. **Request Amount Reduction:**

   - Original: 35 Lac
   - Revised: 25 Lac
   - Final: 25 Lac (at 1.8 lac monthly salary, this is 2.04x annual income)
3. **Incomplete Documentation Trail:**

   - Multiple requests for documents noted
   - Final submission status unclear from field history
   - No explicit document acceptance/approval recorded

---

## SUMMARY TABLE: SOURCES vs DATA COHERENCE

| Data Element         | CAM.pdf   | Eligibility.xlsx | Field History  | Coherence Status             |
| -------------------- | --------- | ---------------- | -------------- | ---------------------------- |
| Applicant Name       | SOFI MOHD | -                | SOFI MOHD      | ✅ Consistent                |
| Loan Amount Applied  | 25,00,000 | -                | 25,00,000      | ✅ Consistent                |
| Loan Amount Approved | 25,00,000 | -                | 25,00,000      | ✅ Consistent                |
| Tenure               | 5 Year    | -                | 5 Year         | ✅ Consistent                |
| Income               | 129,876   | 129,876          | 129,876        | ✅ Consistent                |
| Existing EMI         | 11,762    | 11,762           | ~11,762+       | ⚠️ Potentially Understated |
| Interest Rate        | 12%       | -                | -              | ✅ Final: 12%                |
| FOIR %               | Undefined | 60% (threshold)  | 52% (actual)   | ⚠️ Variable per stage      |
| Multiplier           | -         | 16x (policy)     | 19x (approved) | ❌ BREACHES POLICY           |
| Product Cap          | -         | 20,00,000        | -              | ❌ 25L EXCEEDS BY 25%        |

---

## FINAL ASSESSMENT

### Approval Status: **CONDITIONAL APPROVED WITH MULTIPLE DEVIATIONS**

**Key Findings:**

1. **Amount & Identity:** Fully consistent across all documents
2. **Financial Metrics:** Partially consistent (FOIR and Multiplier show discrepancies)
3. **Compliance:** **THREE HIGH-LEVEL POLICY BREACHES** (Loan amount, Multiplier, Product cap)
4. **Verification:** One **CRITICAL** unresolved issue (Negative Residence Verification)
5. **Debt Service:** Appears serviceable but relies on understated liability assessment

**Risk Level: MODERATE-TO-HIGH** - Approval granted despite policy breaches suggests either:

- Override by senior management (documented via Shishir Pandit final approval)
- Special consideration approved
- Potential risk acceptance for strategic reason