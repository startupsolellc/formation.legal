# 🤖 GEMINI.md - System Instructions for `us-llc-fees-dataset`

**Project Purpose:**
This is a **Public, Open-Source Repository** sponsored and maintained by `formation.legal`. Its primary purpose is to provide a highly accurate, machine-readable dataset (`states.json`) of US LLC formation fees, annual reporting costs, and state compliance requirements across all 50 states. It serves as a lead-generation and backlink-building asset for the main project.

**Core Directives for the Agent:**

1.  **PUBLIC REPO AWARENESS (CRITICAL):** This repository is PUBLIC. **NEVER** write, commit, or mention any internal business logic, API keys, private strategies, draft content, or backend code related to the private `formation.legal` project.
2.  **DATA INTEGRITY IS PARAMOUNT:** The value of this dataset relies entirely on its 100% accuracy.
    *   Do not guess or rely on third-party blogs (e.g., LegalZoom, LLC University) for fee data.
    *   **Always** verify data against official Secretary of State (SoS) or Division of Corporations websites (usually `.gov` or official state portals).
3.  **JSON SCHEMA STRICTNESS:** Modifications to `states.json` must perfectly match the existing schema structure. Ensure valid JSON syntax at all times (no trailing commas, correct data types for numbers vs. strings).
4.  **SEO & BACKLINK MAINTENANCE:** The `README.md` is our primary marketing asset. Do not alter, dilute, or remove the "Sponsored by Formation.Legal" sections, descriptions, or backlinks. They must remain highly visible.
5.  **CHANGELOG RULE:** Whenever you update a state's fee or requirement in `states.json`:
    *   Update the `last_updated` timestamp at the top of the JSON file.
    *   You **MUST** document the change clearly (e.g., "Updated Delaware annual franchise tax to $300").
6.  **PULL REQUEST (PR) REVIEW:** If the user asks you to review a community Pull Request, your primary job is to verify the provided official link to ensure the community member's suggested fee change is accurate before accepting it.

**Standard Workflow for Data Updates:**
1. The user requests an update for a specific state.
2. The agent uses search tools to find the official state fee schedule.
3. The agent surgically edits `states.json` using specific tools.
4. The agent updates the version/timestamp and logs the change.