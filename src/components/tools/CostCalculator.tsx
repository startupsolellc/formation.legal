/* Cost Calculator — Preact island component */
import type { JSX } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import type { CostAssumptions, EinHandling, ProviderCostBreakdown } from '../../types/cost-calculator';
import { calculateProviderCost, DEFAULT_COST_ASSUMPTIONS, PROVIDER_COSTS } from '../../data/provider-costs';

type AssumptionNumberField =
  | 'stateFilingFee'
  | 'annualComplianceEstimate'
  | 'annualTaxPrepEstimate';

type CostCalculatorEvent =
  | 'cost_assumption_change'
  | 'cost_ein_toggle'
  | 'cost_reset';

function trackEvent(event: CostCalculatorEvent, data?: Record<string, string>) {
  if (typeof window !== 'undefined') {
    console.log(`[analytics] ${event}`, data ?? '');
  }
}

const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function formatMoney(value: number | null) {
  return value === null ? 'Verify' : USD.format(value);
}

function parseMoney(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.round(parsed));
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function MoneyField({
  id,
  label,
  value,
  helper,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  helper: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} class="block text-sm font-semibold text-[#191b25]">
        {label}
      </label>
      <div class="mt-2 flex items-center rounded-[4px] border border-[#e2e8f0] bg-white focus-within:border-[#0052ff]">
        <span class="px-3 text-sm font-semibold text-[#434656]">$</span>
        <input
          id={id}
          type="number"
          min="0"
          inputMode="numeric"
          value={value}
          onInput={(event: JSX.TargetedEvent<HTMLInputElement, Event>) => onChange(parseMoney(event.currentTarget.value))}
          class="w-full border-0 bg-transparent px-2 py-2.5 text-sm font-semibold text-[#191b25] outline-none"
        />
      </div>
      <p class="mt-1.5 text-xs leading-relaxed text-[#434656]">{helper}</p>
    </div>
  );
}

function EinToggle({
  value,
  onChange,
}: {
  value: EinHandling;
  onChange: (value: EinHandling) => void;
}) {
  const options: { value: EinHandling; label: string; helper: string }[] = [
    {
      value: 'provider-assisted',
      label: 'Use provider help fees',
      helper: 'Adds each provider\'s listed EIN service fee where available.',
    },
    {
      value: 'self-file',
      label: 'I will handle EIN myself',
      helper: 'Uses $0 for EIN. The IRS does not charge for EINs.',
    },
  ];

  return (
    <fieldset>
      <legend class="block text-sm font-semibold text-[#191b25]">EIN handling</legend>
      <div class="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              class={`rounded-[4px] border px-3 py-2.5 text-left transition-colors ${
                selected
                  ? 'border-[#0052ff] bg-[#0052ff]/5 text-[#191b25]'
                  : 'border-[#e2e8f0] bg-white text-[#434656] hover:border-[#0052ff]/40'
              }`}
            >
              <span class="block text-sm font-semibold">{option.label}</span>
              <span class="mt-1 block text-xs leading-relaxed text-[#434656]">{option.helper}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function AssumptionSummary({ assumptions }: { assumptions: CostAssumptions }) {
  return (
    <div class="grid gap-2 sm:grid-cols-3">
      <div class="rounded-[4px] border border-[#e2e8f0] bg-white px-3 py-2">
        <p class="font-mono text-[10px] font-bold uppercase tracking-wider text-[#434656]">State filing</p>
        <p class="mt-1 text-sm font-bold text-[#191b25]">{formatMoney(assumptions.stateFilingFee)}</p>
      </div>
      <div class="rounded-[4px] border border-[#e2e8f0] bg-white px-3 py-2">
        <p class="font-mono text-[10px] font-bold uppercase tracking-wider text-[#434656]">Compliance / year</p>
        <p class="mt-1 text-sm font-bold text-[#191b25]">{formatMoney(assumptions.annualComplianceEstimate)}</p>
      </div>
      <div class="rounded-[4px] border border-[#e2e8f0] bg-white px-3 py-2">
        <p class="font-mono text-[10px] font-bold uppercase tracking-wider text-[#434656]">Tax prep / year</p>
        <p class="mt-1 text-sm font-bold text-[#191b25]">{formatMoney(assumptions.annualTaxPrepEstimate)}</p>
      </div>
    </div>
  );
}

function CostCell({ value, muted = false }: { value: number | null; muted?: boolean }) {
  if (value === null) {
    return (
      <span class="inline-flex rounded-[2px] border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#9a3412]">
        Verify renewal
      </span>
    );
  }

  return (
    <span class={`font-semibold tabular-nums ${muted ? 'text-[#434656]' : 'text-[#191b25]'}`}>
      {formatMoney(value)}
    </span>
  );
}

function ProviderNotes({ item }: { item: ProviderCostBreakdown }) {
  return (
    <details class="mt-3">
      <summary class="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-wider text-[#0052ff] hover:text-[#003ec7]">
        Notes & sources
      </summary>
      <div class="mt-3 space-y-3 border-l border-[#e2e8f0] pl-3">
        <div>
          <p class="text-xs font-semibold text-[#191b25]">Registered agent</p>
          <p class="mt-0.5 text-xs leading-relaxed text-[#434656]">{item.provider.registeredAgent.note}</p>
        </div>
        <div>
          <p class="text-xs font-semibold text-[#191b25]">EIN</p>
          <p class="mt-0.5 text-xs leading-relaxed text-[#434656]">{item.provider.ein.note}</p>
        </div>
        {item.provider.notes.length > 0 && (
          <ul class="space-y-1">
            {item.provider.notes.map((note) => (
              <li key={note} class="text-xs leading-relaxed text-[#434656]">
                {note}
              </li>
            ))}
          </ul>
        )}
        <div class="flex flex-wrap gap-2">
          {item.provider.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              class="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0052ff] hover:text-[#003ec7]"
            >
              {source.label}
            </a>
          ))}
        </div>
      </div>
    </details>
  );
}

function CostTable({ breakdowns }: { breakdowns: ProviderCostBreakdown[] }) {
  return (
    <div class="overflow-hidden rounded-[4px] border border-[#e2e8f0] bg-white">
      <div class="overflow-x-auto">
        <table class="min-w-[940px] w-full border-collapse text-left">
          <caption class="sr-only">3-year LLC provider cost estimates</caption>
          <thead>
            <tr class="border-b border-[#e2e8f0] bg-[#ededfb]">
              <th scope="col" class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#191b25]">Provider</th>
              <th scope="col" class="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#191b25]">Initial setup</th>
              <th scope="col" class="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#191b25]">First tax season</th>
              <th scope="col" class="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#191b25]">Year 2 operating</th>
              <th scope="col" class="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#191b25]">Year 3 operating</th>
              <th scope="col" class="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#191b25]">3-year total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#e2e8f0]">
            {breakdowns.map((item) => (
              <tr key={item.provider.id} class="align-top">
                <th scope="row" class="w-[42%] px-5 py-5">
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-sm font-bold text-[#191b25]">{item.provider.name}</span>
                      <span class="rounded-[2px] border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#434656]">
                        {item.provider.packageName}
                      </span>
                    </div>
                    <p class="mt-2 text-xs font-normal leading-relaxed text-[#434656]">{item.provider.summary}</p>
                    <div class="mt-3 grid gap-1 text-xs font-normal text-[#434656]">
                      <span>Formation fee: <strong class="text-[#191b25]">{formatMoney(item.formationFee)}</strong></span>
                      <span>
                        Registered agent renewal:{' '}
                        <strong class="text-[#191b25]">
                          {item.registeredAgentRenewal === null ? 'Verify' : `${formatMoney(item.registeredAgentRenewal)}/yr`}
                        </strong>
                      </span>
                      <span>EIN add-on in this estimate: <strong class="text-[#191b25]">{formatMoney(item.einAddOn)}</strong></span>
                    </div>
                    <ProviderNotes item={item} />
                  </div>
                </th>
                <td class="px-4 py-5">
                  <CostCell value={item.initialSetup} />
                </td>
                <td class="px-4 py-5">
                  <CostCell value={item.firstTaxSeason} muted />
                </td>
                <td class="px-4 py-5">
                  <CostCell value={item.year2Operating} muted />
                </td>
                <td class="px-4 py-5">
                  <CostCell value={item.year3Operating} muted />
                </td>
                <td class="px-4 py-5">
                  <CostCell value={item.total3Year} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CostCalculator() {
  const [assumptions, setAssumptions] = useState<CostAssumptions>(DEFAULT_COST_ASSUMPTIONS);

  const breakdowns = useMemo(
    () => PROVIDER_COSTS.map((provider) => calculateProviderCost(provider, assumptions)),
    [assumptions],
  );

  const verifiedDates = PROVIDER_COSTS.map((provider) => provider.verifiedDate).sort();
  const lastVerified = verifiedDates[verifiedDates.length - 1] ?? '2026-05-02';

  const updateNumber = (field: AssumptionNumberField, value: number) => {
    setAssumptions((current) => ({ ...current, [field]: value }));
    trackEvent('cost_assumption_change', { field });
  };

  const updateEinHandling = (value: EinHandling) => {
    setAssumptions((current) => ({ ...current, einHandling: value }));
    trackEvent('cost_ein_toggle', { value });
  };

  const reset = () => {
    setAssumptions(DEFAULT_COST_ASSUMPTIONS);
    trackEvent('cost_reset');
  };

  return (
    <div class="space-y-8">
      <section class="brutal-card p-5">
        <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="font-mono text-[10px] font-bold uppercase tracking-wider text-[#434656]">Step 1</p>
            <h2 class="mt-1 text-lg font-bold text-[#191b25]">Set your assumptions</h2>
            <p class="mt-2 max-w-2xl text-sm leading-relaxed text-[#434656]">
              The default view is a New Mexico-style setup: $50 state filing, no annual state report, and free IRS EIN handling. Change the numbers if your state or provider path is different.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            class="self-start rounded-[4px] border border-[#e2e8f0] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#434656] transition-colors hover:border-[#0052ff] hover:text-[#0052ff]"
          >
            Reset
          </button>
        </div>

        <div class="grid gap-5 lg:grid-cols-3">
          <MoneyField
            id="state-filing-fee"
            label="State filing fee"
            value={assumptions.stateFilingFee}
            helper="One-time state fee paid when the LLC is formed. New Mexico is commonly $50."
            onChange={(value) => updateNumber('stateFilingFee', value)}
          />
          <MoneyField
            id="annual-compliance-estimate"
            label="Compliance estimate"
            value={assumptions.annualComplianceEstimate}
            helper="Annual state report, franchise tax, or filing estimate. Use $0 if your state has no LLC annual report."
            onChange={(value) => updateNumber('annualComplianceEstimate', value)}
          />
          <MoneyField
            id="annual-tax-prep-estimate"
            label="Tax prep estimate"
            value={assumptions.annualTaxPrepEstimate}
            helper="Annual tax-preparation estimate. Replace with your accountant's quote if known."
            onChange={(value) => updateNumber('annualTaxPrepEstimate', value)}
          />
        </div>

        <div class="mt-6">
          <EinToggle value={assumptions.einHandling} onChange={updateEinHandling} />
        </div>
      </section>

      <section class="space-y-4">
        <div>
          <p class="font-mono text-[10px] font-bold uppercase tracking-wider text-[#434656]">Step 2</p>
          <h2 class="mt-1 text-lg font-bold text-[#191b25]">Compare 3-year estimates</h2>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-[#434656]">
            Initial setup shows what you usually pay to get formed. First tax season is separated because tax prep often happens the following year. Year 2 and Year 3 show recurring registered agent, compliance, and tax-prep assumptions.
          </p>
        </div>

        <AssumptionSummary assumptions={assumptions} />
        <CostTable breakdowns={breakdowns} />
      </section>

      <section class="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div class="brutal-card p-5">
          <p class="font-mono text-[10px] font-bold uppercase tracking-wider text-[#434656]">What is not included</p>
          <ul class="mt-3 space-y-2 text-sm leading-relaxed text-[#434656]">
            <li>Banking, payment processor, mailbox, virtual address, license, permit, and expedited filing fees.</li>
            <li>Legal advice, accounting beyond the tax-prep estimate, or state-specific penalties.</li>
            <li>Calendar timing. A company formed late in the year may have a different first tax-prep workload.</li>
            <li>Affiliate commissions or provider ratings. This page uses public pricing sources only.</li>
          </ul>
        </div>

        <div class="brutal-card p-5">
          <p class="font-mono text-[10px] font-bold uppercase tracking-wider text-[#434656]">Pricing check</p>
          <p class="mt-3 text-sm leading-relaxed text-[#434656]">
            Provider pricing was last checked on <strong class="text-[#191b25]">{formatDate(lastVerified)}</strong>. Prices and package contents can change during checkout.
          </p>
          <p class="mt-3 text-sm leading-relaxed text-[#434656]">
            EINs are free when obtained directly from the IRS; paid EIN services are convenience or assistance fees.
          </p>
          <a
            href="https://www.irs.gov/businesses/employer-identification-number"
            target="_blank"
            rel="noreferrer"
            class="mt-3 inline-block font-mono text-[10px] font-bold uppercase tracking-wider text-[#0052ff] hover:text-[#003ec7]"
          >
            IRS EIN information
          </a>
        </div>
      </section>
    </div>
  );
}
