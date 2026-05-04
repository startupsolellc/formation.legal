const fs = require('fs');
const path = require('path');

const keywords = [
  "stripe connect account", "registered agent service", "ein application", "boi report", "beneficial ownership information", "nonresident alien", "stripe atlas", "merchant of record", "pro forma 1120", "registered agent address", "home country address", "stripe connect", "formation service", "formation fee", "state filing fee", "annual fee", "rolling reserve", "virtual mailbox", "virtual office", "us ip address", "stripe", "paypal", "llc", "registered agent", "ein", "fein", "employer identification number", "itin", "ssn", "form ss-4", "kyc", "boi", "fincen", "corporate transparency act", "formation", "payment access", "compliance", "form 5472", "disregarded entity", "foreign owned us llc", "foreign owned", "non-us founder", "international founder", "non-us founders", "delaware", "wyoming", "new mexico", "c-corp", "single-member llc", "paddle", "lemon squeezy", "mercury", "relay", "wise", "bizee", "inc authority", "docketed", "legalzoom", "incfile", "northwest registered agent", "nigeria", "pakistan", "bangladesh", "utility bill", "bank statement", "proof of address", "saas", "digital product", "ecommerce", "amazon", "shopify"
];

function getAllFiles(dirPath, arrayOfFiles) {
  let files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles('./src/content', []);
const missing = [];

keywords.forEach(kw => {
  let found = false;
  const regex = new RegExp(kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (regex.test(content)) {
      found = true;
      break;
    }
  }
  if (!found) {
    missing.push(kw);
  }
});

console.log("Missing keywords:", JSON.stringify(missing));
