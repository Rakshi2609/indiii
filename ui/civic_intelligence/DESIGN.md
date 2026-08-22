---
name: Civic Intelligence
colors:
  surface: '#f8faf4'
  surface-dim: '#d8dbd5'
  surface-bright: '#f8faf4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4ee'
  surface-container: '#ecefe9'
  surface-container-high: '#e7e9e3'
  surface-container-highest: '#e1e3dd'
  on-surface: '#191c19'
  on-surface-variant: '#404941'
  inverse-surface: '#2e312d'
  inverse-on-surface: '#eff2eb'
  outline: '#717970'
  outline-variant: '#c0c9be'
  surface-tint: '#2e6a41'
  primary: '#003b1b'
  on-primary: '#ffffff'
  primary-container: '#14532d'
  on-primary-container: '#87c695'
  inverse-primary: '#96d5a3'
  secondary: '#5c5f5c'
  on-secondary: '#ffffff'
  secondary-container: '#dee0dc'
  on-secondary-container: '#606360'
  tertiary: '#591d28'
  on-tertiary: '#ffffff'
  tertiary-container: '#75333e'
  on-tertiary-container: '#f79eaa'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f2be'
  primary-fixed-dim: '#96d5a3'
  on-primary-fixed: '#00210d'
  on-primary-fixed-variant: '#12512c'
  secondary-fixed: '#e1e3df'
  secondary-fixed-dim: '#c5c7c3'
  on-secondary-fixed: '#191c1a'
  on-secondary-fixed-variant: '#444845'
  tertiary-fixed: '#ffd9dc'
  tertiary-fixed-dim: '#ffb2bb'
  on-tertiary-fixed: '#3c0613'
  on-tertiary-fixed-variant: '#73323d'
  background: '#f8faf4'
  on-background: '#191c19'
  surface-variant: '#e1e3dd'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar-width: 250px
  topbar-height: 64px
  container-margin: 24px
  gutter: 16px
  unit-xs: 4px
  unit-sm: 8px
  unit-md: 16px
  unit-lg: 24px
  unit-xl: 32px
---

## Brand & Style
The design system is engineered for **LAND AI (इंडी-भूमि)**, an enterprise-grade platform for Indian land records. The brand personality is rooted in **Precise Authority** and **Institutional Trust**. It reflects the gravity of government records while employing the efficiency of modern computational intelligence.

The design style is **Corporate Modern with Functional Minimalism**. It prioritizes information density, legibility, and structural integrity. It avoids decorative flourishes in favor of "Command Center" aesthetics—highly organized, data-rich, and reliable. The emotional response should be one of absolute clarity and legal-grade certainty.

## Colors
The palette is deeply institutional, drawing from the colors of formal documentation and the natural earth. 

- **Primary Green:** Represents the authority of land administration and growth.
- **Warm Neutrals:** Used for backgrounds and surfaces to reduce eye strain during long periods of document analysis.
- **AI & Spatial Blue:** A specific indigo/violet used exclusively to denote machine-learning outputs or GIS-related data layers.
- **Saffron Highlight:** Reserved strictly for high-importance highlights, such as legal conflicts or critical officer notifications.
- **Semantic Logic:** Standardized colors for status tracking, ensuring immediate recognition of data health.

## Typography
This design system utilizes **Manrope** for its balance between humanistic curves and technical precision. The hierarchy is designed for high information density.

- **Headlines:** Use Bold weights for structural sections and page headers.
- **Body Text:** Primarily uses the `body-md` (14px) size for data grids and document summaries to maximize on-screen information.
- **Labels:** Used for metadata, status badges, and table headers. Always use `label-md` or `label-sm` with increased letter spacing for readability in all-caps scenarios.
- **Numerical Data:** For land coordinates and survey numbers, ensure tabular lining is used where possible to keep columns aligned.

## Layout & Spacing
The layout follows a **Fixed-Fluid hybrid grid**. 

- **Global Navigation:** A permanent 250px left-hand sidebar contains primary navigation and module switching. The 64px Topbar handles search, notifications, and profile.
- **Information Density:** Spacing is compact (`unit-sm` for internal card padding) to allow for the display of complex land records.
- **Split-Pane View:** For verification tasks, the screen is split 50/50. The left pane hosts the original document (PDF/Scan), and the right pane hosts the AI Extraction results. This layout is locked to the viewport height with internal scrolling.
- **Breakpoints:** 
  - Desktop: 1280px+ (Full sidebar).
  - Tablet: 768px - 1279px (Collapsed sidebar, 16px margins).
  - Mobile: <768px (Bottom nav or Hamburger, 12px margins).

## Elevation & Depth
In this design system, depth is used to communicate functional hierarchy rather than decoration.

- **Base Surface:** Uses the neutral background `#F7F8F5`.
- **Primary Containers:** Property cards and data modules use white backgrounds with a subtle `1px` border in `#E2E8E0`.
- **Low-Contrast Outlines:** Instead of heavy shadows, use fine borders to define edges. 
- **Elevation Layers:**
  - **Level 0 (Flat):** Page background.
  - **Level 1 (Raised):** Cards, Sidebar, Topbar. Use a very soft ambient shadow: `0px 2px 4px rgba(23, 32, 27, 0.04)`.
  - **Level 2 (Overlay):** Modals, Command Palette. Use a more defined shadow: `0px 8px 24px rgba(23, 32, 27, 0.12)`.

## Shapes
The shape language is **Soft/Technical**. 

- **Standard Radius:** 4px (`rounded-sm`) for inputs and small buttons.
- **Container Radius:** 8px (`rounded-lg`) for property cards and metric cards.
- **Status Badges:** Use a 2px radius or a full pill shape depending on the context of the list.
- **Input Fields:** Strict 4px radius to maintain a professional, sharp appearance suitable for enterprise software.

## Components

### Sidebar & Topbar
- **Sidebar:** Dark primary background or high-contrast light. Icons should be line-art style (2px stroke). Active states use a left-edge indicator in Saffron.
- **Topbar:** Contains the **Command Palette** trigger.

### Property Cards (Certificates)
- Header contains the Survey Number and GIS Verified icon.
- Body displays Owner Name, Area (Hectares/Acres), and Land Type.
- Footer contains the primary action (View Lineage) and the current status badge.

### Status Badges
Consistent color coding for workflow tracking:
- `UPLOADED`: Grey/Neutral
- `PROCESSING`: Info Blue (Animated pulse)
- `AI EXTRACTED`: Indigo/AI Blue
- `LOW CONFIDENCE`: Saffron/Warning
- `CONFLICT DETECTED`: Critical Red
- `GIS VERIFIED`: Success Green (Outline)
- `OFFICER VERIFIED`: Success Green (Solid)
- `APPROVED`: Primary Green (Solid + Checkmark)

### Metric Cards
- Large numerical displays for "Total Area Scanned," "Disputes Resolved," and "Pending Verifications."
- Include a small sparkline graph showing 7-day trends in `#15803D`.

### Timeline Component
- Vertical line with nodes representing "Lineage." 
- Nodes represent transfer of ownership, partitions, or legal encumbrances. 
- AI-inferred dates are marked with the Indigo/AI Blue color.

### Command Palette
- Centered overlay (Width: 600px).
- Blurs the background.
- Fast-action search for Survey Numbers, Names, or Village Codes.
- Uses `label-md` for keyboard shortcut hints (e.g., `⌘K`).