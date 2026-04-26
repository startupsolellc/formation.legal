/**
 * route-planner.ts — Type definitions for the Route Planner tool.
 * All types used across the planner UI and rule engine.
 */

/* ------------------------------------------------------------------ */
/*  Input Types                                                        */
/* ------------------------------------------------------------------ */

export type CountryOfResidence =
  | 'turkey'
  | 'pakistan'
  | 'nigeria'
  | 'bangladesh'
  | 'india'
  | 'philippines'
  | 'uae'
  | 'eu'
  | 'latam'
  | 'other';

export type BusinessModel =
  | 'saas'
  | 'digital-product'
  | 'agency-freelance'
  | 'amazon-ecommerce'
  | 'ai-tool'
  | 'consulting'
  | 'unsure';

export type PaymentGoal =
  | 'stripe'
  | 'paypal'
  | 'us-bank'
  | 'amazon-shopify'
  | 'privacy'
  | 'lowest-cost'
  | 'review-first';

export type CurrentSetup =
  | 'no-company'
  | 'llc-no-ein'
  | 'llc-ein'
  | 'llc-ein-bank'
  | 'need-address'
  | 'unsure';

export type AddressStatus =
  | 'registered-agent'
  | 'virtual-mailbox'
  | 'physical-office'
  | 'home-country'
  | 'unsure';

export type EntityPreference =
  | 'llc'
  | 'c-corp'
  | 'stripe-atlas'
  | 'mor'
  | 'unsure';

export type RiskTolerance =
  | 'cheapest'
  | 'balanced'
  | 'review-first';

/* ------------------------------------------------------------------ */
/*  Form State                                                         */
/* ------------------------------------------------------------------ */

export interface RoutePlannerInputs {
  countryOfResidence: CountryOfResidence | null;
  businessModel: BusinessModel | null;
  paymentGoals: PaymentGoal[];
  currentSetup: CurrentSetup | null;
  addressStatus: AddressStatus | null;
  entityPreference: EntityPreference | null;
  riskTolerance: RiskTolerance | null;
}

/* ------------------------------------------------------------------ */
/*  Output Types                                                       */
/* ------------------------------------------------------------------ */

export type RouteVerdict =
  | 'possible'
  | 'incomplete'
  | 'risky'
  | 'blocked'
  | 'needs-professional-review';

export type RiskLevel =
  | 'low'
  | 'medium'
  | 'high'
  | 'needs-review'
  | 'blocked';

export interface RiskPanel {
  paymentAccess: RiskLevel;
  address: RiskLevel;
  bankingKyc: RiskLevel;
  compliance: RiskLevel;
  cost: RiskLevel;
}

export interface ChecklistItem {
  step: string;
  detail?: string;
  priority: 'critical' | 'important' | 'recommended';
}

export interface ProviderFitOption {
  label: string;
  providerName: string;
  reason: string;
  caveat?: string;
}

export interface MissingStep {
  id: string;
  label: string;
  detail: string;
}

export interface RouteResult {
  verdict: RouteVerdict;
  summary: string;
  missingSteps: MissingStep[];
  riskPanel: RiskPanel;
  checklist: ChecklistItem[];
  providerFit: ProviderFitOption[];
}

/* ------------------------------------------------------------------ */
/*  Analytics Placeholders                                             */
/* ------------------------------------------------------------------ */

export type AnalyticsEvent =
  | 'route_start'
  | 'route_step_complete'
  | 'route_complete'
  | 'provider_card_view'
  | 'provider_click_placeholder'
  | 'tool_result_copy';
