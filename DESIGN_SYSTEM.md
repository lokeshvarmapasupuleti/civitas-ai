# Civitas AI Design System

Unified styling guidelines for the premium Civitas AI Governance Platform.

---

## 🎨 Color Palette

| Name | Hex Value | Tailwind Class | Application |
| :--- | :--- | :--- | :--- |
| **Primary/Accent** | `#4F46E5` | `indigo-600` | Navigation highlights, interactive controls, primary buttons |
| **Success** | `#10B981` | `emerald-650` | Resolution counts, success indicators, completed actions |
| **Warning** | `#F59E0B` | `amber-550` | Pending moderation states, concerned user sentiments |
| **Danger** | `#EF4444` | `red-600` | Critical anomalies, emergency triggers, rejection alerts |
| **Background** | `#F8FAFC` | `bg-slate-50` | Shell workspace backgrounds |
| **Cards** | `#FFFFFF` | `bg-white` | Information cards, analytics grids |
| **Borders** | `#E2E8F0` | `border-slate-200` | Accent outline borders |

---

## 📐 Spacing & Layouts
- **Padding:** Content margins should maintain `p-6` (`1.5rem`) on cards and `p-8` (`2rem`) on full page shells.
- **Radius:** Standard borders must adhere to a `16px` (`rounded-2xl`) border-radius.
- **Section Margins:** Grouped items spacing of `space-y-6` or `gap-6`.

---

## ✍️ Typography & Scale
- **Base font:** `sans-serif` (Inter, Outfit, or standard sans fallback).
- **Page Titles:** `text-3xl font-extrabold text-slate-800 tracking-tight`.
- **Card Subheadings:** `text-sm font-bold text-slate-800`.
- **Telemetry Tags:** `text-[10px] font-extrabold uppercase tracking-wider`.

---

## ✨ Animation Rules
- **Framework:** All UI animations are handled via **Framer Motion**.
- **Exit Transitions:** Animate Presence fade-in/fade-out routines only.
- **Skins:** Transition duration set to `0.3s` with a stable `easeOut` curve.

---

## 📋 Form & Component Standards
- **Inputs:** Base styles configured as `bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-indigo-500 focus:border-indigo-500`.
- **Buttons:**
  - *Primary:* `bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10`.
  - *Secondary:* `border border-slate-200 hover:bg-slate-50 text-slate-500`.
- **Cards:** White container outline, `rounded-2xl`, very soft enterprise shadows.

---

## ♿ Accessibility Guidelines
- **Contrast:** Ensure all secondary headers use high-contrast slate text colors (`text-slate-450` minimum).
- **Keyboard navigation:** Action inputs map correctly to standard browser active state focus selectors.
