---
name: glassmorphism-design-system
description: Apply an Apple-inspired glassmorphism design system to Next.js projects. Use when building UI components, pages, or layouts that should have frosted glass surfaces, ambient color orbs, oklch color tokens, subtle animations, and iOS-style navigation. Covers cards, inputs, buttons, badges, modals, tabs, sidebars, auth layouts, loading states, error states, and more. Tailwind CSS v4 + Lucide React icons.
---

# Glassmorphism Design System

Use this as a reference when building Next.js projects. It defines the visual language: glassmorphism, color tokens, component patterns, animations, and layout conventions.

**Philosophy:** Apple-inspired, glassmorphism, high contrast. Clean and modern — feels native on macOS/iOS. Frosted glass surfaces, subtle gradients, ambient color orbs in the background, and precise typography. The UI gets out of the way and lets content breathe.

## Tech Stack Assumptions

- Next.js (App Router), React, TypeScript
- Tailwind CSS v4 (postcss plugin, no config file — uses `@import "tailwindcss"`)
- Geist font family (sans + mono) via `next/font/google`
- Lucide React for icons
- oklch color space throughout

---

## 1. Design Tokens (CSS Custom Properties)

Define in `globals.css` inside `:root`:

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --breakpoint-xs: 475px;
}

:root {
  /* Background */
  --background:         oklch(0.984 0.004 256);
  --foreground:         oklch(0.13  0.015 256);

  /* Glass card surface - 78% opaque white */
  --card:               oklch(1 0 0 / 0.78);
  --card-foreground:    oklch(0.13 0.015 256);

  /* Popover - fully opaque */
  --popover:            oklch(1 0 0);
  --popover-foreground: oklch(0.13 0.015 256);

  /* Primary (Apple Blue) */
  --primary:            oklch(0.585 0.22 261);
  --primary-foreground: oklch(0.99 0 0);

  /* Muted surfaces */
  --secondary:          oklch(0.955 0.006 256);
  --muted:              oklch(0.955 0.006 256);
  --muted-fg:           oklch(0.52  0.018 256);

  /* Accent (light blue) */
  --accent:             oklch(0.942 0.018 261);
  --accent-fg:          oklch(0.50  0.22  261);

  /* Borders */
  --border:             oklch(0.905 0.007 256);
  --input:              oklch(0.908 0.007 256);

  /* Sidebar chrome - frosted */
  --sidebar:            oklch(0.980 0.004 256 / 0.72);

  --radius: 0.75rem;
}
```

---

## 2. Body & Background

The body uses three fixed radial-gradient "orbs" for ambient color:

```css
body {
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--background);
  color: var(--foreground);

  /* Three fixed ambient orbs: blue top-center, emerald right, violet bottom-left */
  background-image:
    radial-gradient(ellipse 140% 680px at 55% -80px,  oklch(0.585 0.22 261 / 0.11) 0%, transparent 65%),
    radial-gradient(ellipse 80%  520px at 100% 50%,   oklch(0.72  0.18 155 / 0.07) 0%, transparent 55%),
    radial-gradient(ellipse 65%  480px at 0%   72%,   oklch(0.67  0.20 300 / 0.06) 0%, transparent 55%);
  background-attachment: fixed;
}
```

---

## 3. Glass & Surface Classes

### `.glass-chrome` - Frosted sidebar/top-bar chrome

```css
.glass-chrome {
  background: var(--sidebar);
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
}
```

### `.glass-card` - Translucent card surface (NO blur)

Cards sit over the fixed body gradient, revealing color via transparency. Blur only on the chrome layer.

```css
.glass-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 1px 3px oklch(0 0 0 / 0.05), 0 1px 2px oklch(0 0 0 / 0.03);
}
```

### `.glass-panel` - Lighter card variant

```css
.glass-panel {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 1px 2px oklch(0 0 0 / 0.04);
}
```

### `.text-gradient` - Gradient text (blue-to-violet)

```css
.text-gradient {
  background: linear-gradient(135deg, oklch(0.585 0.22 261) 0%, oklch(0.60 0.22 300) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Rule: **frosted glass only on persistent chrome** (nav, sidebar). **Floating content** (dropdowns, popovers, dialogs) must be **fully opaque**.

---

## 4. Scrollbars

Thin, minimal scrollbars:

```css
::-webkit-scrollbar        { width: 5px; height: 5px; }
::-webkit-scrollbar-track  { background: transparent; }
::-webkit-scrollbar-thumb  { background: oklch(0 0 0 / 0.18); border-radius: 999px; }
::-webkit-scrollbar-thumb:hover { background: oklch(0 0 0 / 0.28); }
```

---

## 5. Animations & Keyframes

```css
@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(3px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.5); opacity: 0.5; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
}

@keyframes gradient-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes card-enter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### Utility classes

```css
.animate-shimmer     { animation: shimmer     1.6s ease-in-out infinite; }
.animate-fade-in     { animation: fade-in     0.20s ease-out both; }
.animate-slide-up    { animation: slide-up    0.25s ease-out both; }
.animate-scale-in    { animation: scale-in    0.18s ease-out both; }
.animate-pulse-dot   { animation: pulse-dot   2s ease-in-out infinite; }
.animate-float       { animation: float       3s ease-in-out infinite; }
.animate-card-enter  { animation: card-enter  0.28s ease-out both; }

.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.10s; }
.stagger-3 { animation-delay: 0.15s; }
.stagger-4 { animation-delay: 0.20s; }
.stagger-5 { animation-delay: 0.25s; }
.stagger-6 { animation-delay: 0.30s; }
```

---

## 6. Typography

- **Font**: Geist Sans — `var(--font-geist-sans)`
- **Mono**: Geist Mono — `var(--font-geist-mono)` for codes, numbers, amounts
- **Smoothing**: `antialiased` everywhere
- **Tracking**: `-0.01em` on nav labels, `tracking-tight` on headings, `tracking-widest` on uppercase labels
- **Sizes**: page titles `text-2xl font-bold`, section titles `text-base font-semibold`, labels `text-xs uppercase tracking-wide`, fine print `text-[10px]` or `text-[11px]`

---

## 7. Color Palette by Semantic Role

Each feature area has a consistent color:

| Role          | Gradient                          | Glow shadow              | Light bg/border for cards         |
| ------------- | --------------------------------- | ------------------------ | --------------------------------- |
| Primary/CTA   | `from-blue-500 to-indigo-600`     | `shadow-blue-500/25`     | `bg-blue-50 border-blue-200`     |
| Secondary     | `from-violet-500 to-purple-600`   | `shadow-violet-500/25`   | `bg-violet-50 border-violet-200` |
| Success       | `from-emerald-400 to-green-600`   | `shadow-emerald-500/25`  | `bg-emerald-50 border-emerald-200` |
| Warning       | `from-amber-400 to-orange-500`    | `shadow-amber-500/25`    | `bg-amber-50 border-amber-200`   |
| Danger        | N/A                               | N/A                      | `bg-red-50 border-red-200`       |
| Accent (pink) | `from-pink-500 to-rose-600`       | `shadow-pink-500/25`     | `bg-rose-50 border-rose-200`     |

---

## 8. Radius & Shadows

```
--radius: 0.75rem  (12px)

xs buttons / tags:  rounded-md or rounded-[6px]
cards / panels:     rounded-xl
modals / sheets:    rounded-2xl (sm+), rounded-t-2xl (mobile bottom sheet)
app icons:          rounded-[8px] (iOS-style)
logo icon:          rounded-xl or rounded-2xl
avatar / badges:    rounded-full
```

Shadows are minimal — soft blurs and borders:

```
cards:     shadow-sm (box-shadow: 0 1px 3px ... + 0 1px 2px ...)
modals:    shadow-2xl
sidebar:   none (border-r instead)
buttons:   shadow-sm
logo icon: shadow-md shadow-blue-500/35, hover: shadow-lg shadow-blue-500/50
badges:    shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]  (inner highlight)
```

---

## 9. Component Patterns

### Page layout

```tsx
<div className="mx-auto max-w-2xl px-4 py-8">
  <h1 className="text-2xl font-bold text-gray-900 mb-6">Page Title</h1>
  {/* content */}
</div>
```

### Card with header

```tsx
<div className="glass-card overflow-hidden">
  {/* Header */}
  <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-4 py-3.5 sm:px-5">
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/35 shrink-0">
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <h2 className="text-base font-semibold tracking-tight text-gray-900">Title</h2>
        <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Subtitle</p>
      </div>
    </div>
  </div>
  {/* Body */}
  <div className="px-4 py-4 sm:px-5 sm:py-5">
    {/* content */}
  </div>
</div>
```

### Section with icon header (inside a card)

```tsx
<div className="flex items-center gap-2.5 border-b border-black/[0.06] px-4 py-3.5 sm:px-5">
  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100">
    <Lightbulb className="h-4 w-4 text-amber-600" />
  </div>
  <div>
    <h3 className="text-sm font-semibold text-gray-900">Section Title</h3>
    <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Description</p>
  </div>
</div>
```

### Section label (small caps divider)

```tsx
<div className="flex items-center gap-2 mb-1">
  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100/80">
    <Globe className="h-3 w-3 text-blue-600" />
  </div>
  <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
    Section Label
  </h3>
</div>
```

### Horizontal divider with label

```tsx
<div className="relative flex items-center gap-3">
  <div className="flex-grow border-t border-black/[0.06]" />
  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Label</span>
  <div className="flex-grow border-t border-black/[0.06]" />
</div>
```

---

## 10. Inputs

### Text input

```tsx
<input
  className="w-full rounded-xl border border-black/[0.08] bg-white/70 px-3.5 py-2.5 h-11 sm:h-9 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
/>
```

### Input with label

```tsx
<div>
  <label className="mb-1.5 block text-xs font-medium text-gray-500 uppercase tracking-wide">
    Label <span className="text-red-400 normal-case">*</span>
  </label>
  <input className="..." />
</div>
```

### Textarea

```tsx
<textarea
  rows={3}
  className="w-full resize-y rounded-xl border border-black/[0.08] bg-white/70 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100 leading-relaxed"
/>
```

### Input with icon prefix

```tsx
<div className="relative">
  <PenLine className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
  <input className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 ..." />
</div>
```

### Select

```tsx
<select className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors">
  <option value="">Select...</option>
</select>
```

---

## 11. Buttons

### Primary (gradient)

```tsx
<button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 h-11 sm:h-9 text-sm font-semibold text-white transition-all hover:from-blue-600 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm shadow-blue-500/25">
  Classify
  <ArrowRight className="h-4 w-4" />
</button>
```

Color variants:
- Blue: `from-blue-500 to-indigo-600` / `shadow-blue-500/25`
- Violet: `from-violet-500 to-purple-600` / `shadow-violet-500/25`
- Rose: `from-rose-500 to-pink-600` / `shadow-rose-500/25`
- AI action: `from-violet-600 to-purple-600` (slightly deeper)

### Secondary / ghost button

```tsx
<button className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
  <X className="h-4 w-4" />
</button>
```

### Small action button

```tsx
<button className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm">
  <RefreshCw className="h-3.5 w-3.5" />
  Reclassify
</button>
```

### Full-width action button

```tsx
<button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">
  <Icon className="h-3.5 w-3.5" />
  Action
</button>
```

### Pill / chip button (toggle)

```tsx
// Active
<button className="rounded-full px-3 py-1 text-xs font-semibold bg-violet-100/80 text-violet-800 ring-1 ring-violet-300/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
  Active
</button>

// Inactive
<button className="rounded-full px-3 py-1 text-xs font-semibold bg-white/70 text-gray-600 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-white hover:text-gray-800 hover:shadow-sm">
  Inactive
</button>
```

---

## 12. Badges

### Confidence / status badge with dot

```tsx
<span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
  High confidence
</span>
```

Colors by level:
- High/success: `bg-emerald-100/80 text-emerald-800 border-emerald-200/60`, dot: `bg-emerald-500`
- Medium/warning: `bg-amber-100/80 text-amber-800 border-amber-200/60`, dot: `bg-amber-500`
- Low/error: `bg-red-100/80 text-red-800 border-red-200/60`, dot: `bg-red-500`

### Small tag badge

```tsx
<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
  <CheckCircle2 className="h-2.5 w-2.5" />
  Validated
</span>
```

### Status indicator (header area)

```tsx
// Ready
<span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white/80 px-2.5 py-1 text-xs font-medium text-gray-600 shadow-xs">
  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
  Ready
</span>

// Warning
<span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
  <AlertTriangle className="h-3 w-3" />
  Setup needed
</span>
```

---

## 13. Modals

### Overlay modal (slide-up on mobile, centered on desktop)

```tsx
<div
  className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm"
  onClick={(e) => e.target === e.currentTarget && onClose()}
>
  <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl flex flex-col max-h-[88vh] animate-slide-up">
    {/* Header */}
    <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 shrink-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-blue-100 text-blue-600">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="flex-1 text-sm font-semibold text-gray-900">Modal Title</h2>
      <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
    {/* Body */}
    <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4">
      {/* content */}
    </div>
  </div>
</div>
```

### Full-screen on mobile, centered on desktop (command palette style)

```tsx
<div
  className="fixed inset-0 z-50 flex flex-col bg-white sm:flex sm:items-center sm:justify-center sm:px-4 sm:bg-black/40 sm:backdrop-blur-sm"
  onClick={(e) => e.target === e.currentTarget && onClose()}
>
  <div className="flex flex-col w-full h-full sm:h-auto sm:max-h-[82vh] sm:max-w-xl sm:rounded-2xl sm:shadow-2xl bg-white sm:overflow-hidden">
    {/* Tab bar / header */}
    {/* Scrollable content */}
  </div>
</div>
```

---

## 14. Tabs

### Pill tab bar (settings style)

```tsx
<div className="flex gap-1 rounded-xl border border-black/[0.07] bg-black/[0.03] p-1">
  <button className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all border ${
    active
      ? 'bg-white shadow-sm text-gray-900 border-black/[0.06]'
      : 'border-transparent text-gray-500 hover:text-gray-700'
  }`}>
    <Icon className="h-4 w-4" />
    Label
  </button>
</div>
```

### Underline tab bar (modal style)

```tsx
<button className={`flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-xs font-semibold transition-all border-b-2 -mb-px ${
  active
    ? 'border-blue-500 text-blue-700 bg-blue-50/50'
    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
}`}>
  <Icon className="h-3.5 w-3.5" />
  Tab Label
</button>
```

---

## 15. Mode Selector (segmented toggle grid)

```tsx
<div className="grid grid-cols-3 gap-2">
  <button className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all duration-150 ${
    active
      ? 'border-blue-200 bg-blue-50 text-blue-700'
      : 'border-black/[0.08] bg-white/70 text-gray-600 hover:bg-white hover:border-black/[0.12]'
  }`}>
    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] transition-all ${
      active ? 'bg-blue-500 text-white' : 'bg-black/[0.05] text-gray-400'
    }`}>
      <Icon className="h-3.5 w-3.5" />
    </div>
    <div>
      <div className="text-sm font-semibold leading-tight">Label</div>
      <div className="hidden sm:block text-xs opacity-60 mt-0.5">Description</div>
    </div>
  </button>
</div>
```

---

## 16. Action Button Grid (insight actions)

```tsx
<div className="grid grid-cols-3 gap-2">
  <button className="flex flex-col items-center gap-1.5 rounded-xl border border-amber-200/70 bg-amber-50/60 px-3 py-3 text-center transition-all hover:bg-amber-100/70 hover:shadow-sm active:scale-[0.98]">
    <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-amber-100 text-amber-600">
      <Lightbulb className="h-4 w-4" />
    </div>
    <span className="text-xs font-semibold text-amber-900 leading-tight">Reasoning</span>
  </button>
  {/* more action buttons with different colors */}
</div>
```

---

## 17. Info / Warning Callouts

### Info callout

```tsx
<div className="flex items-start gap-2.5 rounded-xl bg-violet-50 border border-violet-100 px-3.5 py-2.5">
  <Sparkles className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
  <p className="text-xs text-violet-700 leading-relaxed">
    Helpful message here.
  </p>
</div>
```

### Warning callout

```tsx
<div className="flex items-start gap-2 rounded-xl border border-amber-200/60 bg-amber-50/60 px-3 py-2">
  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
  <p className="text-xs text-amber-700 leading-relaxed">Warning text.</p>
</div>
```

### Disclaimer / footer note

```tsx
<div className="flex items-start gap-2 rounded-xl border border-gray-200/60 bg-white/40 px-3 py-2.5">
  <Info className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
  <div className="text-[11px] text-gray-400 leading-relaxed">
    <span className="font-semibold">Note</span> - explanation text.
  </div>
</div>
```

### Feature info cards (colored)

```tsx
{/* Blue info card */}
<div className="rounded-xl border border-blue-200/60 bg-blue-50/40 p-4">
  <div className="flex items-start gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
      <Database className="h-4 w-4 text-blue-600" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-semibold text-blue-900 mb-1">Title</h3>
      <p className="text-xs text-blue-700/80 leading-relaxed">Description text.</p>
    </div>
  </div>
</div>
```

---

## 18. Error State

```tsx
<div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
  <div className="flex items-start gap-3.5">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
      <AlertCircle className="h-4.5 w-4.5 text-red-600" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-bold text-red-900">Something went wrong</h3>
      <p className="mt-1 text-sm leading-relaxed text-red-700">Error message.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3.5 py-1.5 text-xs font-semibold text-red-800 transition-colors hover:bg-red-200">
          <RotateCcw className="h-3 w-3" />
          Try again
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-red-200 px-3.5 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50">
          <PenLine className="h-3 w-3" />
          Alternative action
        </button>
      </div>
    </div>
  </div>
</div>
```

---

## 19. Loading State

- Progress bar: `bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500`
- Floating orb with pings + `animate-float`
- Rotating step messages with `animate-fade-in` on key change
- Bouncing dots: `animate-pulse-dot` with stagger classes

```tsx
<div className="glass-card overflow-hidden">
  {/* Progress bar */}
  <div className="h-1.5 bg-gray-100">
    <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
  </div>
  <div className="flex flex-col items-center gap-5 px-6 py-10">
    {/* Orb with pings */}
    <div className="relative h-16 w-16 shrink-0">
      <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/20" style={{ animationDuration: '2s' }} />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 animate-float">
        <Sparkles className="h-7 w-7 text-white" />
      </div>
    </div>
    {/* Step text */}
    <p key={msgKey} className="text-sm font-semibold text-gray-800 animate-fade-in">
      {steps[stepIdx]}
    </p>
    {/* Dots */}
    <div className="flex gap-1.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse-dot stagger-${i}`} />
      ))}
    </div>
  </div>
</div>
```

---

## 20. Sidebar Layout

- Desktop: fixed `w-56` sidebar with `glass-chrome`
- Mobile: slide-out drawer + overlay `bg-black/20 backdrop-blur-sm`
- Top bar on mobile: `glass-chrome` with hamburger, logo, search
- Content: `lg:pl-56`, `pt-14 lg:pt-6`

### Nav item pattern

```tsx
<Link className={`group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-all duration-150 tracking-[-0.01em] ${
  active
    ? 'bg-white/80 shadow-sm border border-white/70 font-semibold text-gray-900'
    : 'text-gray-500 hover:bg-black/[0.04] hover:text-gray-800'
}`}>
  {/* iOS-style colored icon box */}
  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] transition-all duration-150 ${
    active
      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm shadow-blue-500/25 text-white'
      : 'bg-black/[0.04] text-gray-400 group-hover:bg-black/[0.07] group-hover:text-gray-600'
  }`}>
    <Icon className="h-3.5 w-3.5" />
  </div>
  <span className="flex-1">Label</span>
  {active && <div className="h-1.5 w-1.5 rounded-full bg-current opacity-40" />}
</Link>
```

### Sidebar search bar

```tsx
<button className="flex w-full items-center gap-2.5 rounded-xl border border-black/[0.08] bg-black/[0.03] px-3 py-2 text-left transition-all hover:bg-black/[0.06] hover:border-black/[0.12]">
  <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
  <span className="flex-1 text-xs text-gray-400">Search...</span>
  <kbd className="hidden rounded border border-black/[0.08] bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold text-gray-300 lg:inline">Cmd+K</kbd>
</button>
```

---

## 21. Auth / Login Layout

Centered card with decorative blobs and floating shapes:

```tsx
<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 px-4 py-12">
  {/* Decorative blobs */}
  <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-blue-400/12 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />
  {/* Floating shapes */}
  <div className="pointer-events-none absolute top-[15%] left-[12%] h-6 w-6 rotate-45 rounded-sm border-2 border-blue-300/20 animate-float" />

  {/* Logo */}
  <div className="mb-6 flex items-center gap-2.5 animate-fade-in">
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
      <Package className="h-5 w-5 text-white" />
    </div>
    <span className="text-base font-bold text-gray-900 tracking-tight">App Name</span>
  </div>

  {/* Card */}
  <div className="w-full max-w-md animate-slide-up">
    <div className="rounded-2xl border border-gray-100 bg-white/95 px-8 py-10 sm:px-10 shadow-xl shadow-blue-900/5 backdrop-blur-sm">
      <div className="mb-6 text-center">
        {/* Decorative icon */}
        <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-xl" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
            <Mail className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gradient">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-500">Subtitle text</p>
      </div>
      {/* Form content */}
    </div>
  </div>
</div>
```

---

## 22. Data Table

```tsx
<div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-medium text-gray-500 uppercase tracking-wide">
        <th className="text-left px-4 py-2.5">Column</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-gray-50 last:border-0">
        <td className="px-4 py-2.5 font-medium text-gray-800">Cell</td>
      </tr>
      {/* Alternating rows */}
      <tr className="border-b border-gray-50 last:border-0 bg-gray-50/30">
        <td className="px-4 py-2.5 text-gray-500">Cell</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 23. Dropdown / Combobox

```tsx
{/* Dropdown list */}
<div className="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white py-1 shadow-xl max-h-48 overflow-y-auto">
  <button className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-left text-gray-700 hover:bg-blue-50 transition-colors">
    <span className="flex-1 truncate">Item label</span>
    <span className="font-mono text-gray-400">Code</span>
  </button>
</div>
```

---

## 24. Drag & Drop Zone

```tsx
<div className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer transition-all ${
  isDragOver
    ? 'border-rose-400 bg-rose-50'
    : hasFile
      ? 'border-rose-200 bg-rose-50/40'
      : 'border-black/[0.10] bg-white/50 hover:bg-white hover:border-black/[0.16]'
}`}>
  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
    <Upload className="h-5 w-5 text-rose-500" />
  </div>
  <p className="text-sm font-medium text-gray-700">Drop an image, click to browse</p>
  <p className="text-xs text-gray-400 mt-0.5">or paste with <kbd className="rounded border border-gray-200 px-1 py-0.5 text-[10px] font-mono bg-white">Cmd+V</kbd></p>
</div>
```

---

## 25. Skeleton / Loading Placeholder

```tsx
<div className="space-y-4 animate-pulse">
  {[1, 2, 3].map((i) => (
    <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="h-4 w-40 bg-gray-200 rounded mb-3" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-3/4 bg-gray-100 rounded" />
      </div>
    </div>
  ))}
</div>
```

---

## 26. Empty State

```tsx
<div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
  <Icon className="h-8 w-8 text-gray-300" />
  <p className="text-sm text-gray-400">No items yet</p>
</div>
```

---

## 27. Touch Targets (Mobile)

All interactive elements are 44px minimum on mobile:

| Component       | Mobile  | Desktop (`sm:`) |
|----------------|---------|-----------------|
| Input          | `h-11`  | `h-9`           |
| Button default | `h-11`  | `h-9`           |
| Select trigger | `h-11`  | `h-9`           |

---

## Quick Reference: Common Patterns

| Pattern                | Key classes                                                         |
| ---------------------- | ------------------------------------------------------------------- |
| Border (subtle)        | `border-black/[0.06]` or `border-black/[0.08]`                     |
| Background (subtle)    | `bg-black/[0.03]` or `bg-black/[0.04]`                             |
| Hover bg               | `hover:bg-black/[0.04]` or `hover:bg-black/[0.05]`                 |
| Icon box (small)       | `h-7 w-7 rounded-[8px]` or `h-8 w-8 rounded-xl`                   |
| Border radius          | `rounded-xl` (cards, inputs, buttons) or `rounded-full` (badges)   |
| Text sizes             | `text-sm` body, `text-xs` meta, `text-[11px]` labels, `text-[10px]` fine print |
| Font mono              | `font-mono tabular-nums` for codes/numbers                         |
| Transition             | `transition-all` or `transition-colors`                             |
| Active press           | `active:scale-[0.98]`                                              |
| Focus ring             | `focus:ring-2 focus:ring-blue-100 focus:border-blue-400`           |
| Inner highlight        | `shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]`                    |
| Group hover reveal     | Parent: `group`, child: `opacity-0 group-hover:opacity-100`       |
| Backdrop for overlays  | `bg-black/40 backdrop-blur-sm` or `bg-black/20 backdrop-blur-sm`   |
