# Design System — Redline Index

## Theme

Premium dark automotive platform. Near-black canvas, warm off-white ink, single red signal accent. No light mode.

## Dials

- DESIGN_VARIANCE: 7
- MOTION_INTENSITY: 5
- VISUAL_DENSITY: 4

## Color

| Token | Value | Role |
| --- | --- | --- |
| `--background` | `#08090a` | Page canvas |
| `--surface` | `#0c0d0f` | Recessed panels |
| `--surface-raised` | `#121416` | Raised panels |
| `--foreground` | `#f5f2eb` | Primary text |
| `--muted` | `#9a9c9a` | Secondary text (≥4.5:1 on bg) |
| `--line` | `#2a2c2e` | Borders / rules |
| `--signal` | `#ef3d2f` | Brand accent / focus |
| `--signal-hover` | `#ff5a4a` | Accent hover |

Use tokens via CSS variables / Tailwind theme. Avoid raw hex in components except where already mapped.

**Gradient policy:** Prefer solid tones and hairlines. Image scrims may use a single soft vertical fade for legibility. No decorative mesh, multi-stop brand gradients, or radial glow stacks.

## Typography

- **Sans:** Manrope (UI + display)
- **Mono:** DM Mono (eyebrows, labels, meta)

Display tracking floor: `-0.04em`. Body line-height slightly loose on dark (≥1.55). Headings use `text-wrap: balance`.

## Spacing & layout

- Page max width: `80rem` (7xl)
- Horizontal padding: `px-5 sm:px-8 lg:px-10`
- Section rhythm: `py-16` → `py-24` on large screens
- Prefer asymmetric hero (type + full-bleed image) over equal card grids in marketing moments

## Motion

Library: Motion for React only.

Allowed: page/section fade-up, hover lift/opacity, card image scale, staggered lists, light loading pulses.

Easing: exponential ease-out. Durations 200–500ms. Always provide `prefers-reduced-motion` fallback (opacity only / instant).

## Components

- Brand mark, site header/footer
- Page header, section heading, breadcrumbs
- Search form, vehicle card, empty state, specification group
- Reveal / Stagger wrappers for motion

## Do / Don't

**Do:** Full-bleed vehicle photography, mono eyebrows in signal red, hairline index lists, sticky record context on detail.

**Don't:** Card spam in heroes, gradient meshes, bounce/elastic easing, GSAP, new UI kits, architecture rewrites.
