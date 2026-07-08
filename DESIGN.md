---
name: Civitas AI
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#4fdbc8'
  on-secondary: '#003731'
  secondary-container: '#04b4a2'
  on-secondary-container: '#003f38'
  tertiary: '#ffb690'
  on-tertiary: '#552100'
  tertiary-container: '#a04500'
  on-tertiary-container: '#ffd2bd'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783200'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system facilitates a high-stakes, data-driven environment for legislative decision-making. The brand personality is authoritative yet visionary, combining the stability of government institutions with the cutting-edge precision of modern AI. 

The aesthetic is a sophisticated blend of **Minimalism** and **Glassmorphism**. It prioritizes clarity and focus, using depth and transparency to organize complex information hierarchies. The UI should evoke a sense of calm control, appearing as a "digital command center" that is both futuristic and deeply reliable. 

Visual signals include:
- **Optical Clarity:** High-contrast typography against deep obsidian backgrounds.
- **Layered Depth:** Translucent surfaces that suggest a multi-dimensional data space.
- **Precision Engineering:** Subtle 1px borders and micro-interactions that respond with mathematical accuracy.

## Colors
The palette is anchored in a deep, "Midnight Navy" space to minimize eye strain during extended use. 

- **Primary (Indigo):** Used for primary actions, focus states, and representing "The Institution."
- **Secondary (Teal):** Reserved for data visualizations, AI-driven insights, and positive trends.
- **Accent (Orange):** Utilized sparingly for high-priority alerts, "Priority" markers, and legislative deadlines.
- **Surface:** Surfaces use a semi-transparent hex (#161B2F) with a 60-80% opacity to allow background blurs to emerge.
- **Strokes:** All borders should use a white-tinted transparency (`rgba(255, 255, 255, 0.1)`) to define edges without adding visual weight.

## Typography
The system uses **Inter** for its exceptional legibility in data-heavy interfaces. For technical and meta-data elements, **Geist** is introduced to provide a modern, monospaced-adjacent feel that reinforces the AI/Technical nature of the platform.

- **Scale:** Use tight tracking on larger headlines to maintain a "premium" editorial feel. 
- **Hierarchy:** Use the secondary text color (#94A3B8) for body text and labels to ensure the primary white headers pop.
- **Weights:** Avoid using weights below 400 to ensure readability against the dark background.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for desktop to maintain the density required for a professional dashboard, while transitioning to a fluid stack for mobile.

- **Grid:** A 12-column grid system with wide 24px gutters to allow the glassmorphic card borders "room to breathe."
- **Padding:** Internal card padding should be generous (default 24px or 32px) to prevent data clusters from feeling cramped.
- **Reflow:** On tablet, the 12-column grid collapses to 6 columns. On mobile, elements stack vertically with a 16px margin.

## Elevation & Depth
Depth is created through **Backdrop Blurs** and **Tonal Layering** rather than traditional heavy shadows.

- **Level 1 (Base):** The #0B1020 background.
- **Level 2 (Cards):** #161B2F with 80% opacity and a 20px Backdrop Blur. 1px solid white (10% alpha) border.
- **Level 3 (Modals/Popovers):** #1C233D with 90% opacity, 40px Backdrop Blur, and a subtle outer glow using the Primary color at 5% opacity.
- **Shadows:** Use "Ambient Shadows"—soft, extremely diffused shadows (Blur: 40px, Spread: -10px, Opacity: 30%) with a slight blue tint (#000000) to ground floating elements.

## Shapes
The shape language is sophisticated and approachable. 
- **Standard Radius:** 8px (0.5rem) for small components like inputs and buttons.
- **Card Radius:** 24px (1.5rem) for main dashboard containers to create a distinct, modern "object" feel.
- **Interactive Elements:** Use full-pill shapes for status indicators (Chips) to distinguish them from actionable buttons.

## Components
- **Buttons:** Primary buttons use a solid #4F46E5 fill. Secondary buttons use a "Ghost" style: 1px border and a subtle hover fill of 10% white.
- **Cards:** The signature component. Must include `backdrop-filter: blur(20px)` and a top-down linear gradient border (White 15% to White 5%).
- **Input Fields:** Darker than the surface color (#0B1020), 1px border, with a 2px Primary Indigo glow on focus.
- **Chips:** Small, pill-shaped markers for "AI Summary" or "Priority Level." Use low-opacity background fills (15%) of the semantic color (Teal/Orange/Red) with high-saturation text.
- **Charts:** Use thin lines (2px) with gradient fills (area charts). Avoid solid blocks of color; favor "glow" effects and transparency.
- **AI Insight Module:** A special card variant with a very subtle animated border-gradient using the Secondary (Teal) and Primary (Indigo) colors to indicate "Active Intelligence."