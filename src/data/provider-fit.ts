/**
 * provider-fit.ts — Static provider fit data.
 * No ratings, no scores. Scenario-based route fit only.
 */

import type { ProviderFitOption, RiskTolerance, EntityPreference } from '../types/route-planner';

interface ProviderData {
  name: string;
  routeLabel: string;
  reason: string;
  caveat?: string;
  fitFor: {
    riskTolerance: RiskTolerance[];
    entityPreference: EntityPreference[];
  };
}

export const PROVIDERS: ProviderData[] = [
  {
    name: 'Inc Authority',
    routeLabel: 'Free-entry / long consideration route',
    reason: 'Offers a free LLC formation option (state fees still apply). May suit founders who want to start with minimal upfront cost.',
    caveat: 'Upsells on registered agent, EIN, and compliance services. Total cost may increase with add-ons.',
    fitFor: {
      riskTolerance: ['cheapest'],
      entityPreference: ['llc', 'unsure'],
    },
  },
  {
    name: 'Bizee',
    routeLabel: 'Lowest upfront cost route',
    reason: 'Low base pricing for LLC formation. Straightforward process for founders on a budget.',
    caveat: 'Registered agent service is a separate annual fee. Check current pricing for your state.',
    fitFor: {
      riskTolerance: ['cheapest', 'balanced'],
      entityPreference: ['llc', 'unsure'],
    },
  },
  {
    name: 'Northwest Registered Agent',
    routeLabel: 'Privacy / support route',
    reason: 'Uses their own address on public filings for privacy. Known for responsive customer support. Includes registered agent for the first year.',
    caveat: 'Higher renewal costs in subsequent years. Verify current pricing.',
    fitFor: {
      riskTolerance: ['balanced', 'safest'],
      entityPreference: ['llc', 'unsure'],
    },
  },
  {
    name: 'LegalZoom',
    routeLabel: 'Brand familiarity / broader legal services route',
    reason: 'Well-known brand with add-on legal services (attorney consultations, trademark filing). May suit founders who want a one-stop platform.',
    caveat: 'Generally higher pricing than specialists. Formation-only service may not justify the premium.',
    fitFor: {
      riskTolerance: ['balanced', 'safest'],
      entityPreference: ['llc', 'c-corp', 'unsure'],
    },
  },
];

export function getProviderFit(
  riskTolerance: RiskTolerance,
  entityPreference: EntityPreference,
): ProviderFitOption[] {
  return PROVIDERS
    .filter((p) =>
      p.fitFor.riskTolerance.includes(riskTolerance) &&
      p.fitFor.entityPreference.includes(entityPreference),
    )
    .map((p) => ({
      label: p.routeLabel,
      providerName: p.name,
      reason: p.reason,
      caveat: p.caveat,
    }));
}
