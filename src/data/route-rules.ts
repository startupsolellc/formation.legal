/**
 * route-rules.ts — Static rule engine for the Route Planner.
 * All logic is client-side. No API calls.
 */

import type {
  RoutePlannerInputs,
  RouteResult,
  RouteVerdict,
  RiskLevel,
  RiskPanel,
  MissingStep,
  ChecklistItem,
} from '../types/route-planner';
import { getProviderFit } from './provider-fit';

/* ------------------------------------------------------------------ */
/*  Risk Assessment Helpers                                            */
/* ------------------------------------------------------------------ */

function assessPaymentRisk(inputs: RoutePlannerInputs): RiskLevel {
  const { paymentGoals, currentSetup, addressStatus, countryOfResidence } = inputs;
  const wantsStripe = paymentGoals.includes('stripe');
  const wantsPaypal = paymentGoals.includes('paypal');
  const wantsMarketplace = paymentGoals.includes('amazon-shopify');

  if (wantsStripe && currentSetup === 'no-company') return 'high';
  if (wantsStripe && addressStatus === 'home-country') return 'high';
  if (wantsStripe && currentSetup === 'llc-no-ein') return 'high';
  if (wantsStripe && currentSetup === 'llc-ein-bank') return 'medium';
  if (wantsStripe && currentSetup === 'llc-ein') return 'high';
  if (wantsPaypal && currentSetup === 'no-company') return 'high';
  if (wantsMarketplace && currentSetup === 'llc-no-ein') return 'high';
  if (wantsMarketplace && addressStatus === 'registered-agent') return 'medium';

  const highRiskCountries = ['nigeria', 'pakistan', 'bangladesh'];
  if (highRiskCountries.includes(countryOfResidence ?? '') && wantsStripe) return 'high';

  if (paymentGoals.includes('review-first')) return 'low';
  if (paymentGoals.length === 0) return 'needs-review';
  return 'medium';
}

function assessAddressRisk(inputs: RoutePlannerInputs): RiskLevel {
  const { addressStatus, currentSetup, paymentGoals } = inputs;
  if (addressStatus === 'physical-office') return 'low';
  if (addressStatus === 'registered-agent' && paymentGoals.includes('amazon-shopify')) return 'high';
  if (addressStatus === 'virtual-mailbox') return 'medium';
  if (addressStatus === 'registered-agent') return 'medium';
  if (addressStatus === 'home-country') return 'high';
  if (currentSetup === 'need-address') return 'high';
  return 'needs-review';
}

function assessBankingRisk(inputs: RoutePlannerInputs): RiskLevel {
  const { currentSetup, countryOfResidence, addressStatus } = inputs;
  if (currentSetup === 'llc-ein-bank') return 'low';

  const highRiskCountries = ['nigeria', 'pakistan', 'bangladesh'];
  if (highRiskCountries.includes(countryOfResidence ?? '')) return 'high';
  if (addressStatus === 'home-country') return 'high';
  if (currentSetup === 'no-company') return 'high';
  if (currentSetup === 'llc-ein') return 'medium';
  return 'needs-review';
}

function assessComplianceRisk(inputs: RoutePlannerInputs): RiskLevel {
  const { currentSetup, entityPreference } = inputs;
  if (currentSetup === 'no-company') return 'low'; // nothing to comply with yet
  if (entityPreference === 'c-corp') return 'high'; // more complex filing
  if (entityPreference === 'mor') return 'low'; // MoR handles it
  if (currentSetup === 'llc-ein-bank') return 'medium'; // annual filings due
  return 'medium';
}

function assessCostRisk(inputs: RoutePlannerInputs): RiskLevel {
  const { riskTolerance, entityPreference } = inputs;
  if (entityPreference === 'stripe-atlas') return 'medium'; // known fixed cost
  if (entityPreference === 'c-corp') return 'high'; // franchise tax, filings
  if (riskTolerance === 'cheapest') return 'medium'; // may cut corners
  if (riskTolerance === 'review-first') return 'low';
  return 'medium';
}

/* ------------------------------------------------------------------ */
/*  Missing Steps                                                      */
/* ------------------------------------------------------------------ */

function getMissingSteps(inputs: RoutePlannerInputs): MissingStep[] {
  const steps: MissingStep[] = [];
  const hasProcessorOrBankGoal =
    inputs.paymentGoals.includes('stripe') ||
    inputs.paymentGoals.includes('paypal') ||
    inputs.paymentGoals.includes('us-bank') ||
    inputs.paymentGoals.includes('amazon-shopify');

  if (inputs.currentSetup === 'no-company' || inputs.currentSetup === 'unsure') {
    steps.push({
      id: 'entity',
      label: 'Entity formation',
      detail: 'You may need to form a US LLC or C-Corp before accessing most payment processors and bank accounts.',
    });
  }

  if (inputs.currentSetup === 'no-company' || inputs.currentSetup === 'llc-no-ein' || inputs.currentSetup === 'unsure') {
    steps.push({
      id: 'ein',
      label: 'EIN (Employer Identification Number)',
      detail: 'An EIN from the IRS is needed for banking, payment processors, and tax filings. Apply via IRS.gov or by fax.',
    });
  }

  if (inputs.currentSetup !== 'llc-ein-bank') {
    steps.push({
      id: 'bank',
      label: 'Bank eligibility check',
      detail: 'US bank account approval depends on your country, entity type, and address. Not all banks accept non-US residents.',
    });
  }

  if (
    inputs.addressStatus === 'home-country' ||
    inputs.addressStatus === 'unsure' ||
    inputs.currentSetup === 'need-address' ||
    (inputs.addressStatus === 'registered-agent' && hasProcessorOrBankGoal)
  ) {
    steps.push({
      id: 'address',
      label: 'Valid business address path',
      detail: 'Payment processors and banks may require a US address beyond a registered agent. A virtual mailbox or physical office may be needed.',
    });
  }

  if (inputs.paymentGoals.includes('stripe') || inputs.paymentGoals.includes('paypal')) {
    steps.push({
      id: 'payment-readiness',
      label: 'Payment processor readiness',
      detail: 'Stripe and PayPal have their own verification requirements beyond entity formation. A bank account and business website are typically needed.',
    });
  }

  if (inputs.paymentGoals.includes('amazon-shopify')) {
    steps.push({
      id: 'marketplace-readiness',
      label: 'Marketplace verification readiness',
      detail: 'Amazon and Shopify-related payment routes can require EIN, address, bank, tax, and identity checks. Verify current requirements before applying.',
    });
  }

  steps.push({
    id: 'website',
    label: 'Business website / refund / terms pages',
    detail: 'Most payment processors require a live website with refund policy, terms of service, and contact information.',
  });

  steps.push({
    id: 'compliance',
    label: 'Compliance calendar',
    detail: 'Annual filings (state annual report, Form 5472, BOI reporting) have deadlines and penalties. Set up a compliance calendar.',
  });

  steps.push({
    id: 'provider-fit',
    label: 'Provider fit evaluation',
    detail: 'Choose a formation provider based on your route, not marketing claims. Consider total 3-year cost.',
  });

  return steps;
}

/* ------------------------------------------------------------------ */
/*  Checklist Generator                                                */
/* ------------------------------------------------------------------ */

function generateChecklist(inputs: RoutePlannerInputs): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const hasProcessorOrBankGoal =
    inputs.paymentGoals.includes('stripe') ||
    inputs.paymentGoals.includes('paypal') ||
    inputs.paymentGoals.includes('us-bank') ||
    inputs.paymentGoals.includes('amazon-shopify');

  if (inputs.currentSetup === 'no-company' || inputs.currentSetup === 'unsure') {
    items.push({
      step: 'Decide on entity type (LLC vs C-Corp vs MoR)',
      detail: 'Based on your business model and payment goals.',
      priority: 'critical',
    });
    items.push({
      step: 'Choose formation state (Wyoming, Delaware, or home state)',
      detail: 'Wyoming is common for non-US founders due to lower fees and privacy.',
      priority: 'critical',
    });
    items.push({
      step: 'File formation documents',
      priority: 'critical',
    });
  }

  if (inputs.currentSetup !== 'llc-ein-bank' && inputs.currentSetup !== 'llc-ein') {
    items.push({
      step: 'Apply for EIN from IRS',
      detail: 'Apply online (if you have SSN/ITIN) or via Fax Form SS-4.',
      priority: 'critical',
    });
  }

  if (
    inputs.addressStatus === 'home-country' ||
    inputs.addressStatus === 'unsure' ||
    inputs.currentSetup === 'need-address' ||
    (inputs.addressStatus === 'registered-agent' && hasProcessorOrBankGoal)
  ) {
    items.push({
      step: 'Select a business address route',
      detail: 'Registered-agent-only addresses may not satisfy every processor, bank, or marketplace check. Verify address requirements before applying.',
      priority: 'important',
    });
  }

  if (inputs.currentSetup !== 'llc-ein-bank') {
    items.push({
      step: 'Apply for US bank account',
      detail: 'Mercury, Relay, or a traditional bank. Approval depends on country and entity.',
      priority: 'critical',
    });
  }

  if (inputs.paymentGoals.includes('stripe')) {
    items.push({
      step: 'Prepare Stripe application',
      detail: 'Have your EIN, bank account, US address, and business website ready before applying.',
      priority: 'important',
    });
  }

  if (inputs.paymentGoals.includes('paypal')) {
    items.push({
      step: 'Set up PayPal Business account',
      detail: 'PayPal has separate verification from Stripe. Identity and address verification required.',
      priority: 'important',
    });
  }

  if (inputs.paymentGoals.includes('amazon-shopify')) {
    items.push({
      step: 'Prepare marketplace verification materials',
      detail: 'Check Amazon or Shopify requirements for EIN, bank account, business address, tax interview, and identity verification.',
      priority: 'important',
    });
  }

  items.push({
    step: 'Create business website with required legal pages',
    detail: 'Privacy policy, terms of service, refund policy, and contact page.',
    priority: 'important',
  });

  items.push({
    step: 'Set up compliance calendar',
    detail: 'Track annual report, Form 5472, BOI reporting, and state franchise tax deadlines.',
    priority: 'recommended',
  });

  items.push({
    step: 'Review formation provider fit',
    detail: 'Compare providers based on your route, not just price. Consider total 3-year cost.',
    priority: 'recommended',
  });

  return items;
}

/* ------------------------------------------------------------------ */
/*  Verdict Determination                                              */
/* ------------------------------------------------------------------ */

function determineVerdict(riskPanel: RiskPanel): RouteVerdict {
  const risks = Object.values(riskPanel);
  const blockedCount = risks.filter((r) => r === 'blocked').length;
  const highCount = risks.filter((r) => r === 'high').length;
  const needsReviewCount = risks.filter((r) => r === 'needs-review').length;

  if (blockedCount > 0) return 'blocked';
  if (highCount >= 3) return 'risky';
  if (riskPanel.paymentAccess === 'high' && riskPanel.bankingKyc === 'high') return 'risky';
  if (highCount >= 1) return 'incomplete';
  if (needsReviewCount >= 2) return 'needs-professional-review';
  return 'possible';
}

function generateSummary(inputs: RoutePlannerInputs, verdict: RouteVerdict): string {
  const entity = inputs.entityPreference === 'llc' ? 'LLC' :
    inputs.entityPreference === 'c-corp' ? 'C-Corp' :
    inputs.entityPreference === 'stripe-atlas' ? 'Stripe Atlas' :
    inputs.entityPreference === 'mor' ? 'Merchant of Record' : 'US entity';

  const country = inputs.countryOfResidence ?? 'your country';
  const processor = inputs.paymentGoals.includes('stripe') ? 'Stripe' :
    inputs.paymentGoals.includes('paypal') ? 'PayPal' :
    inputs.paymentGoals.includes('amazon-shopify') ? 'Amazon or Shopify' :
    inputs.paymentGoals.includes('us-bank') ? 'US banking' :
    inputs.paymentGoals.includes('privacy') && inputs.paymentGoals.includes('lowest-cost') ? 'privacy and lowest upfront cost' :
    inputs.paymentGoals.includes('privacy') ? 'privacy-focused' :
    inputs.paymentGoals.includes('lowest-cost') ? 'lowest upfront cost' : 'your selected payment';
  const tradeoff = inputs.paymentGoals.includes('privacy') && inputs.paymentGoals.includes('lowest-cost')
    ? ' Privacy and lowest upfront cost can point to different provider routes, so compare route fit, renewal cost, address handling, and support depth before choosing.'
    : '';

  switch (verdict) {
    case 'possible':
      return `Based on your inputs, a ${entity} route from ${country} appears directionally viable for ${processor}. You may still need to verify bank eligibility, address requirements, and payment processor policies for your specific situation.${tradeoff}`;
    case 'incomplete':
      return `Your ${processor} route from ${country} has gaps that need attention. Key steps may be missing, such as a bank account, a valid business address, marketplace or processor readiness, or an EIN. Review the missing steps below before proceeding.${tradeoff}`;
    case 'risky':
      return `Multiple risk factors were detected for a ${processor} route from ${country}. Country, processor, and bank eligibility must be verified before spending money. Professional review from a qualified attorney or CPA familiar with non-US founder situations is recommended.${tradeoff}`;
    case 'blocked':
      return `Your current ${processor} setup from ${country} has one or more factors that may block progress. This could be related to country-specific banking restrictions, address issues, or entity type mismatch. Review the risk panel and consider consulting a professional.${tradeoff}`;
    case 'needs-professional-review':
      return `Your ${processor} route from ${country} has factors that require professional evaluation. Check country, processor, bank, and address eligibility, then consider consulting with an attorney or CPA who specializes in non-US founder entity formation before taking action.${tradeoff}`;
  }
}

/* ------------------------------------------------------------------ */
/*  Main Evaluation                                                    */
/* ------------------------------------------------------------------ */

export function evaluateRoute(inputs: RoutePlannerInputs): RouteResult {
  const riskPanel: RiskPanel = {
    paymentAccess: assessPaymentRisk(inputs),
    address: assessAddressRisk(inputs),
    bankingKyc: assessBankingRisk(inputs),
    compliance: assessComplianceRisk(inputs),
    cost: assessCostRisk(inputs),
  };

  const verdict = determineVerdict(riskPanel);
  const summary = generateSummary(inputs, verdict);
  const missingSteps = getMissingSteps(inputs);
  const checklist = generateChecklist(inputs);

  const providerFit = getProviderFit(
    inputs.riskTolerance ?? 'balanced',
    inputs.entityPreference ?? 'unsure',
  );

  return {
    verdict,
    summary,
    missingSteps,
    riskPanel,
    checklist,
    providerFit,
  };
}
