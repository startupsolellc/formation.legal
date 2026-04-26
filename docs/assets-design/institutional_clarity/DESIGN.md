---
name: Institutional Clarity
colors:
  surface: '#fbf8ff'
  surface-dim: '#d9d9e7'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f2ff'
  surface-container: '#ededfb'
  surface-container-high: '#e7e7f5'
  surface-container-highest: '#e1e1ef'
  on-surface: '#191b25'
  on-surface-variant: '#434656'
  inverse-surface: '#2e303a'
  inverse-on-surface: '#f0effe'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004ced'
  primary: '#003ec7'
  on-primary: '#ffffff'
  primary-container: '#0052ff'
  on-primary-container: '#dfe3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#952200'
  on-tertiary: '#ffffff'
  tertiary-container: '#bf3003'
  on-tertiary-container: '#ffddd5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001452'
  on-primary-fixed-variant: '#0038b6'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#ffdbd2'
  tertiary-fixed-dim: '#ffb4a1'
  on-tertiary-fixed: '#3c0800'
  on-tertiary-fixed-variant: '#891e00'
  background: '#fbf8ff'
  on-background: '#191b25'
  surface-variant: '#e1e1ef'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-xs:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-page: 40px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is engineered for **Formation.Legal**, a platform dedicated to demystifying complex US legal and financial infrastructure for international founders. The brand personality is rooted in "Institutional Minimalism"—a style that prioritizes legibility, structural integrity, and calm authority. It evokes the feeling of a modern digital archive or a premium legal journal.

The UI avoids decorative flourishes in favor of structural clarity. It draws from **Minimalism** for its spatial discipline and **Brutalism** for its honest use of borders and monospaced data. The objective is to build immediate trust through an editorial aesthetic that feels both permanent and accessible.

Target Audience:
- Non-US founders requiring high-fidelity information.
- Legal and compliance officers.
- Fintech and banking partners.

## Colors

The palette is anchored by a high-utility **Action Blue**, used exclusively for interactive elements and primary call-to-actions. This is contrasted against an off-white, slightly cool background that reduces eye strain during long-form research.

**Hierarchy is managed through Slate grays:**
- **Primary Text (#0F172A):** Used for headlines and critical body copy.
- **Secondary Text (#64748B):** Used for metadata, labels, and supporting information.
- **Borders (#E2E8F0):** Used for structural containment and card definitions.

Color is used sparingly to ensure that when it does appear, it signifies importance or interactivity.

## Typography

This design system utilizes a dual-font strategy to separate narrative UI from technical data.

1.  **Inter (UI/Narrative):** Used for all navigational elements, headers, and instructional body text. It provides a neutral, highly legible foundation.
2.  **JetBrains Mono (Data/Citations):** Used for all specific legal citations, banking codes, compliance steps, and "hard" data points. The monospaced nature emphasizes precision and the "research-first" aspect of the platform.

**Type Scales:**
- Use `display-lg` for landing hero sections.
- Use `headline-md` for section titles within the Route Planner.
- Use `data-mono` for all monospaced technical elements.
- Use `label-xs` for status chips and uppercase category markers.

## Layout & Spacing

The design system employs a **Fixed Grid** philosophy. Content is contained within a maximum width of 1280px to maintain readability and editorial focus. 

**Grid & Alignment:**
- A 12-column grid is used for desktop layouts.
- Elements are separated by clear structural borders rather than whitespace alone.
- **Vertical Rhythm:** A base unit of 8px dictates all padding and margins. 

**Navigation Structure:**
The sidebar or top-level navigation must prioritize the primary routes: *Route Planner, Payment Access, Address & Banking, Compliance, Providers,* and *Research*. Each section should feel distinct but structurally identical.

## Elevation & Depth

This design system rejects traditional shadows and depth blurs. It relies on **Structural Layering** and **Bold Borders**.

- **Flat Architecture:** All cards and surfaces sit on the same optical plane. 
- **Depth via Borders:** Instead of shadows, use 1px solid borders (#E2E8F0) to define containers. 
- **Interactive Lift:** Hover states do not use shadows; instead, they utilize a slight background color shift (e.g., to a very faint blue tint) or a border-color weight increase.
- **Stacked UI:** Use a subtle inset border for secondary content areas like sidebars or "Research" panels to create a nested hierarchy.

## Shapes

To maintain an institutional and serious tone, the design system uses a **Soft (0.25rem)** roundedness level. This subtle rounding prevents the UI from feeling overly aggressive (as sharp corners might) while remaining professional.

- **Primary Components:** Buttons, input fields, and status chips use the standard `0.25rem` (4px) radius.
- **Containers:** Large cards and section containers also follow the `0.25rem` radius.
- **Icons:** Use geometric, line-based icons with consistent stroke weights that match the typography's visual weight.

## Components

### Buttons
- **Primary:** Solid `#0052FF` with white Inter text. Bold, 1px border.
- **Secondary:** White background with `#0052FF` border and text.
- **Ghost:** No background, `#475569` text, used for less critical actions in the Research panel.

### Border-Based Cards
Cards are the primary content vehicle. They must have a 1px solid border, a white background, and a "header" area separated by a horizontal line. Technical data inside cards should use `JetBrains Mono`.

### Status Chips
Used for compliance indicators (e.g., "Pending", "Verified").
- **Style:** Small, `label-xs` typography, uppercase. 
- **Colors:** Neutral background with high-contrast text. Use success green or warning amber only where strictly necessary for legal status.

### Monospaced Data Elements
Used for EIN numbers, routing codes, and legal statues. These elements should be wrapped in a subtle gray background box with a 1px dashed border to distinguish them as "copyable" or "official" data strings.

### Input Fields
Clean, 1px borders. Focus state is a 2px `#0052FF` border. Use `Inter` for labels and `JetBrains Mono` for user-entered technical data.