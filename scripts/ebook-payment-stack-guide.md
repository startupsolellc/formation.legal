# The Non-US Founder's Payment Stack Guide

**A Comprehensive Guide to Building Your Payment Infrastructure as a Non-US Founder with a US Entity**

*2026 Edition*

---

## Introduction

Most non-US founders focus on getting "Stripe approved" and ignore the rest of their payment infrastructure. This is a critical mistake.

A single payment processor is a single point of failure. If Stripe freezes your account—and it can happen for reasons unrelated to your business quality—you lose all revenue immediately.

This guide maps the complete payment stack available to non-US founders with a US entity, from EIN application to multi-processor diversification. It covers the real requirements, the hidden pitfalls, and the strategies that actually work in 2026.

**What this guide covers:**
- EIN application for foreign LLCs (phone, fax, mail methods)
- Stripe requirements and the May 2025 address policy change
- PayPal setup with US IP requirements and rolling reserves
- Mercury and Relay bank account requirements
- Merchant of Record alternatives (Paddle, Lemon Squeezy)
- Building a diversified payment stack for risk management

---

## Chapter 1: EIN Application — Your First Step

Before you can open bank accounts or apply for payment processors, you need an Employer Identification Number (EIN). This nine-digit tax ID is required for almost every financial activity in the US.

### Why Foreign LLCs Can't Use the Online EIN Application

The IRS online EIN application is only available to applicants with a principal place of business in the US. Since your LLC's principal place of business is outside the US, you must apply by phone, fax, or mail.

**This is actually an advantage.** Phone applications are processed immediately—you receive your EIN during the call.

### Application Methods

**Method 1: Phone (Fastest)**
- Call 1-800-829-4933 (IRS Business & Specialty Tax Line)
- Hours: 7:00 AM – 10:00 PM local time (Monday–Friday)
- Processing: Immediate during call
- EIN sent by fax or mail within 4-5 business days

**Method 2: Fax**
- Complete IRS Form SS-4
- Fax to: 1-859-669-5760
- Processing: 4-5 business days

**Method 3: Mail**
- Complete IRS Form SS-4
- Mail to: Internal Revenue Service, Cincinnati, OH 45999-0023
- Processing: 4-5 weeks (not recommended)

### What You'll Need

| Item | Details |
|------|---------|
| LLC Legal Name | Exact name as filed with the state |
| Trade Name (DBA) | If different from legal name |
| Business Address | US address (your registered agent) |
| Responsible Party Name | Person who controls the LLC |
| Responsible Party SSN/ITIN | Required for identification |
| Business Type | LLC, Corporation, etc. |
| Date Started | Month and year of formation |
| Closing Month | Usually December |

### Common EIN Mistakes to Avoid

**Mistake 1: Using the Online Application**
Foreign LLCs are not eligible. It will result in an error or rejection.

**Mistake 2: Paying Third-Party Services**
The IRS does not charge for EIN applications. Services charging $50–$200 are selling you something free.

**Mistake 3: Applying Without SSN/ITIN**
You need either a Social Security Number (SSN) or Individual Taxpayer Identification Number (ITIN) for the responsible party.

**After receiving your EIN:**
1. Store the confirmation letter securely
2. Use it to open a US bank account
3. File Form 5472 if your LLC is foreign-owned (25%+)

---

## Chapter 2: The May 2025 Stripe Policy Change

**Critical Update:** In May 2025, Stripe updated its address validation policy. This change affects nearly every non-US founder who formed their LLC through a registered agent service.

### What Changed

**Old Policy:**
- Registered agent addresses were generally accepted
- Virtual mailbox addresses had variable acceptance

**New Policy (May 2025):**
- Registered agent addresses: **Explicitly rejected**
- CMRA (Commercial Mail Receiving Agency) addresses: **Explicitly rejected**
- Virtual mailbox addresses: **Explicitly rejected**

Stripe's policy now states:

> "This means Stripe can no longer allow addresses for registered agents, mailbox services, or virtual address services."

This means if you formed your LLC through Stripe Atlas, Northwest Registered Agent, or any service that gave you a registered agent address, **that address will not work for Stripe verification.**

### Why This Matters

Many non-US founders used their registered agent's address for everything—LLC formation, bank accounts, and Stripe verification. The May 2025 change broke this workflow for thousands of founders.

### What Actually Works

**Your actual residential address in your home country IS accepted by Stripe**, with documentation.

Stripe accepts these as address proof:
- **Utility bill** (electricity, gas, water, internet) dated within 90 days
- **Bank statement** showing your name and current address
- **Credit card statement** showing your name and current address

**Key insight:** You do not need a US address for Stripe verification. Your home country address with a utility bill or bank statement works. Stripe verifies your address, not your citizenship or residency status.

### The Three Address Layers

Understanding these distinctions is critical:

**Layer 1: Registered Agent Address**
- Used for state filings and legal documents
- **NOT accepted by Stripe** (as of May 2025)
- Required for LLC maintenance

**Layer 2: Your Residential Address (KYC Address)**
- Your actual home address where you live
- **ACCEPTED by Stripe** with utility bill or bank statement proof
- This is what Stripe actually wants for verification

**Layer 3: Business Operating Address**
- Where your business operates (if different from home)
- **ACCEPTED by Stripe** with appropriate documentation

### Stripe Application Checklist

- [ ] Form US LLC (if not already done)
- [ ] Get EIN from IRS
- [ ] Prepare address proof (utility bill, bank statement, or credit card statement dated within 90 days)
- [ ] Verify address is NOT a registered agent, virtual mailbox, or CMRA address
- [ ] Apply for compatible payout account (Mercury, Relay, or US bank)
- [ ] Confirm payout account is compatible with your Stripe route
- [ ] Prepare business website or documentation
- [ ] Apply for Stripe

---

## Chapter 3: PayPal — The Backup Processor

PayPal is a strong alternative or complement to Stripe. Unlike Stripe, PayPal **accepts registered agent addresses** as your company address. However, there are important differences you need to understand.

### How PayPal Differs from Stripe

| Factor | PayPal | Stripe |
|--------|--------|--------|
| Company address | RA address accepted | RA address rejected (May 2025) |
| IP-triggered verification | Yes — restricted-country IP triggers utility bill request | No |
| Rolling reserves | Yes — can hold 30-90 days of revenue | No |
| Account linking | Via personal identity | Via entity and personal identity |
| Coverage in some markets | Stronger in Middle East, Southeast Asia | Stronger in US, Europe |

### The IP Address Problem

This is the most misunderstood aspect of PayPal for non-US founders.

**PayPal accepts registered agent addresses as your company address.** You can list your RA address in your PayPal business account settings and it will be accepted.

**However**, if you connect to PayPal from an IP address associated with a restricted country, PayPal may trigger an address verification request—even if your RA address is perfectly valid.

**The solution:** Use a US IP address (VPS or proxy) when accessing PayPal. This avoids the IP-triggered verification request entirely.

### The Rolling Reserve Problem

PayPal can place a **rolling reserve** on new business accounts, holding a percentage of your transaction volume for a period of time.

**How Rolling Reserves Work:**
- Rolling reserve: PayPal holds a percentage (e.g., 10%) of each transaction for 90 days
- Fixed reserve: PayPal holds a fixed amount from your balance
- Minimum threshold: PayPal holds all funds until a threshold is reached

**Who Gets Reserved:**
- New accounts, especially from certain countries
- High-risk categories (e-commerce, digital products, subscriptions)
- High transaction volume without history
- High dispute or chargeback rates

### The Account Linking Trap

PayPal links accounts via **personal identity**, not just business entities. If your personal PayPal account was restricted in the past, a new Business account under a different LLC may still be linked to you.

**Before forming a new LLC for PayPal access:**
1. Contact PayPal support about reinstatement options
2. Understand why your account was restricted
3. Don't assume a new LLC will solve the problem

### PayPal Setup Checklist

- [ ] Form US LLC in your chosen state
- [ ] Get EIN from IRS
- [ ] Set up registered agent (~$100-150/year)
- [ ] Prepare company documents (Certificate of Formation, EIN letter)
- [ ] Set up bank account (Mercury, Relay, or alternative)
- [ ] Prepare identity documents (passport or driver's license)
- [ ] Access PayPal from US IP (VPS or proxy) — **CRITICAL**
- [ ] List RA address as company address in PayPal settings
- [ ] Monitor for rolling reserve requirements

---

## Chapter 4: US Bank Accounts — Mercury and Relay

To receive payments from Stripe or PayPal, you need a US bank account. Two popular options for non-US founders are Mercury and Relay.

### Mercury

Mercury is a fintech bank designed for startups and has become popular among non-US founders.

**Requirements for non-US founders:**
- US LLC or Corporation
- EIN
- US address (Mercury may accept RA addresses for company address, but verification requires other documentation)
- ITIN or passport for personal identity
- Business documentation (Certificate of Formation, Operating Agreement)

**Note:** Mercury's requirements change. Verify current requirements on their website before applying.

### Relay

Relay is another fintech option popular with non-US founders. It offers:
- Multi-user access controls
- FDIC insurance through partner banks
- Integration with business tools

**Requirements similar to Mercury:**
- US entity
- EIN
- Identity verification
- Business documentation

### Why You Need a US Bank Account

Without a compatible US bank account:
- Stripe cannot remit your payments
- PayPal may have limitations on fund transfers
- You may face additional verification requests

### If Traditional Banks Are Difficult

If Mercury or Relay don't work for your situation:
1. **Stripe Atlas** — Bundles entity + bank account + Stripe account
2. **Traditional US bank** — More difficult but possible (requires in-person visit or extensive documentation)
3. **Wise Business** — Sometimes works with specific Stripe routes

---

## Chapter 5: Merchant of Record Services

Merchant of Record (MoR) services take a different approach. Instead of you receiving payments directly, the MoR receives payments on your behalf and remits them to you minus their fee.

### How MoR Services Work

When you use a Merchant of Record service:
- The MoR is the merchant of record on credit card statements
- They handle sales tax collection and remittance
- They handle VAT compliance in EU countries
- They handle chargeback disputes
- They pay you net (minus their fee)

### When MoR Makes Sense

- Digital products with global customers
- SaaS with customers in multiple tax jurisdictions
- Founders who want to avoid tax compliance complexity
- Small teams without tax expertise
- Indie hackers and bootstrap founders

### When MoR Does Not Make Sense

- Physical product businesses
- Businesses needing full control over checkout experience
- High-volume businesses where transaction fees become significant

### Paddle vs Lemon Squeezy

| Feature | Paddle | Lemon Squeezy |
|---------|--------|---------------|
| Fee | ~5% + 0.5% | ~5% + $0.50 |
| Tax handling | Yes | Yes |
| Dashboard quality | Good | Excellent |
| Target | Professional/enterprise | Indie developers |
| US entity required | No | No |
| Countries supported | Most | Most |

**Key advantage:** Neither Paddle nor Lemon Squeezy requires a US entity for most business models. This makes them accessible for founders who haven't formed a US company yet.

### Tax Implications

MoR services handle:
- US sales tax collection and remittance
- EU VAT collection and remittance
- UK VAT collection and remittance
- Digital goods tax in various jurisdictions

**This is significant.** Tax compliance for digital products sold globally is complex and time-consuming. MoR services handle this automatically, though they take a percentage for the service.

---

## Chapter 6: Building Your Payment Stack

### The Risk of Single-Processor Dependence

Payment processors can freeze or close accounts for reasons unrelated to your business quality:
- Unusual transaction volume spikes
- High dispute rates
- Industry risk classification
- Geographic risk factors

When this happens with a single processor and no backup, you have no revenue stream.

### What a Diversified Stack Looks Like

| Role | Processor | Why |
|------|------------|-----|
| Primary | Stripe or PayPal | Best developer tools, global reach |
| Backup | PayPal or Stripe | Immediate fallback if primary is frozen |
| MoR Alternative | Paddle or Lemon Squeezy | Simplifies tax, reduces compliance burden |

### Building Your Stack: Step by Step

**Step 1: Primary Processor**
Choose based on your business model:
- **SaaS/subscriptions:** Stripe
- **E-commerce:** Stripe + PayPal
- **Digital products (global):** Consider MoR

**Step 2: Backup Processor**
Set up your backup before launching:
- If Stripe is primary, set up PayPal as backup
- If PayPal is primary, set up Stripe as backup

This takes minimal time but provides insurance against account freezes.

**Step 3: MoR Consideration (if applicable)**
If you're selling digital products globally and want to avoid tax complexity, evaluate Paddle or Lemon Squeezy. The higher transaction fees may be worth the reduced compliance burden.

**Step 4: Test the Full Flow**
Before launching, test:
- Payment flow on both primary and backup
- Refund process on both
- Payout timing and settlement

### Payment Stack by Business Model

| Business Model | Primary | Backup | MoR Alternative |
|---------------|--------|--------|-----------------|
| SaaS (US customers) | Stripe | PayPal | Paddle |
| SaaS (global, tax complex) | Stripe | PayPal | Paddle or Lemon Squeezy |
| E-commerce | Stripe + PayPal | Shopify Payments | N/A |
| Digital products (simple) | Stripe | PayPal | Lemon Squeezy |
| Digital products (global, minimal tax) | N/A | N/A | Paddle or Lemon Squeezy |

---

## Chapter 7: Common Mistakes

### Mistake 1: Only Signing Up for One Processor

Waiting until you need a backup to sign up means you're already in trouble when your primary account has issues. Sign up for both before launching.

### Mistake 2: Using RA Address for Stripe

Stripe (as of May 2025) rejects registered agent, virtual mailbox, and CMRA addresses. Use your actual residential or operating address with utility bill or bank statement proof.

### Mistake 3: Ignoring PayPal's IP Requirements

Connecting to PayPal from a restricted-country IP triggers verification requests. Always use a US IP when accessing PayPal.

### Mistake 4: Assuming MoR Is Always Cheaper

MoR services take 5-10% of your revenue. For high-volume businesses, this can exceed the cost of handling tax compliance yourself.

### Mistake 5: Not Testing Payout Timings

Different processors have different settlement times. Some have rolling reserves. Understand cash flow implications before relying on a processor.

### Mistake 6: Not Having Address Proof Ready

When Stripe requests address documentation (utility bill, bank statement, or credit card statement), delays in providing these can extend verification time. Have documents ready before applying.

---

## Quick Reference: Payment Stack Checklist

### Phase 1: Foundation
- [ ] Form US LLC
- [ ] Get EIN (phone application is fastest)
- [ ] Set up registered agent
- [ ] Prepare address proof documents (utility bill, bank statement, or credit card statement dated within 90 days)

### Phase 2: Banking
- [ ] Apply for Mercury or Relay account
- [ ] Receive debit card and account details
- [ ] Verify account is working for incoming transfers

### Phase 3: Primary Processor
- [ ] Apply for Stripe with residential/operating address
- [ ] Provide address documentation when requested
- [ ] Connect bank account for payouts
- [ ] Test a small transaction

### Phase 4: Backup Processor
- [ ] Apply for PayPal Business account
- [ ] Access from US IP to avoid verification trigger
- [ ] List RA address as company address
- [ ] Test a small transaction

### Phase 5: MoR Consideration (if applicable)
- [ ] Evaluate Paddle or Lemon Squeezy
- [ ] Compare fees against tax compliance cost
- [ ] Set up if MoR makes sense for your model

### Phase 6: Stack Testing
- [ ] Test payment flow on primary
- [ ] Test payment flow on backup
- [ ] Test refund process on both
- [ ] Verify payout timing and settlement

---

## Resources and Links

### Official Documentation
- [IRS EIN Application](https://www.irs.gov/businesses/small-businesses-self-employed/employer-identification-number)
- [IRS Form SS-4](https://www.irs.gov/pub/irs-pdf/fss4.pdf)
- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Business](https://www.paypal.com/us/business)
- [Paddle](https://www.paddle.com)
- [Lemon Squeezy](https://www.lemonsqueezy.com)
- [Mercury](https://mercury.com)
- [Relay](https://relayfi.com)

### Formation.Legal Resources
- [Payment Access Guide](/payment-access) — Payment processor requirements for non-US founders
- [Route Planner](/tools/route-planner) — Personalized payment stack mapping
- [Cost Calculator](/tools/cost-calculator) — 3-year cost estimates for different routes

---

## About This Guide

This guide is for informational purposes only and does not constitute legal or tax advice. Payment processor requirements, tax regulations, and banking policies change frequently. Verify current requirements with each service provider before applying.

**Last updated:** May 2026

---

*Free PDF provided by [Formation.Legal](https://formation.legal) — Independent research-driven guides for non-US founders navigating US business formation.*