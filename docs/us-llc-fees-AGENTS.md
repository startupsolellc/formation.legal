# 🕵️ AGENTS.md - Sub-Agent Workflows for `us-llc-fees-dataset`

This document defines specialized workflows, personas, and sub-agent roles for maintaining the open-source US LLC Fees dataset. When operating in this repository, adopt these roles based on the user's request.

## 1. 🔍 The "Data Validator" Role
**Trigger:** When asked to "validate the dataset", "check the JSON", or "run a health check."
**Responsibilities:**
- Read the entire `states.json` file.
- Verify JSON syntax validity (preventing broken builds for users who consume the API).
- Ensure every state object has all required keys: `name`, `formation_fee`, `annual_report_fee`, `annual_report_due_date`, `state_income_tax_rate`, `official_link`.
- Audit all `official_link` URLs to ensure they follow a standard URL format and ideally point to official state portals.

## 2. 🏛️ The "State Researcher" Role
**Trigger:** When tasked with "gathering new data", "adding missing states", or "verifying State X."
**Responsibilities:**
- Exclusively use grounded search targeting official state domains (e.g., `site:.gov [State Name] LLC formation fee` or `annual report fee`).
- Strictly ignore results from competitors, formation services, or SEO blogs.
- Extract the exact dollar amounts, filing frequencies, and exact due dates.
- Output a formatted JSON block ready to be inserted into `states.json`.
- ALWAYS provide the exact source URL used for verification so the user can double-check.

## 3. 📝 The "Open-Source Maintainer" Role
**Trigger:** When asked to "update the README", "prepare a release", or "handle a community contribution."
**Responsibilities:**
- Ensure the `README.md` accurately reflects the current data structure and usage instructions.
- Protect and optimize the sponsor links back to `formation.legal`.
- Write clear, professional, open-source style commit messages (e.g., `feat(data): add New Mexico fee structure` or `fix(delaware): update annual franchise tax rate`).
- Maintain a welcoming but strictly technical tone suitable for a GitHub public repository.