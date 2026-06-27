# ELIGIBILITY FORMAT SPREADSHEET - COMPREHENSIVE GUIDE

**Application ID:** SOFI MOHD-PLSM2505301734902204
**Purpose:** To understand how loan eligibility is calculated
**Generated:** 2026-06-27

---

## WHAT IS THIS SPREADSHEET?

The **Eligibility Format.xlsx** is a **Loan Eligibility Calculator** used by the bank to determine:

1. **How much can we lend** to an applicant based on their income and existing obligations?
2. **What are the constraints** (policy limits)?
3. **What did the applicant ask for** vs. what can we approve?

This is a **KEY DECISION-MAKING DOCUMENT** in the lending process that translates an applicant's financial profile into concrete lending limits.

---

## STRUCTURE OVERVIEW

The spreadsheet has **3 main sections**:

```
┌─────────────────────────────────────────────────────────────┐
│ SECTION 1: FINANCIAL SUMMARY (Input Data)                   │
│ ├─ Applicant's Income: ₹129,876/month                       │
│ └─ Existing Obligations: ₹11,762/month                      │
└─────────────────────────────────────────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────────┐
│ SECTION 2: POLICY PARAMETERS (Bank Rules)                   │
│ ├─ Maximum FOIR allowed: 60%                                │
│ ├─ Multiplier factor: 16x                                   │
│ └─ Product Cap: ₹20,00,000                                  │
└─────────────────────────────────────────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────────┐
│ SECTION 3: ELIGIBILITY OUTPUT (Calculation Result)          │
│ ├─ Max Eligible Amount: ₹20,00,000                          │
│ └─ Applicant's Request: ₹25,00,000 (EXCEEDS by ₹5L!)       │
└─────────────────────────────────────────────────────────────┘
```

---

## SECTION 1: FINANCIAL SUMMARY (INPUT DATA)

### What This Section Contains

| Field                      | Value      | Meaning                                         |
| -------------------------- | ---------- | ----------------------------------------------- |
| **Company Category** | Cat AA     | Top-tier company rating (like HCL Technologies) |
| **Income**           | ₹1,29,876 | Applicant's monthly net salary                  |
| **Existing EMIs**    | ₹11,762   | Monthly loan payments already being made        |

### Understanding Each Input

#### 1. **Company Category: Cat AA**

- This is a **risk classification** of where the applicant works
- **Cat AA** = Highest tier (safest employers)
  - Examples: IT companies, government, multinational corporations
  - Why it matters: Stable income, lower default risk
- **Impact:** Allows higher loan amounts and better interest rates

#### 2. **Income: ₹129,876**

- **What it is:** Monthly NET salary (after taxes, deductions)
- **Why it matters:** Determines repayment capacity
- **Source:** Verified from payslips, bank statements, employer
- **Important note:** This is SOFI MOHD's actual monthly take-home

#### 3. **Existing EMIs: ₹11,762**

- **What it is:** Current monthly loan obligations
  - Personal loans already taken
  - Credit card EMIs
  - Any other monthly debt payments
- **Why it matters:** Reduces the amount available for new debt
- **CRITICAL ISSUE:** This appears **UNDERSTATED** (actual is ₹17,976+)
  - HDFC PL: ₹793,375 outstanding
  - Aditya Birla PL: ₹243,790 outstanding
  - But only ₹11,762 shown as monthly EMI

---

## SECTION 2: POLICY PARAMETERS (BANK RULES)

These are the **lending limits and rules** set by the bank based on regulatory requirements and risk management.

### Parameter 1: **Threshold FOIR - Normal Journey: 60%**

**What is FOIR?**

- **FOIR** = **Floating/Fixed Obligation Income Ratio**
- Formula: (All Monthly Obligations) ÷ (Monthly Income) × 100
- Example: If income is ₹100,000 and obligations are ₹40,000, FOIR = 40%

**What does 60% threshold mean?**

```
Bank Policy: Applicants can have up to 60% of their income 
committed to loan obligations

Example:
├─ Income: ₹100,000
├─ Maximum FOIR Allowed: 60%
└─ Maximum Total Monthly Obligations: ₹60,000
```

**Why 60%?**

- Industry standard to ensure repayment capacity
- Leaves 40% of income for living expenses, emergencies
- Regulatory compliance requirement
- Reduces default risk

**For SOFI MOHD:**

```
Calculation:
├─ Income: ₹129,876
├─ Maximum Allowed FOIR: 60%
├─ Max Monthly Obligations: ₹129,876 × 0.6 = ₹77,925.60
└─ This is the CEILING for debt obligations
```

---

### Parameter 2: **Multiplier - Normal: 16x**

**What is Multiplier?**

- A **simplified formula** to quickly estimate loan capacity
- Formula: Approved Loan = Income × Multiplier
- Bypasses complex FOIR calculations for fast processing

**What does 16x mean?**

```
Bank Policy: Maximum loan = 16 times the monthly income

Example:
├─ Monthly Income: ₹100,000
├─ Multiplier: 16x
└─ Maximum Loan: ₹16,00,000
```

**Why 16x?**

- Conservative approach - doesn't require detailed financial analysis
- Based on 5-year tenure and ~10-12% interest rates
- Ensures EMI doesn't exceed FOIR limits
- Quick approval mechanism

**For SOFI MOHD:**

```
Calculation:
├─ Monthly Income: ₹129,876
├─ Multiplier Allowed: 16x
└─ Maximum Loan by Multiplier: ₹129,876 × 16 = ₹20,77,816

Rounded to nearest lac: ₹20,00,000 (Product Cap applied)
```

---

### Parameter 3: **Product Cap: ₹20,00,000**

**What is Product Cap?**

- An **absolute maximum** limit for Personal Loans
- Regardless of income, no one can borrow more than this

**What does ₹20,00,000 mean?**

```
Bank Policy: Maximum Personal Loan = ₹20 Lac (fixed)

Even if:
├─ Your income is ₹1,00,000/month (multiplier would allow ₹16L)
├─ Your FOIR allows ₹25L
└─ Cap says: MAXIMUM ₹20L only
```

**Why ₹20 Lacs?**

- Portfolio management - limits concentration risk
- Market positioning - personal loan positioning
- Operational capacity
- Default risk management

---

## SECTION 3: ELIGIBILITY CALCULATION (THE MATH)

Let me walk through the calculations step-by-step:

### Step 1: Calculate "Allowed EMI based on FOIR Policy"

**Formula:** Income × Threshold FOIR
**What it calculates:** Maximum monthly EMI the applicant can have

```
Calculation:
├─ Income: ₹129,876
├─ Policy FOIR: 0.6 (60%)
└─ Allowed EMI: ₹129,876 × 0.6 = ₹77,925.60

Meaning: Bank allows up to ₹77,925.60 as total monthly obligations
```

**In Spreadsheet:**

- Cell B10: `=B3*B7`
- B3 = Income (129,876)
- B7 = FOIR threshold (0.6)
- Result: 77,925.60

---

### Step 2: Calculate "Max Serviceable EMI"

**Formula:** Allowed EMI - Existing EMIs
**What it calculates:** How much new EMI can the applicant take on?

```
Calculation:
├─ Allowed EMI (from Step 1): ₹77,925.60
├─ Existing EMIs: ₹11,762
└─ Max Serviceable EMI: ₹77,925.60 - ₹11,762 = ₹66,163.60

Meaning: Applicant can take new loan with monthly EMI up to ₹66,163.60
```

**In Spreadsheet:**

- Cell B11: `=B10-B4`
- B10 = Allowed EMI (77,925.60)
- B4 = Existing EMIs (11,762)
- Result: 66,163.60

**Why subtract existing EMIs?**

- If applicant already pays ₹11,762/month
- They can't pay more than ₹77,925.60 total
- So available capacity = ₹77,925.60 - ₹11,762 = ₹66,163.60

---

### Step 3: Convert "Max Serviceable EMI" to Loan Amount (FOIR Method)

**Formula:** (Max Serviceable EMI ÷ EMI per Lac) × 100,000
**What it calculates:** Loan amount that would result in max serviceable EMI

```
Step 3a - Calculate EMI per Lac:
├─ Rate per Lac: ₹100,000 (reference amount)
├─ Interest: 12% (typical rate)
├─ Tenure: 60 months (5 years)
└─ EMI per Lac: =-PMT(0.12/12, 60, 100000) = ₹1,996.82/month per lac

This means: A ₹1 Lac loan requires ₹1,996.82 EMI/month at 12%

Step 3b - Convert Max Serviceable EMI to Loan:
├─ Max Serviceable EMI: ₹66,163.60
├─ EMI per Lac: ₹1,996.82
├─ Loan Amount = (₹66,163.60 ÷ ₹1,996.82) × ₹100,000
└─ Loan Amount = 33.13 × ₹100,000 = ₹33,13,000 (approximately)

BUT WAIT! This exceeds Product Cap...
```

**In Spreadsheet:**

- Cell D6: `=-PMT(D4/12,D5,D3)` - Calculates EMI per lac
  - D4 = Interest rate (12%)
  - D5 = Tenure (60)
  - D3 = Per Lac amount (100,000)
- Cell B12: `=(B11/D6)*10^5` - Converts EMI to loan amount
  - B11 = Max Serviceable EMI (66,163.60)
  - D6 = EMI per lac
  - Result: ₹33,13,000+ (before cap applied)

---

### Step 4: Calculate "Total Multiplier Amount"

**Formula:** Income × Multiplier
**What it calculates:** Maximum loan allowed by multiplier rule

```
Calculation:
├─ Income: ₹129,876
├─ Multiplier: 16x
└─ Total Multiplier Amount: ₹129,876 × 16 = ₹20,77,816

Meaning: By multiplier rule, applicant can borrow up to ₹20,77,816
```

**In Spreadsheet:**

- Cell B13: `=B3*B8`
- B3 = Income (129,876)
- B8 = Multiplier (16)
- Result: 20,77,816

---

### Step 5: Apply "Product Cap"

**Formula:** Use product cap value
**What it calculates:** Ceiling limit

```
Calculation:
├─ Product Cap Policy: ₹20,00,000
└─ This is the hard limit, no exceptions
```

**In Spreadsheet:**

- Cell B14: `=B9`
- B9 = Product cap (2,000,000)
- Result: 20,00,000

---

### Step 6: Calculate "Final System Eligibility Loan Amount"

**Formula:** MIN(FOIR Amount, Multiplier Amount, Product Cap)
**What it calculates:** The LOWEST of all three limits becomes the max

```
Calculation:
├─ Max by FOIR: ₹33,13,000
├─ Max by Multiplier: ₹20,77,816
├─ Product Cap: ₹20,00,000 ← LOWEST
└─ Final Eligibility: ₹20,00,000 (MIN of three)

Meaning: System allows maximum ₹20,00,000 for this applicant
```

**In Spreadsheet:**

- Cell B15: `=MIN(B12:B14)`
- Result: 20,00,000 (the minimum of all three constraints)

**Why use MIN?**

- Takes the most conservative limit
- Ensures compliance with ALL policies
- Risk management - doesn't lend beyond any single policy

---

## VISUAL: THREE-WAY CONSTRAINT CHECK

```
                    FOIR Method
                    ₹33,13,000+
                        🔺
                       / \
                      /   \
                     /     \
                    /       \
              Multiplier   Product Cap
              ₹20,77,816   ₹20,00,000
                  🔺           🔺
                   \         /
                    \       /
                     \     /
                      \   /
                       ✓ MINIMUM WINS
                    ₹20,00,000
                (Final Eligibility)
```

**The Three Limits:**

1. **FOIR:** ₹33,13,000 (plenty of repayment capacity)
2. **Multiplier:** ₹20,77,816 (income-based safety limit)
3. **Product Cap:** ₹20,00,000 (portfolio management limit) ← **BINDS HERE**

**Conclusion:** Product cap is the binding constraint for SOFI MOHD

---

## SECTION 4: APPLICANT'S REQUISITION (WHAT THEY ASKED FOR)

### Applicant's Request

| Parameter                       | Value       | Analysis                                  |
| ------------------------------- | ----------- | ----------------------------------------- |
| **Requested Loan Amount** | ₹25,00,000 | Exceeds eligible ₹20L by ₹5L (25% over) |
| **Requested ROI**         | 12%         | Standard market rate, acceptable          |
| **Requested Tenure**      | 60 months   | 5 years, standard term                    |
| **Proposed EMI**          | Calculated  | Will be computed below                    |

### EMI Calculation on Requested Amount

**Formula:** `=-PMT(B19/12, B20, B18)`

```
What this formula does:
├─ B19/12: Interest rate per month = 12% ÷ 12 = 1%
├─ B20: Number of months = 60
├─ B18: Loan amount = ₹25,00,000
└─ Result: EMI = ₹49,937 (approximately)

Explanation of PMT function:
- Calculates fixed monthly payment (EMI)
- For a ₹25L loan at 12% for 5 years
- Each month: ₹49,937 is due
```

**What this means:**

```
Applicant asked for:
├─ Loan: ₹25,00,000
├─ Rate: 12%
├─ Tenure: 60 months
└─ This would mean: ₹49,937 EMI every month

But:
├─ System eligible: ₹20,00,000 only
├─ Requesting: ₹25,00,000
└─ Status: ₹5,00,000 SHORTFALL (cannot approve full request)
```

---

## THE CONFLICT: ELIGIBILITY vs. REQUEST

This is the **KEY DECISION POINT** shown in this spreadsheet:

```
System Eligibility Analysis:
┌─────────────────────────────────────┐
│ What Bank Can Offer: ₹20,00,000    │
│ ├─ FOIR Allows: ₹33,13,000         │
│ ├─ Multiplier Allows: ₹20,77,816   │
│ └─ But Product Cap Limits: ₹20L    │
└─────────────────────────────────────┘
                 vs
Applicant's Wish:
┌─────────────────────────────────────┐
│ Applicant Wants: ₹25,00,000         │
│ ├─ Request: ₹25L @ 12% for 60 mo   │
│ └─ This Exceeds Cap by ₹5L          │
└─────────────────────────────────────┘

DECISION OPTIONS:
┌─────────────────────────────────────┐
│ ❌ DECLINE: Offer only ₹20L         │
│ ✅ OVERRIDE: Approve full ₹25L     │
│ ⚠️  COMPROMISE: Offer ₹23L-24L     │
└─────────────────────────────────────┘
```

---

## WHAT ACTUALLY HAPPENED (REALITY vs ELIGIBILITY)

### What Eligibility Sheet Said:

```
Maximum Eligible: ₹20,00,000
- Constrained by Product Cap
- Supported by FOIR (₹33L+)
- Supported by Multiplier (₹20.77L)
```

### What Actually Got Approved:

```
Approved Amount: ₹25,00,000
- EXCEEDED Product Cap by ₹5L (25%)
- EXCEEDED Multiplier by ₹4.22L
- STILL within FOIR limit
- DECISION: Management Override ✅
```

### Why the Difference?

Looking back at Field History:

1. Kande Narsinga Rao flagged: "Product cap breach and multiplier limit breach"
2. Prashanth Anand recommended: Despite breaches
3. **Shishir Pandit APPROVED:** Overriding the eligibility calculation

**Reasons for Override (inferred from assets):**

- Strong real estate backing: ₹140 Lac net worth
- Premium employer (HCL Technologies)
- Existing good repayment track record
- CIBIL score 739

---

## KEY FORMULAS EXPLAINED

### Formula 1: EMI Calculation

```
=-PMT(Rate, Periods, PresentValue)

Example: =-PMT(0.12/12, 60, 2500000)
- Rate: 0.12/12 = 0.01 (1% monthly)
- Periods: 60 months
- Amount: ₹25,00,000
- Result: ₹49,937 EMI/month
```

### Formula 2: Loan from EMI

```
=(EMI / EMI_per_lac) * 100000

Example: =(66163.60 / 1996.82) * 100000
- Take max serviceable EMI: ₹66,163.60
- Divide by EMI needed per 1 lac: ₹1,996.82
- Multiply by 100,000 to get full amount
- Result: ₹33,13,000+
```

### Formula 3: Eligibility Decision

```
=MIN(FOIR_Amount, Multiplier_Amount, Product_Cap)

This takes the MINIMUM (most conservative)
- Ensures compliance with ALL limits
- Safety mechanism built into formula
```

---

## COMPARISON: ELIGIBILITY SHEET vs ACTUAL APPROVAL

| Parameter             | Eligibility Calc | Actual Approved | Status         |
| --------------------- | ---------------- | --------------- | -------------- |
| **Max Amount**  | ₹20,00,000      | ₹25,00,000     | ❌ 25% OVER    |
| **FOIR %**      | 60% (max)        | ~52% (actual)   | ✅ OK          |
| **Multiplier**  | 16x (policy)     | 19x (actual)    | ❌ 18.75% OVER |
| **Rate**        | Not specified    | 12%             | ✅ Market rate |
| **Tenure**      | Flexible         | 60 months       | ✅ Standard    |
| **Product Cap** | ₹20,00,000      | ₹25,00,000     | ❌ BREACHED    |

---

## INSIGHTS FOR UNDERSTANDING ELIGIBILITY

### 1. **This Sheet is a Calculator, Not a Decision**

- It computes "what can we safely lend"
- It doesn't make the final decision
- Humans (credit managers) override when needed

### 2. **Three Different Lenses Check Capacity**

- **FOIR:** Checks if income can support obligations
- **Multiplier:** Simple income ratio check
- **Product Cap:** Portfolio management limit

### 3. **The Binding Constraint Changes**

- For high-income applicants: Multiplier or Product Cap binds
- For low-income applicants: FOIR binds
- For SOFI MOHD: **Product Cap was the limit**

### 4. **Existing Obligations Matter**

- ₹11,762 existing EMI reduced capacity by that amount
- If it were ₹0, capacity would be ₹77,925/month instead of ₹66,163
- Shows importance of paying down existing loans

### 5. **Policy vs Discretion**

- This sheet shows POLICY limits
- But real approvals can OVERRIDE policy (with justification)
- Governance happens when overrides are documented

### 6. **Why Different Calculation Methods?**

- **FOIR:** Precise, accounts for all obligations
- **Multiplier:** Quick, income-based, less precise
- Having both reduces gaming the system

### 7. **The EMI is Key**

- Everything ultimately drives to: "Can they pay EMI?"
- If EMI is too high → applicant can't repay → default
- All policies (FOIR, Multiplier, Cap) are designed to keep EMI manageable

---

## PRACTICAL EXAMPLE: HOW THIS SHEET IS USED

### Scenario 1: New Applicant

```
Step 1: Fill in Income & Existing EMIs
Step 2: Sheet calculates max eligible amount
Step 3: Compare with applicant's request
Step 4: Decision: Approve, Decline, or Negotiate

For SOFI MOHD:
├─ Eligible: ₹20L
├─ Requested: ₹25L
└─ Decision: OVERRIDE to approve ₹25L (with management approval)
```

### Scenario 2: What If Income Was Different?

```
If income was ₹200,000 (instead of ₹129,876):
├─ FOIR Allows: ₹200K × 0.6 = ₹120K/month
├─ Multiplier Allows: ₹200K × 16 = ₹32L
├─ Product Cap: Still ₹20L
└─ Result: Still capped at ₹20L (Product Cap binds)

If income was ₹80,000 (instead of ₹129,876):
├─ FOIR Allows: ₹80K × 0.6 = ₹48K/month
├─ Max Serviceable: ₹48K - existing EMIs
├─ Multiplier Allows: ₹80K × 16 = ₹12.8L
├─ Product Cap: ₹20L
└─ Result: Multiplier OR FOIR binds (around ₹10-12L)
```

---

## WHY THIS MATTERS FOR CREDIT DECISIONS

This eligibility sheet bridges the gap between:

1. **What applicants can afford** (FOIR based on income)
2. **What bank policy allows** (Multiplier & Product Cap)
3. **What applicants request** (their wishful thinking)

The intersection determines lending decisions.

---

## SUMMARY TABLE: WHAT EACH SECTION DOES

| Section                           | Purpose                 | Output                        | Used For                |
| --------------------------------- | ----------------------- | ----------------------------- | ----------------------- |
| **Financial Summary**       | Input applicant data    | Income & existing obligations | Feeds into calculations |
| **Policy Parameters**       | Define bank constraints | Maximum limits                | Boundaries for lending  |
| **Eligibility Calculation** | Apply formulas          | Maximum eligible amount       | Recommendation baseline |
| **Applicant Requisition**   | Capture request         | What they asked for           | Comparison point        |

---

## KEY TAKEAWAY

This spreadsheet **translates financial policy into numbers**:

```
POLICY:
"We won't lend more than 16x income, 60% FOIR, or ₹20L"
                         ⬇️
        (Eligibility Format.xlsx calculation)
                         ⬇️
NUMBERS:
"For SOFI MOHD: ₹20,00,000 maximum eligible"
```

The actual approval then compares this to the request and makes a decision (approve, override, or decline).

For SOFI MOHD → **Request exceeded limit, but override approved based on assets & employer profile.**