/**
 * provider-costs.ts — Static source-backed pricing data for the cost calculator.
 *
 * Pricing changes often. Keep this file conservative: use public provider pages,
 * store source URLs, and prefer null only when a required recurring price is not
 * clear enough to calculate a responsible 3-year total.
 */

import type { CostAssumptions, ProviderCostBreakdown, ProviderCostProfile } from '../types/cost-calculator';

export const DEFAULT_COST_ASSUMPTIONS: CostAssumptions = {
  stateFilingFee: 50,
  annualComplianceEstimate: 0,
  annualTaxPrepEstimate: 500,
  einHandling: 'self-file',
};

export const PROVIDER_COSTS: ProviderCostProfile[] = [
  {
    id: 'bizee-basic',
    name: 'Bizee',
    packageName: 'Basic',
    summary: 'Low upfront formation package with first-year registered agent service included.',
    formationFee: 0,
    registeredAgent: {
      year1: 0,
      renewal: 119,
      note: 'First year included with formation; standalone registered agent page lists $119/year.',
    },
    ein: {
      providerAssisted: 70,
      note: 'Basic package does not advertise EIN as included; checkout materials have listed EIN as an add-on.',
    },
    notes: [
      'State filing fees are separate.',
      'Standard and Premium packages may include more services, but this calculator compares the lowest public entry package.',
    ],
    sources: [
      { label: 'Bizee LLC packages', url: 'https://bizee.com/form/llc' },
      { label: 'Bizee order pricing', url: 'https://orders.bizee.com/form-order-now.php' },
      { label: 'Bizee registered agent', url: 'https://bizee.com/business-management/registered-agent' },
    ],
    verifiedDate: '2026-05-02',
  },
  {
    id: 'northwest-llc',
    name: 'Northwest Registered Agent',
    packageName: 'LLC formation',
    summary: 'Privacy-oriented formation package with first-year registered agent service included.',
    formationFee: 39,
    registeredAgent: {
      year1: 0,
      renewal: 125,
      note: 'Registered agent service is included for year one, then renews at $125/year.',
    },
    ein: {
      providerAssisted: 200,
      note: 'Northwest lists $200 EIN service for foreigners or founders without an SSN.',
    },
    notes: [
      'State filing fees are separate.',
      'Northwest also lists a lower $50 EIN service for founders with an SSN.',
    ],
    sources: [
      { label: 'Northwest LLC formation', url: 'https://www.northwestregisteredagent.com/llc' },
      { label: 'Northwest EIN service', url: 'https://www.northwestregisteredagent.com/start-a-business/ein-tax-id' },
    ],
    verifiedDate: '2026-05-02',
  },
  {
    id: 'legalzoom-basic',
    name: 'LegalZoom',
    packageName: 'Basic',
    summary: 'Well-known self-guided formation package; registered agent is a separate annual service.',
    formationFee: 0,
    registeredAgent: {
      year1: 249,
      renewal: 249,
      note: 'Registered agent service is listed separately at $249/year.',
    },
    ein: {
      providerAssisted: 79,
      note: 'EIN service is listed separately at $79.',
    },
    notes: [
      'State filing fees are separate.',
      'Higher-tier LLC packages include additional services, but this calculator compares the Basic entry package.',
    ],
    sources: [
      { label: 'LegalZoom LLC packages', url: 'https://www.legalzoom.com/business/business-formation/llc-overview.html' },
      { label: 'LegalZoom business services', url: 'https://www.legalzoom.com/business/business-operations/' },
    ],
    verifiedDate: '2026-05-02',
  },
  {
    id: 'inc-authority-free',
    name: 'Inc Authority',
    packageName: 'Free LLC',
    summary: 'Free-entry formation offer with first-year registered agent service advertised as included.',
    formationFee: 0,
    registeredAgent: {
      year1: 0,
      renewal: null,
      note: 'First-year registered agent is advertised as included; renewal pricing was not clear enough on the public pages reviewed.',
    },
    ein: {
      providerAssisted: 0,
      note: 'Public pages advertise free EIN or tax ID assistance, but checkout verification is still recommended.',
    },
    notes: [
      'State filing fees are separate.',
      'Because registered agent renewal pricing was not clear enough, the 3-year total is marked for verification.',
    ],
    sources: [
      { label: 'Inc Authority free LLC', url: 'https://www.incauthority.com/' },
      { label: 'Inc Authority online form', url: 'https://www.incauthority.com/form-online' },
    ],
    verifiedDate: '2026-05-02',
  },
];

export function calculateProviderCost(
  provider: ProviderCostProfile,
  assumptions: CostAssumptions,
): ProviderCostBreakdown {
  const einAddOn = assumptions.einHandling === 'provider-assisted'
    ? provider.ein.providerAssisted
    : 0;

  const initialSetup =
    provider.formationFee +
    assumptions.stateFilingFee +
    provider.registeredAgent.year1 +
    einAddOn;

  const firstTaxSeason =
    assumptions.annualComplianceEstimate +
    assumptions.annualTaxPrepEstimate;

  const year2Operating = provider.registeredAgent.renewal === null
    ? null
    : provider.registeredAgent.renewal +
      assumptions.annualComplianceEstimate +
      assumptions.annualTaxPrepEstimate;

  const year3Operating = provider.registeredAgent.renewal === null
    ? null
    : provider.registeredAgent.renewal +
      assumptions.annualComplianceEstimate +
      assumptions.annualTaxPrepEstimate;

  return {
    provider,
    formationFee: provider.formationFee,
    stateFilingFee: assumptions.stateFilingFee,
    registeredAgentYear1: provider.registeredAgent.year1,
    registeredAgentRenewal: provider.registeredAgent.renewal,
    einAddOn,
    annualComplianceEstimate: assumptions.annualComplianceEstimate,
    annualTaxPrepEstimate: assumptions.annualTaxPrepEstimate,
    initialSetup,
    firstTaxSeason,
    year2Operating,
    year3Operating,
    total3Year: year2Operating === null || year3Operating === null
      ? null
      : initialSetup + firstTaxSeason + year2Operating + year3Operating,
  };
}
