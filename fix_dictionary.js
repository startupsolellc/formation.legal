import fs from 'fs';

const filePath = './src/lib/link-dictionary.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix targets
const targetFixes = {
  '"/guides/us-llc-for-stripe"': '"/payment-access/us-llc-for-stripe"',
  '"/guides/registered-agent-address-vs-business-address"': '"/address-banking/registered-agent-address-vs-business-address"',
  '"/guides/boi-reporting-us-llc-2026"': '"/compliance/boi-reporting-us-llc-2026"',
  '"/guides/form-5472-foreign-owned-llc"': '"/compliance/form-5472-foreign-owned-llc"',
  '"/guides/payment-stack-for-non-us-founders"': '"/payment-access/payment-stack-for-non-us-founders"',
  '"/guides/us-llc-for-paypal"': '"/payment-access/us-llc-for-paypal"'
};

for (const [oldTarget, newTarget] of Object.entries(targetFixes)) {
  content = content.split(oldTarget).join(newTarget);
}

// 2. Comment out missing keywords
const missingKeywords = [
  "stripe connect account", "stripe connect", "formation service", 
  "formation fee", "fein", "foreign owned us llc", "foreign owned", 
  "international founder", "new mexico", "bizee", "inc authority", 
  "docketed", "legalzoom", "incfile", "northwest registered agent", 
  "nigeria", "pakistan", "bangladesh"
];

// Re-write using block replace
content = content.replace(/  \{\n([\s\S]*?)\n  \}(,?)/g, (match, inner, comma) => {
  let isMissing = false;
  for (let kw of missingKeywords) {
    if (inner.includes(`keyword: "${kw}"`)) {
      isMissing = true;
      break;
    }
  }
  
  if (isMissing) {
    return match.split('\n').map(line => {
      if (line.trim() === '') return line;
      return '// ' + line;
    }).join('\n');
  }
  return match;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed link-dictionary.ts');
