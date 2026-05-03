/**
 * cost-calculator.ts — Types for the 3-year LLC cost calculator.
 */

export type EinHandling = 'provider-assisted' | 'self-file';

export interface CostAssumptions {
  stateFilingFee: number;
  annualComplianceEstimate: number;
  annualTaxPrepEstimate: number;
  einHandling: EinHandling;
}

export interface CostSource {
  label: string;
  url: string;
}

export interface ProviderCostProfile {
  id: string;
  name: string;
  packageName: string;
  summary: string;
  formationFee: number;
  registeredAgent: {
    year1: number;
    renewal: number | null;
    note: string;
  };
  ein: {
    providerAssisted: number;
    note: string;
  };
  notes: string[];
  sources: CostSource[];
  verifiedDate: string;
}

export interface ProviderCostBreakdown {
  provider: ProviderCostProfile;
  formationFee: number;
  stateFilingFee: number;
  registeredAgentYear1: number;
  registeredAgentRenewal: number | null;
  einAddOn: number;
  annualComplianceEstimate: number;
  annualTaxPrepEstimate: number;
  initialSetup: number;
  firstTaxSeason: number;
  year2Operating: number | null;
  year3Operating: number | null;
  total3Year: number | null;
}
