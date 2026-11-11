---
name: Kaizen OS
description: Small steps. No guilt. Just show up.
colors:
  accent: "#2563eb"
  accent-fg: "#ffffff"
  danger: "#b42318"
  bg: "#f6f7f9"
  fg: "#0f1115"
  card: "#ffffff"
  border: "#dfe3e8"
  muted: "#5f6875"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "0em"
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.5
  stat:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "0.025em"
  timer:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.2
    fontFeature: "tnum"
rounded:
  sm: "0.5rem"
  lg: "0.75rem"
  card: "0.75rem"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  card: "1.25rem"
  page: "1rem"
components:
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.fg}"
    rounded: "{rounded.card}"
    padding: "1.25rem"
  button-primary:
    backgroundColor: "{colors.fg}"
    textColor: "{colors.bg}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.fg}"
    textColor: "{colors.bg}"
    rounded: "{rounded.sm}"
  button-ghost:
    backgroundColor: "{colors.card}"
    textColor: "{colors.fg}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.375rem 0.75rem"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.75rem"
  nav-link:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.75rem"
  nav-link-active:
    backgroundColor: "{colors.card}"
    textColor: "{colors.fg}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
  stat-tile:
    backgroundColor: "{colors.card}"
    textColor: "{colors.fg}"
    rounded: "{rounded.lg}"
    padding: "0.75rem"
---

# Design System: Kaizen OS

## Overview

**Creative North Star: "The Quiet Desk"**

A cleared wooden desk with one thing on it. The interface is warm off-white paper, thin grey rules, and a single blue mark where the next action lives. Nothing else competes for attention. The system is quiet on purpose: a person arrives on a hard day, and the screen must not add weight.

This is an Operate surface. Familiar patterns win over expression. Cards stack in one narrow column, each one holding a single step. The color count is small, the type scale is short, and the spacing does the separating work that borders and boxes would otherwise do loudly.

Precision shows as restraint. Every control has the same 8px radius, the same border tone, and the same focus ring. The interface is monochrome: ink fills primary actions and marks the current position. Signal Blue appears only on the focus ring and the input focus border. Surfaces are flat: a hairline border separates a card, and no shadow is used.

**Key Characteristics:**
- One column, 672px max, generous vertical rhythm.
- Cool grey background in light mode, near-black in dark mode.
- An ink action color; Signal Blue is reserved for focus.
- Small uppercase labels carry section meaning; headings stay at 24px or below.
- Borders define structure; no shadows are used.
- Monospace only for numbers that tick and keys that get copied.
- Every screen offers one clear next action and no count that shames.

## Colors

A cool grey neutral base with an ink action color and one blue focus signal.

### Primary
- **Ink Action** (`#0f1115` light / `#eceef2` dark): Fills primary buttons and marks the active nav item. Text on it uses the page background color.
- **Signal Blue** (`#2563eb`): Focus only. It colors the focus ring and the input focus border. It never fills a button or a surface.

### Neutral
- **Cool Paper** (`#f6f7f9`): Page canvas in light mode. It is neutral, not warm.
- **Ink** (`#0f1115`): Default text and headings.
- **Card White** (`#ffffff`): Card and popover surface, one step above the canvas.
- **Hairline** (`#dfe3e8`): Every border, divider, and empty progress track.
- **Quiet Grey** (`#5f6875`): Labels, hints, secondary text, inactive nav.

### Danger
- **Ember** (`#b42318`): Error text only. It reads as a caution, not an alarm.

### Dark Theme
The palette mirrors into a near-black room. `--bg` `#0b0d10`, `--fg` `#eceef2`, `--card` `#131619`, `--border` `#242a31`, `--accent` `#6d9bff`, `--accent-fg` `#0b0d10`, `--muted` `#9aa3af`, `--danger` `#ff6b5e`. The blue lifts to stay legible. Theme follows the operating system and never needs a manual switch.

### Named Rules
**The Focus Blue Rule.** Signal Blue marks focus only. Never a button fill, a category tag, or a chart series.

**The Quiet Surface Rule.** Neutral surfaces separate by tone and hairline, not by saturation. No tinted panels, no colored headers.

## Typography

**Display Font:** Geist Sans (with system-ui fallback)
**Body Font:** Geist Sans (with system-ui fallback)
**Label/Mono Font:** Geist Mono (with ui-monospace fallback)

**Character:** One neutral grotesque carries the whole product, so the voice comes from weight and case, not from a second family. Geist Mono appears only where digits must not jitter or where a key must be copied exactly.

### Hierarchy
- **Display** (600, 24px / 1.33): Screen titles. One per screen, always the same size. Today shows a 12px uppercase date label directly above it.
- **Title** (500, 18px / 1.5): The chosen highlight task. The single largest piece of content on Today.
- **Stat** (600, 20px / 1.4): Week numbers. Paired with a label above and a muted hint below.
- **Body** (400, 14px / 1.43): All interface text, buttons, inputs, and task rows. 14px is the floor for interactive text.
- **Label** (500, 12px, 0.025em, uppercase): Card section headings ("Sprint", "2 · Today's highlight", "Energy"). Always Quiet Grey. Never a heading tag.
- **Timer** (400, 30px, tabular numerals): The sprint clock. Geist Mono keeps the digits from shifting each second.

### Named Rules
**The Small Label Rule.** A card opens with a 12px uppercase muted label, not an 18px heading. Meaning comes from case and color, so the eye is not pulled into hierarchy.

**The Two-Size Rule.** A screen has one title size (24px) and one body size (14px). Intermediate sizes exist only for the highlight task (18px) and stat values (20px).

**The Tabular Rule.** Any number that changes over time uses `tabular-nums`. Any key or token the user copies uses Geist Mono.

## Layout

A single column, centered, capped at 672px (`max-w-2xl`), with 16px side padding, 24px top padding, and 96px bottom padding so the last card clears the phone's home indicator. A top nav row sits above the content with 24px between it and the first card.

Cards stack in a 16px vertical rhythm. Inside a card, 20px padding, with 8px to 16px between a label and its content. Multi-column grids appear only on Week: two columns on mobile, three at the `sm` breakpoint (640px). Forms with two fields sit in one column on mobile and split into two at `sm`.

Density is deliberately low. One idea per card. When a second element would double the reading load, it moves to its own card or hides behind Overwhelm mode.

## Elevation & Depth

Flat. Structure comes from a hairline border plus a one-step surface change (Cool Paper to Card White). Cards have no shadow.

### Shadow Vocabulary
- **Popup lift** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): The `?` hint popover only.

### Named Rules
**The Border-First Rule.** If a boundary is needed, add a hairline border. Do not add a shadow to a card.

**The No-Float Rule.** Controls never lift on hover. Hover changes border color or opacity, never position or elevation.

## Shapes

One radius family, applied by container size: 8px for every interactive control (buttons, inputs, nav items, task rows), 12px for cards and small tiles, and a full circle for the `?` hint dot. Nothing is square and nothing is pill-shaped.

Borders are 1px Hairline. No double borders, no insets, no clipping masks. Progress bars are 8px tall with a fully rounded track and an ink fill.

## Components

### Buttons
- **Shape:** Gently rounded (8px radius).
- **Primary:** Solid Ink with page-background text, 14px medium, 8px by 16px padding. One per card at most.
- **Hover / Focus:** Hover drops to 90% opacity. Focus shows a 2px Signal Blue outline with a 2px offset. Disabled drops to 40% opacity. Nothing moves.
- **Ghost:** Card White background with a Hairline border, 6px by 12px padding, Ink text. On hover the border darkens to 40% Ink. This is the default for secondary and toggle-like actions.
- **Text link:** Ink, underlined. Used only for the Retry action inside an error message.

### Chips
- **Hint dot (`?`):** A 24px circle with a Hairline border and a 12px Quiet Grey mark. The hit area is 44px. Hover darkens the border and mark. It sits inline after the label it explains. Escape and an outside click close it.
- **Energy and focus rating:** No chip component exists. These are Ghost buttons, and the selected one switches to Primary. Reuse that pattern instead of introducing a chip.

### Cards / Containers
- **Corner Style:** Gently rounded (12px radius).
- **Background:** Card White on Cool Paper.
- **Shadow Strategy:** None. A 1px Hairline is the only boundary. See Elevation.
- **Border:** 1px Hairline.
- **Internal Padding:** 20px.
- **Structure:** A 12px uppercase muted label, then content. Never a heading tag as the first child.

### Inputs / Fields
- **Style:** Cool Paper fill, 1px Hairline border, 8px radius, 14px text, 8px by 12px padding. Full width by default.
- **Focus:** Border turns Signal Blue plus a 2px Signal Blue outline. No glow, no shadow change.
- **Error / Disabled:** There is no inline field error state. Errors render below the form as a 14px Ember paragraph with `role="alert"`. Disabled fields use 40% opacity.
- **Placeholders:** Short, calm instructions ("Empty your head. No order needed."), never a label substitute — a 12px uppercase label sits above.

### Navigation
A single horizontal row that wraps on narrow screens. Links are 14px, 8px by 12px padding, 8px radius. The active link gets a 6% Ink wash, Ink medium text, and `aria-current="page"`; idle links are Quiet Grey and turn Ink on hover. Sign out sits at the far right, same shape, Quiet Grey, no border.

### Stat Tile
Week's signature component. A 12px radius bordered tile, 12px padding, with a 12px uppercase muted label (plus optional `?` dot), a 20px semibold value, and an optional 12px muted hint line. Tiles sit two-up on mobile and three-up at `sm`. The value always shows real work, never a target.

### Task Row
A full-width Ghost button used for task selection: 8px radius, Hairline border, 14px left-aligned text, an optional 12px uppercase muted bucket tag before the title. Hover darkens the border. Selecting it sets the day's highlight and removes the list.

## Do's and Don'ts

### Do:
- **Do** use the `card`, `input`, `btn`, `btnGhost`, and `label` constants from `components/ui.tsx`. They are the system.
- **Do** open every card with a 12px uppercase Quiet Grey label.
- **Do** use Ink for action and active state. Use Signal Blue only for focus. One primary button per card.
- **Do** pair every number with a plain-language hint in 12px Quiet Grey, so the user does not have to interpret the metric.
- **Do** keep error text at 14px Ember with `role="alert"`, and offer Retry.
- **Do** show a skeleton that matches the real layout while data loads, with `aria-busy` and `motion-reduce` respected.
- **Do** keep the bottom padding at 96px so the final card is reachable on a phone.

### Don't:
- **Don't** add a second accent color, a gradient, or a colored section background.
- **Don't** lift, scale, or translate controls on hover.
- **Don't** use red for missed days, streaks, counters, or urgency. Ember is for errors only.
- **Don't** turn a label into a heading to add emphasis. Size and case carry the hierarchy.
- **Don't** introduce a modal, drawer, or toast pattern. Feedback stays inline in the card that caused it.
- **Don't** add a chip, badge, or tag component. Use Ghost buttons and uppercase bucket tags.
- **Don't** set interactive text below 14px or hint text below 12px.
- **Don't** add a manual theme toggle. Follow the operating system.
