/* Route Planner — Preact island component */
import { useState, useCallback, useEffect } from 'preact/hooks';
import type { RoutePlannerInputs, RouteResult, AnalyticsEvent } from '../../types/route-planner';
import { evaluateRoute } from '../../data/route-rules';

/* Analytics placeholder */
function trackEvent(event: AnalyticsEvent, data?: Record<string, string>) {
  if (typeof window !== 'undefined') {
    console.log(`[analytics] ${event}`, data ?? '');
  }
}

/* ------------------------------------------------------------------ */
/*  Step Configuration                                                 */
/* ------------------------------------------------------------------ */

const STEPS = [
  { id: 'country', label: 'Country' },
  { id: 'business', label: 'Business' },
  { id: 'payment', label: 'Payment' },
  { id: 'setup', label: 'Setup' },
  { id: 'address', label: 'Address' },
  { id: 'entity', label: 'Entity' },
  { id: 'risk', label: 'Risk' },
] as const;

const COUNTRY_OPTIONS = [
  { value: 'turkey', label: 'Turkey' },
  { value: 'pakistan', label: 'Pakistan' },
  { value: 'nigeria', label: 'Nigeria' },
  { value: 'bangladesh', label: 'Bangladesh' },
  { value: 'india', label: 'India' },
  { value: 'philippines', label: 'Philippines' },
  { value: 'uae', label: 'UAE' },
  { value: 'eu', label: 'EU country' },
  { value: 'latam', label: 'Latin America' },
  { value: 'other', label: 'Other / unsure' },
] as const;

const BUSINESS_OPTIONS = [
  { value: 'saas', label: 'SaaS' },
  { value: 'digital-product', label: 'Digital product' },
  { value: 'agency-freelance', label: 'Agency / freelance' },
  { value: 'amazon-ecommerce', label: 'Amazon / ecommerce' },
  { value: 'ai-tool', label: 'AI tool' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'unsure', label: 'Unsure' },
] as const;

const PAYMENT_OPTIONS = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'us-bank', label: 'US bank account / fintech' },
  { value: 'amazon-shopify', label: 'Amazon / Shopify' },
  { value: 'privacy', label: 'Privacy' },
  { value: 'lowest-cost', label: 'Lowest upfront cost' },
  { value: 'review-first', label: 'Review-first setup' },
] as const;

const SETUP_OPTIONS = [
  { value: 'no-company', label: 'No US company yet' },
  { value: 'llc-no-ein', label: 'LLC formed, no EIN' },
  { value: 'llc-ein', label: 'LLC + EIN' },
  { value: 'llc-ein-bank', label: 'LLC + EIN + bank account' },
  { value: 'need-address', label: 'Need business address' },
  { value: 'unsure', label: 'Unsure' },
] as const;

const ADDRESS_OPTIONS = [
  { value: 'registered-agent', label: 'Registered agent only (state notices)' },
  { value: 'virtual-mailbox', label: 'Mailbox / mail forwarding address' },
  { value: 'physical-office', label: 'Dedicated office or leased location' },
  { value: 'home-country', label: 'Founder residential proof outside the US' },
  { value: 'unsure', label: 'Unsure' },
] as const;

const ENTITY_OPTIONS = [
  { value: 'llc', label: 'LLC' },
  { value: 'c-corp', label: 'C-Corp' },
  { value: 'stripe-atlas', label: 'Stripe Atlas' },
  { value: 'mor', label: 'Merchant of Record' },
  { value: 'unsure', label: 'Unsure' },
] as const;

const RISK_OPTIONS = [
  { value: 'cheapest', label: 'Cheapest' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'review-first', label: 'Review-first route' },
] as const;

/* ------------------------------------------------------------------ */
/*  Shared UI Primitives                                               */
/* ------------------------------------------------------------------ */

function OptionButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: any }) {
  return (
    <button
      type="button"
      onClick={onClick}
      class={`w-full text-left px-4 py-3 text-sm border transition-colors rounded-[4px] ${
        selected
          ? 'border-[#0052ff] bg-[#0052ff]/5 text-[#191b25] font-semibold'
          : 'border-[#e2e8f0] bg-white text-[#434656] hover:border-[#0052ff]/40'
      }`}
    >
      {children}
    </button>
  );
}

function CheckboxButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: any }) {
  return (
    <button
      type="button"
      onClick={onClick}
      class={`w-full text-left px-4 py-3 text-sm border transition-colors rounded-[4px] flex items-center gap-3 ${
        selected
          ? 'border-[#0052ff] bg-[#0052ff]/5 text-[#191b25] font-semibold'
          : 'border-[#e2e8f0] bg-white text-[#434656] hover:border-[#0052ff]/40'
      }`}
    >
      <span class={`flex-shrink-0 w-4 h-4 border rounded-[2px] flex items-center justify-center ${selected ? 'border-[#0052ff] bg-[#0052ff]' : 'border-[#e2e8f0]'}`}>
        {selected && <span class="text-white text-[10px]">✓</span>}
      </span>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Risk Badge                                                         */
/* ------------------------------------------------------------------ */

const RISK_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-green-50 border-green-200', text: 'text-[#166534]' },
  medium: { bg: 'bg-amber-50 border-amber-200', text: 'text-[#9a3412]' },
  high: { bg: 'bg-red-50 border-red-200', text: 'text-[#991b1b]' },
  'needs-review': { bg: 'bg-gray-50 border-gray-200', text: 'text-[#475569]' },
  blocked: { bg: 'bg-red-100 border-red-300', text: 'text-[#991b1b]' },
};

function RiskBadge({ level }: { level: string }) {
  const c = RISK_COLORS[level] ?? RISK_COLORS['needs-review'];
  return (
    <span class={`inline-block px-2 py-0.5 border rounded-[2px] font-mono text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
      {level.replace('-', ' ')}
    </span>
  );
}

const VERDICT_MAP: Record<string, { label: string; color: string }> = {
  possible: { label: 'Possible', color: 'text-[#166534] border-green-300 bg-green-50' },
  incomplete: { label: 'Incomplete', color: 'text-[#9a3412] border-amber-300 bg-amber-50' },
  risky: { label: 'Risky', color: 'text-[#991b1b] border-red-300 bg-red-50' },
  blocked: { label: 'Blocked', color: 'text-[#991b1b] border-red-400 bg-red-100' },
  'needs-professional-review': { label: 'Needs Professional Review', color: 'text-[#475569] border-gray-300 bg-gray-50' },
};

/* ------------------------------------------------------------------ */
/*  Result Panel                                                       */
/* ------------------------------------------------------------------ */

function ResultPanel({ result, onReset }: { result: RouteResult; onReset: () => void }) {
  const [copied, setCopied] = useState(false);
  const v = VERDICT_MAP[result.verdict] ?? VERDICT_MAP['needs-professional-review'];

  useEffect(() => {
    result.providerFit.forEach((pf) => {
      trackEvent('provider_card_view', { provider: pf.providerName });
    });
  }, [result.providerFit]);

  const copyChecklist = useCallback(() => {
    const text = result.checklist.map((item, i) =>
      `${i + 1}. [${item.priority.toUpperCase()}] ${item.step}${item.detail ? `\n   ${item.detail}` : ''}`
    ).join('\n');
    navigator.clipboard.writeText(`US Business Route — 90-Day Checklist\n${'='.repeat(40)}\n\n${text}\n\nGenerated by Formation.Legal Route Planner\nThis is a directional estimate, not advice.`);
    setCopied(true);
    trackEvent('tool_result_copy');
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  return (
    <div class="space-y-6">
      {/* Verdict */}
      <div class={`border rounded-[4px] p-5 ${v.color}`}>
        <p class="font-mono text-[10px] font-bold uppercase tracking-wider mb-2">Route Verdict</p>
        <p class="text-xl font-bold">{v.label}</p>
      </div>

      {/* Summary */}
      <div class="border border-[#e2e8f0] rounded-[4px] p-5 bg-white">
        <p class="font-mono text-[10px] font-bold uppercase tracking-wider text-[#434656] mb-2">Route Summary</p>
        <p class="text-sm text-[#434656] leading-relaxed">{result.summary}</p>
      </div>

      {/* Risk Panel */}
      <div class="border border-[#e2e8f0] rounded-[4px] overflow-hidden bg-white">
        <div class="px-5 py-3 border-b border-[#e2e8f0] bg-[#ededfb]">
          <p class="font-mono text-xs font-bold uppercase tracking-wider text-[#191b25]">Risk Panel</p>
        </div>
        <div class="divide-y divide-[#e2e8f0]">
          {[
            ['Payment Access', result.riskPanel.paymentAccess],
            ['Address', result.riskPanel.address],
            ['Banking / KYC', result.riskPanel.bankingKyc],
            ['Compliance', result.riskPanel.compliance],
            ['Cost', result.riskPanel.cost],
          ].map(([label, level]) => (
            <div class="px-5 py-3 flex items-center justify-between">
              <span class="text-sm text-[#191b25] font-medium">{label as string}</span>
              <RiskBadge level={level as string} />
            </div>
          ))}
        </div>
      </div>

      {/* Missing Steps */}
      {result.missingSteps.length > 0 && (
        <div class="border border-[#e2e8f0] rounded-[4px] overflow-hidden bg-white">
          <div class="px-5 py-3 border-b border-[#e2e8f0] bg-[#ededfb]">
            <p class="font-mono text-xs font-bold uppercase tracking-wider text-[#191b25]">Missing Steps</p>
          </div>
          <div class="p-5 space-y-3">
            {result.missingSteps.map((s) => (
              <div key={s.id} class="flex items-start gap-3">
                <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9a3412] flex-shrink-0" />
                <div>
                  <p class="text-sm font-semibold text-[#191b25]">{s.label}</p>
                  <p class="text-xs text-[#434656] mt-0.5">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 90-Day Checklist */}
      <div class="border border-[#e2e8f0] rounded-[4px] overflow-hidden bg-white">
        <div class="px-5 py-3 border-b border-[#e2e8f0] bg-[#ededfb] flex items-center justify-between">
          <p class="font-mono text-xs font-bold uppercase tracking-wider text-[#191b25]">First 90-Day Checklist</p>
          <button onClick={copyChecklist} class="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0052ff] hover:text-[#003ec7] transition-colors">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <div class="p-5 space-y-3">
          {result.checklist.map((item, i) => {
            const pColor = item.priority === 'critical' ? 'text-[#991b1b] border-red-200 bg-red-50' :
              item.priority === 'important' ? 'text-[#9a3412] border-amber-200 bg-amber-50' :
              'text-[#475569] border-gray-200 bg-gray-50';
            return (
              <div key={i} class="flex items-start gap-3">
                <span class="font-mono text-xs text-[#434656] mt-0.5 flex-shrink-0 w-5 tabular-nums">{i + 1}.</span>
                <div class="flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <p class="text-sm font-medium text-[#191b25]">{item.step}</p>
                    <span class={`px-1.5 py-0.5 border rounded-[2px] font-mono text-[9px] font-bold uppercase ${pColor}`}>
                      {item.priority}
                    </span>
                  </div>
                  {item.detail && <p class="text-xs text-[#434656] mt-0.5">{item.detail}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Provider Fit */}
      {result.providerFit.length > 0 && (
        <div class="border border-[#e2e8f0] rounded-[4px] overflow-hidden bg-white">
          <div class="px-5 py-3 border-b border-[#e2e8f0] bg-[#ededfb]">
            <p class="font-mono text-xs font-bold uppercase tracking-wider text-[#191b25]">Provider Route Fit</p>
          </div>
          <div class="divide-y divide-[#e2e8f0]">
            {result.providerFit.map((pf) => {
              return (
                <div key={pf.providerName} class="p-5">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-bold text-[#191b25]">{pf.providerName}</span>
                    <span class="font-mono text-[10px] text-[#434656] uppercase tracking-wider">{pf.label}</span>
                  </div>
                  <p class="text-sm text-[#434656]">{pf.reason}</p>
                  {pf.caveat && <p class="text-xs text-[#434656] mt-1 italic">Note: {pf.caveat}</p>}
                  <button
                    type="button"
                    onClick={() => trackEvent('provider_click_placeholder', { provider: pf.providerName })}
                    class="mt-3 font-mono text-[10px] font-bold uppercase tracking-wider text-[#0052ff] hover:text-[#003ec7] transition-colors"
                  >
                    Save route fit
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div class="flex flex-col sm:flex-row gap-3">
        <a href="/payment-access/formation-does-not-equal-payment-approval" class="flex-1 text-center px-4 py-2.5 border border-[#e2e8f0] rounded-[4px] text-sm font-semibold text-[#434656] hover:border-[#0052ff] transition-colors">
          Read: Formation ≠ Payment Approval
        </a>
        <button onClick={onReset} class="flex-1 px-4 py-2.5 border border-[#e2e8f0] rounded-[4px] text-sm font-semibold text-[#434656] hover:border-[#0052ff] transition-colors">
          Start Over
        </button>
      </div>

      {/* Disclaimer */}
      <div class="border border-[#ba1a1a] rounded-[4px] p-4 bg-[#ffdad6]">
        <p class="font-mono text-[10px] font-bold uppercase tracking-wider text-[#93000a] mb-1">Disclaimer</p>
        <p class="text-xs text-[#93000a] leading-relaxed">
          This tool provides a directional route estimate. It is not legal, tax, banking, payment processor, or formation advice. Requirements, provider pricing, and eligibility can change. Verify current requirements with official sources and consider consulting a qualified professional.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function RoutePlanner() {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<RoutePlannerInputs>({
    countryOfResidence: null, businessModel: null, paymentGoals: [],
    currentSetup: null, addressStatus: null, entityPreference: null, riskTolerance: null,
  });
  const [result, setResult] = useState<RouteResult | null>(null);

  const canAdvance = (() => {
    switch (step) {
      case 0: return inputs.countryOfResidence !== null;
      case 1: return inputs.businessModel !== null;
      case 2: return inputs.paymentGoals.length > 0;
      case 3: return inputs.currentSetup !== null;
      case 4: return inputs.addressStatus !== null;
      case 5: return inputs.entityPreference !== null;
      case 6: return inputs.riskTolerance !== null;
      default: return false;
    }
  })();

  const next = () => {
    if (step === 0) {
      trackEvent('route_start');
    }
    trackEvent('route_step_complete', { step: STEPS[step].id });
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      const r = evaluateRoute(inputs);
      setResult(r);
      trackEvent('route_complete');
    }
  };

  const back = () => { if (step > 0) setStep(step - 1); };
  const reset = () => {
    setStep(0);
    setInputs({ countryOfResidence: null, businessModel: null, paymentGoals: [], currentSetup: null, addressStatus: null, entityPreference: null, riskTolerance: null });
    setResult(null);
  };

  const togglePayment = (val: any) => {
    setInputs((prev) => ({
      ...prev,
      paymentGoals: prev.paymentGoals.includes(val)
        ? prev.paymentGoals.filter((g) => g !== val)
        : [...prev.paymentGoals, val],
    }));
  };

  if (result) {
    return <ResultPanel result={result} onReset={reset} />;
  }

  return (
    <div>
      {/* Progress */}
      <div class="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} class="flex-1 flex flex-col items-center gap-1">
            <div class={`h-1 w-full rounded-full ${i <= step ? 'bg-[#0052ff]' : 'bg-[#e2e8f0]'}`} />
            <span class={`font-mono text-[9px] uppercase tracking-wider hidden sm:block ${i <= step ? 'text-[#0052ff]' : 'text-[#434656]'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div class="mb-8">
        {step === 0 && (
          <div>
            <h3 class="text-lg font-bold text-[#191b25] mb-1">Where are you based?</h3>
            <p class="text-sm text-[#434656] mb-5">Your country of residence affects banking eligibility, payment processor approval, and compliance requirements.</p>
            <div class="grid gap-2 sm:grid-cols-2">
              {COUNTRY_OPTIONS.map((o) => (
                <OptionButton key={o.value} selected={inputs.countryOfResidence === o.value} onClick={() => setInputs({ ...inputs, countryOfResidence: o.value as any })}>
                  {o.label}
                </OptionButton>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h3 class="text-lg font-bold text-[#191b25] mb-1">What is your business model?</h3>
            <p class="text-sm text-[#434656] mb-5">Different business models have different payment, compliance, and entity requirements.</p>
            <div class="grid gap-2 sm:grid-cols-2">
              {BUSINESS_OPTIONS.map((o) => (
                <OptionButton key={o.value} selected={inputs.businessModel === o.value} onClick={() => setInputs({ ...inputs, businessModel: o.value as any })}>
                  {o.label}
                </OptionButton>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 class="text-lg font-bold text-[#191b25] mb-1">What are your payment goals?</h3>
            <p class="text-sm text-[#434656] mb-5">Select all that apply. Your payment goals determine the requirements for your route.</p>
            <div class="grid gap-2 sm:grid-cols-2">
              {PAYMENT_OPTIONS.map((o) => (
                <CheckboxButton key={o.value} selected={inputs.paymentGoals.includes(o.value as any)} onClick={() => togglePayment(o.value)}>
                  {o.label}
                </CheckboxButton>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 class="text-lg font-bold text-[#191b25] mb-1">What is your current setup?</h3>
            <p class="text-sm text-[#434656] mb-5">Tell us where you are in the process.</p>
            <div class="grid gap-2">
              {SETUP_OPTIONS.map((o) => (
                <OptionButton key={o.value} selected={inputs.currentSetup === o.value} onClick={() => setInputs({ ...inputs, currentSetup: o.value as any })}>
                  {o.label}
                </OptionButton>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 class="text-lg font-bold text-[#191b25] mb-1">Which address layer is your weakest point?</h3>
            <p class="text-sm text-[#434656] mb-5">Separate your registered-agent address for state contact from founder residential proof and the business legal or operating address banks and processors may request.</p>
            <div class="grid gap-2">
              {ADDRESS_OPTIONS.map((o) => (
                <OptionButton key={o.value} selected={inputs.addressStatus === o.value} onClick={() => setInputs({ ...inputs, addressStatus: o.value as any })}>
                  {o.label}
                </OptionButton>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h3 class="text-lg font-bold text-[#191b25] mb-1">Entity preference?</h3>
            <p class="text-sm text-[#434656] mb-5">Which entity type are you considering? Select "Unsure" if you need guidance.</p>
            <div class="grid gap-2 sm:grid-cols-2">
              {ENTITY_OPTIONS.map((o) => (
                <OptionButton key={o.value} selected={inputs.entityPreference === o.value} onClick={() => setInputs({ ...inputs, entityPreference: o.value as any })}>
                  {o.label}
                </OptionButton>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h3 class="text-lg font-bold text-[#191b25] mb-1">Risk tolerance?</h3>
            <p class="text-sm text-[#434656] mb-5">This helps us match you with the right provider route and setup approach.</p>
            <div class="grid gap-2">
              {RISK_OPTIONS.map((o) => (
                <OptionButton key={o.value} selected={inputs.riskTolerance === o.value} onClick={() => setInputs({ ...inputs, riskTolerance: o.value as any })}>
                  {o.label}
                </OptionButton>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div class="flex items-center justify-between">
        <button onClick={back} disabled={step === 0}
          class={`px-5 py-2.5 text-sm font-semibold rounded-[4px] border transition-colors ${step === 0 ? 'border-[#e2e8f0] text-[#e2e8f0] cursor-not-allowed' : 'border-[#e2e8f0] text-[#434656] hover:border-[#0052ff]'}`}>
          Back
        </button>
        <span class="font-mono text-[11px] text-[#434656]">{step + 1} / {STEPS.length}</span>
        <button onClick={next} disabled={!canAdvance}
          class={`px-5 py-2.5 text-sm font-semibold rounded-[4px] border transition-colors ${canAdvance ? 'bg-[#0052ff] border-[#0052ff] text-white hover:bg-[#003ec7]' : 'bg-[#e2e8f0] border-[#e2e8f0] text-[#434656] cursor-not-allowed'}`}>
          {step === STEPS.length - 1 ? 'Get Route' : 'Next'}
        </button>
      </div>
    </div>
  );
}
