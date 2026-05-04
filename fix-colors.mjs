import fs from 'fs';
import path from 'path';

const map = {
  'bg-white': 'bg-[var(--color-surface-container)]',
  'text-[#0c0a09]': 'text-[var(--color-text-primary)]',
  'text-[#57534e]': 'text-[var(--color-text-secondary)]',
  'text-[#475569]': 'text-[var(--color-text-secondary)]',
  'text-[#78716c]': 'text-[var(--color-text-muted)]',
  'border-[#d6d3d1]': 'border-[var(--color-border)]',
  'border-gray-200': 'border-[var(--color-border)]',
  'border-gray-300': 'border-[var(--color-border-subtle)]',
  'border-[#e7e5e4]': 'border-[var(--color-border-subtle)]',
  'bg-gray-50': 'bg-[var(--color-surface-dim)]',
  'bg-[#fafaf9]': 'bg-[var(--color-surface-dim)]',
  'bg-[#eef2ff]': 'bg-[var(--color-surface-dim)]', // light blue background
  'border-[#4f46e5]': 'border-[var(--color-action)]',
  'text-[#4f46e5]': 'text-[var(--color-action)]',
  'hover:text-[#4338ca]': 'hover:text-[var(--color-action-hover)]',
  'hover:border-[#a5b4fc]': 'hover:border-[var(--color-action-hover)]',
  'border-[#c7d2fe]': 'border-[var(--color-primary-200)]',
  'divide-[#e7e5e4]': 'divide-[var(--color-border)]',
  'bg-[#4f46e5]': 'bg-[var(--color-action)]',
  'hover:bg-[#4338ca]': 'hover:bg-[var(--color-action-hover)]',
  'text-white': 'text-white' // keep this for buttons
};

const files = [
  'src/components/tools/CostCalculator.tsx',
  'src/components/tools/RoutePlanner.tsx',
  'src/components/tools/ToolNav.astro',
  'src/components/providers/ProviderCostSnapshot.astro'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [key, value] of Object.entries(map)) {
    // using regex to ensure whole word match where appropriate, or just global replace
    content = content.split(key).join(value);
  }
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}
