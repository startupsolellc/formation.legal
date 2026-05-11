# US LLC State Requirements & Fees Dataset

A comprehensive, open-source dataset of United States LLC formation fees, annual reporting costs, and state compliance requirements in a machine-readable JSON format.

## 🤝 Sponsored By

Sponsored and maintained by **[Formation.Legal - The Non-US Founder's Guide to US LLCs](https://formation.legal)**. 

Formation.Legal provides completely free, unbiased guides on how non-US residents can form US LLCs, get EINs without ITINs, and open business bank accounts (Mercury, Relay, Stripe).

## 🚀 Purpose

Finding accurate, up-to-date LLC fees across all 50 states is surprisingly difficult. Most blogs are outdated or hide the information behind paywalls. 

We created this dataset to provide developers, researchers, and entrepreneurs with a reliable, single source of truth for state fees, directly verified from Secretary of State (SoS) websites.

## 📦 How to Use (Usage)

You can fetch this dataset directly in your applications (React, Node.js, Python, Astro, etc.) using the raw GitHub URL.

### Fetching via JavaScript/TypeScript

```javascript
const URL = "https://raw.githubusercontent.com/[YOUR-GITHUB-USERNAME]/us-llc-fees-dataset/main/states.json";

fetch(URL)
  .then(response => response.json())
  .then(data => console.log("Wyoming Formation Fee:", data.states.WY.formation_fee));
```

## 🗂 Data Schema (`states.json`)

The dataset is structured as a dictionary with 2-letter state codes as keys.

- `formation_fee` (Number): The state's one-time filing fee for Articles of Organization.
- `annual_report_fee` (Number): The recurring annual franchise tax or report fee.
- `annual_report_due_date` (String): When the report is due.
- `state_income_tax_rate` (Number): The corporate/LLC income tax rate at the state level.
- `official_link` (String): The direct link to the Secretary of State's fee schedule.

## 🛠 Contributing

Found an outdated fee? We welcome Pull Requests!
1. Fork the repository.
2. Update the `states.json` file.
3. Submit a PR.

## 📄 License

This dataset is open-sourced under the MIT License. Feel free to use it in your commercial SaaS, blogs, or internal tools. All we ask is that you keep the sponsor link intact.
