---
version: alpha
name: Forged Works
description: "An artist-led presentation for Jacques Fuller: cold mineral fields, deep oxide viewing rooms, and one patina-green action signal."
colors:
  primary: "oklch(0.39 0.075 166)"
  page: "oklch(0.9 0.008 165)"
  page-raised: "oklch(0.945 0.006 165)"
  paper: "oklch(0.965 0.006 92)"
  surface: "oklch(0.82 0.012 165)"
  surface-deep: "oklch(0.735 0.017 165)"
  ink: "oklch(0.2 0.02 165)"
  ink-muted: "oklch(0.39 0.018 165)"
  line: "oklch(0.67 0.014 165)"
  accent: "oklch(0.39 0.075 166)"
  accent-strong: "oklch(0.315 0.066 166)"
  accent-ink: "oklch(0.97 0.006 165)"
  oxide: "oklch(0.155 0.018 165)"
  oxide-raised: "oklch(0.205 0.02 165)"
  oxide-ink: "oklch(0.94 0.008 165)"
  oxide-muted: "oklch(0.73 0.018 165)"
  oxide-line: "oklch(0.34 0.024 165)"
  focus: "oklch(0.43 0.085 166)"
  focus-on-dark: "oklch(0.73 0.085 166)"
typography:
  micro:
    fontFamily: '"Fira Sans Condensed", "Arial Narrow", sans-serif'
    fontSize: "0.7rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.055em"
  caption:
    fontFamily: '"Fira Sans Condensed", "Arial Narrow", sans-serif'
    fontSize: "0.76rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.07em"
  label:
    fontFamily: '"Fira Sans Condensed", "Arial Narrow", sans-serif'
    fontSize: "0.8rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.1em"
  nav:
    fontFamily: '"Fira Sans Condensed", "Arial Narrow", sans-serif'
    fontSize: "0.86rem"
    fontWeight: 500
    lineHeight: 1.2
  action:
    fontFamily: '"Fira Sans Condensed", "Arial Narrow", sans-serif'
    fontSize: "0.9rem"
    fontWeight: 600
    lineHeight: 1.2
  body-small:
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  body-fluid-max:
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "1.2rem"
    fontWeight: 400
    lineHeight: 1.52
  lead-max:
    fontFamily: '"Petrona Variable", "Petrona", Georgia, serif'
    fontSize: "1.8rem"
    fontWeight: 410
    lineHeight: 1.3
  site-mark:
    fontFamily: '"Petrona Variable", "Petrona", Georgia, serif'
    fontSize: "2.15rem"
    fontWeight: 600
    lineHeight: 1
  rail-count:
    fontFamily: '"Petrona Variable", "Petrona", Georgia, serif'
    fontSize: "1.85rem"
    fontWeight: 500
    lineHeight: 1
  record-title-max:
    fontFamily: '"Petrona Variable", "Petrona", Georgia, serif'
    fontSize: "3rem"
    fontWeight: 470
    lineHeight: 0.98
  archive-title-max:
    fontFamily: '"Petrona Variable", "Petrona", Georgia, serif'
    fontSize: "2.8rem"
    fontWeight: 470
    lineHeight: 1
  mobile-subheading:
    fontFamily: '"Petrona Variable", "Petrona", Georgia, serif'
    fontSize: "1.4rem"
    fontWeight: 470
    lineHeight: 1
  mobile-hero-min:
    fontFamily: '"Petrona Variable", "Petrona", Georgia, serif'
    fontSize: "3.55rem"
    fontWeight: 520
    lineHeight: 0.88
  mobile-hero-max:
    fontFamily: '"Petrona Variable", "Petrona", Georgia, serif'
    fontSize: "4.6rem"
    fontWeight: 520
    lineHeight: 0.88
  mobile-viewer-min:
    fontFamily: '"Petrona Variable", "Petrona", Georgia, serif'
    fontSize: "3.2rem"
    fontWeight: 490
    lineHeight: 0.94
  mobile-viewer-max:
    fontFamily: '"Petrona Variable", "Petrona", Georgia, serif'
    fontSize: "5rem"
    fontWeight: 490
    lineHeight: 0.94
  card-title-max:
    fontFamily: '"Petrona Variable", "Petrona", Georgia, serif'
    fontSize: "4.2rem"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  biography-max:
    fontFamily: '"Petrona Variable", "Petrona", Georgia, serif'
    fontSize: "3.1rem"
    fontWeight: 430
    lineHeight: 1.14
    letterSpacing: "-0.025em"
  section-max:
    fontFamily: '"Petrona Variable", "Petrona", Georgia, serif'
    fontSize: "6rem"
    fontWeight: 500
    lineHeight: 0.96
    letterSpacing: "-0.035em"
  hero-max:
    fontFamily: '"Petrona Variable", "Petrona", Georgia, serif'
    fontSize: "6rem"
    fontWeight: 520
    lineHeight: 0.88
    letterSpacing: "-0.035em"
rounded:
  sharp: "0px"
spacing:
  hairline: "1px"
  micro: "4px"
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "96px"
  section: "clamp(6rem, 10vw, 10rem)"
components:
  page-shell:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sharp}"
  raised-reading-surface:
    backgroundColor: "{colors.page-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sharp}"
  primary-action:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.sharp}"
    padding: "0.8rem 1rem"
    height: "2.9rem"
  primary-action-hover:
    backgroundColor: "{colors.accent-strong}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.sharp}"
  patina-state:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.sharp}"
  text-link:
    textColor: "{colors.ink}"
    rounded: "{rounded.sharp}"
    height: "2.75rem"
  image-stage:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sharp}"
    padding: "clamp(0.45rem, 1vw, 0.85rem)"
  detail-stage:
    backgroundColor: "{colors.surface-deep}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sharp}"
  muted-copy:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.sharp}"
  divider:
    backgroundColor: "{colors.line}"
    height: "1px"
    width: "100%"
  selected-work:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sharp}"
    padding: "0px"
  living-archive:
    backgroundColor: "{colors.oxide}"
    textColor: "{colors.oxide-ink}"
    rounded: "{rounded.sharp}"
    padding: "{spacing.section}"
  viewer:
    backgroundColor: "{colors.oxide}"
    textColor: "{colors.oxide-ink}"
    rounded: "{rounded.sharp}"
  viewer-stage:
    backgroundColor: "{colors.oxide-raised}"
    textColor: "{colors.oxide-ink}"
    rounded: "{rounded.sharp}"
  oxide-muted-copy:
    backgroundColor: "{colors.oxide}"
    textColor: "{colors.oxide-muted}"
    rounded: "{rounded.sharp}"
  oxide-divider:
    backgroundColor: "{colors.oxide-line}"
    height: "1px"
    width: "100%"
  focus-ring-light:
    backgroundColor: "{colors.focus}"
    size: "3px"
  focus-ring-dark:
    backgroundColor: "{colors.focus-on-dark}"
    size: "3px"
  viewer-paper-record:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sharp}"
    padding: "{spacing.section}"
---

# Design System: Forged Works

## Overview

**Mode: Experience. Creative North Star: “Forged Works.”**

Forged Works is a permanent-feeling, artist-led presentation for Jacques Fuller, a Bloemfontein-based sculptor active since 1989. The object leads: the homepage opens with one cinematic sculpture photograph and a five-image supporting strip, a static four-record gateway opens a scrollable full-screen gallery of 66 works and 404 photographs, and the separate Process route documents one sculpture step by step. It is not a social feed, ecommerce catalogue, or generic portfolio template.

The visual world is cold smoke-grey and mineral on the light side, deep green-black oxide in the Works gallery and viewer, and one restrained patina-green accent. Brass remains material evidence inside the supplied photography, never a UI color. Square geometry, hairline rules, contained sculpture images, and very little motion create a forged, structural viewing experience.

## Colors

Use the exact OKLCH tokens in the front matter. Light mode is the shipped default; `prefers-color-scheme: dark` remaps page, surface, ink, line, and accent tokens to the dark values defined in `src/index.css` while preserving the oxide language.

- **Smoke page / raised page:** `page` and `page-raised` are the cool exhibition ground and quieter reading surface.
- **Mineral stages:** `surface` and `surface-deep` hold image wells behind Facebook-derived JPEGs without competing with the sculpture.
- **Ink and rules:** `ink`, `ink-muted`, and `line` provide text hierarchy and hairline joins.
- **Patina signal:** `accent` is the single action, hover, selection, and focus color; `accent-strong` is its hover state and `focus` is its light focus ring.
- **Oxide chapter:** `oxide`, `oxide-raised`, `oxide-ink`, `oxide-muted`, and `oxide-line` form the dark Works gallery and viewer environment. `focus-on-dark` keeps focus visible there.
- **Paper:** `paper` is reserved for the viewer's minimal factual details.

There is no cobalt, black-and-gold luxury treatment, gold button, or brass UI surface. Natural brass stays in the photography.

## Typography

Petrona Variable is the self-hosted display face for Jacques Fuller, artwork titles, chapter statements, and observations with a serif fallback stack. Fira Sans Condensed is the self-hosted technical face for navigation, references, captions, metadata labels, and controls. Supporting body copy uses the system sans stack from `--font-body`.

The shipped ramp is intentional and must not be normalized to generic defaults:

- **Technical ramp:** micro `0.7rem`, caption `0.76rem`, label `0.8rem`, nav `0.86rem`, action `0.9rem`.
- **Reading ramp:** body-small `clamp(0.98rem, 1.1vw, 1.08rem)`, body-fluid `clamp(1rem, 1.35vw, 1.2rem)`, lead `clamp(1.25rem, 2vw, 1.8rem)`.
- **Display ramp:** card title `clamp(2.2rem, 4vw, 4.2rem)`, biography `clamp(1.75rem, 3vw, 3.1rem)`, section `clamp(3.2rem, 6.6vw, 6rem)`, viewer title `clamp(3.2rem, 6vw, 6rem)`, hero `clamp(4.2rem, 7.2vw, 6rem)`.

Petrona uses negative tracking and tight leading for monograph scale. Technical labels are uppercase, condensed, and tracked. Metadata values stay readable; labels may be small but must never rely on low contrast.

## Layout

The shell is full-width. A deterministic oxide navigation bar sits above the page; on the homepage it overlays the opening composition without inheriting image contrast. The viewport-bound opening uses a landscape hero with a lower-left ivory identity plate containing Jacques Fuller and the primary Works action. Five additional selected works share an aligned, variable-width gallery strip beneath it. Complete-object documentation uses `object-fit: contain`; only the atmospheric hero and supplied detail photographs use intentional crops.

After the introduction, a static four-work gateway leads into the complete selection without repeating it. Its action opens a scrollable full-screen gallery with large lead images, URL/history integration, and return-to-gallery behavior from work details. About follows directly, pairing an expanded biography with a six-milestone career timeline in a 4/8 editorial split.

The artwork viewer opens as a fixed full-screen dialog. Its opening keeps the complete active image, previous/next controls, live count, and all supplied thumbnails in the desktop viewport. A compact paper details chapter follows with known facts only, followed by previous/next work navigation. Image failures keep alternate thumbnails visible and expose a Retry action.

### Spacing and geometry

Use the shared rhythm: `1px` hairline, `4px` micro gap, `8px` small unit, `16px` standard inset, `24px` stage/column gap, `48px` large gap, and `96px` chapter scale. Section padding is `clamp(6rem, 10vw, 10rem)`; selected-work rhythm is `clamp(9rem, 15vw, 15rem)`. All corners are `0px`; no pills, rounded cards, ornamental frames, or permanent shadows.

### Breakpoints

- **720px container:** navigation tightens while retaining a 12px operational floor; the hero, identity plate, and supporting gallery become three stacked rows, with the five supporting photographs arranged in two columns and the narrow full-object image spanning two rows; the gateway becomes a 2×2 tile grid; biography, career timeline, and process stages become one-column flows.
- **1100px viewport:** the Works gallery moves from three image columns to two.
- **720px viewport:** the Works gallery becomes one large-image column, the viewer header uses compact auto-width controls, and thumbnails remain horizontally scrollable.

The base document supports a 320px minimum viewport. Mobile keeps the complete hero title/action inside its ivory cell, uses contained sculpture photography, and avoids horizontal document overflow.

## Elevation & Depth

The system is flat. Depth comes from OKLCH tonal changes, mineral image wells, the paper/oxide transition, hairline borders, and contained photography. There are no shadows.

## Shapes

Every join is square: image stages, work cards, buttons, metadata groups, thumbnail frames, viewer sections, and rules. The visual language is structural rather than soft or ornamental.

## Components

### Navigation
The full-width oxide bar uses Fira Sans Condensed, 44px minimum targets, visible `aria-current` underlines, and a stable owned background over the hero. The three public choices are Works, Process, and About.

### Cinematic homepage composition
One reversible user-selected outdoor photograph forms the hero behind an ivory identity plate. Five further selected photographs sit in one disciplined strip: two supplied detail views crop deliberately, while complete sculptures remain contained. Four matched archive photographs open their complete work records; two supplied standalone references open the complete Works gallery because their record identities are not documented. Mobile separates the identity plate from the hero, keeps its height intrinsic, and reflows the supporting strip into two columns.

### Works gateway and gallery
Four recent records form a static, image-led gateway. The complete selection lives only in the modal Works gallery: 66 square-edged large-image cards with visible titles, three/two/one responsive columns, lazy-loaded 1600px lead images, keyboard focus trap, Escape close, inert background, and history-aware work opening. Search and record metadata stay out of this browsing surface; selecting a work reveals its viewer and factual details.

### Artwork viewer
The viewer is `role="dialog"`, `aria-modal="true"`, fixed, scrollable, and full-screen. It focuses the compact Close control on open, restores the previous focus on close, traps Tab focus, closes on Escape, and maps ArrowLeft/ArrowRight to photograph navigation. Previous/next buttons, labelled thumbnails, live photograph position, explicit `aria-current`, recoverable image errors, and previous/next work controls make the sequence operable without a pointer.

### Metadata record
Facts are rendered as labelled rows. Known material, dimensions, date, image count, and photo credit are shown only when present. Missing factual evidence remains null in data and is omitted from the public interface.

## Motion

Motion is minimal and subordinate to evidence: 180ms ease transitions for links/actions, 220ms viewer entry fade, 260ms active-image reveal, 320ms image readiness, and a restrained 420ms hover scale of roughly 1–2% on image buttons. Smooth scrolling is used only for ordinary navigation and returning to the viewer opening. `prefers-reduced-motion: reduce` disables smooth scrolling and reduces transitions/animations to near-zero.

## Accessibility

Use semantic headings, landmarks, labelled navigation, descriptive/factual image alt text, keyboard-operable buttons and links, visible 3px focus rings with 4px offset, and minimum 44px interactive targets. Keep light and oxide text at accessible contrast; use `focus-on-dark` inside oxide surfaces. The viewer must retain modal semantics, focus management, Escape behavior, arrow-key controls, live position updates, and an inert/aria-hidden background while open. Do not make meaning depend on color, hover, or motion. Respect reduced motion.

## Do's and Don'ts

### Do:
- Preserve complete sculptures with `object-fit: contain`.
- Keep the six-photo selection reversible and explicitly temporary.
- Treat the public Works gallery as 66 works and 404 photographs.
- Keep research provenance in internal data rather than presenting it as public website copy.
- Omit missing facts rather than exposing research-state labels.
- Label existing detail photography honestly and wait for Jacques or his family for stories, dates, provenance, availability, exhibition history, and workshop evidence.
- Keep min 44px targets, strong focus states, modal keyboard behavior, and reduced-motion behavior.

### Don't:
- Add black-and-gold, cobalt, or brass interface styling.
- Round cards, buttons, thumbnails, or metadata into pills.
- Invent material, dimensions, dates, symbolism, provenance, availability, workshop evidence, photographer credits, or artist testimony.
- Present an existing sculpture detail as a workshop photograph.
- Crop a complete sculpture to fill a decorative frame.
- Turn selected works into an alternating row template or permanent ranking.
- Add motion that delays access to the photographs.
