---
version: alpha
name: Forged Archive
description: "A sculpture-led living archive for Jacques Fuller: cold mineral fields, deep oxide reading rooms, and one patina-green action signal."
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

# Design System: Forged Archive

## Overview

**Mode: Experience. Creative North Star: “The Forged Archive.”**

Forged Archive is a permanent-feeling but explicitly unfinished sculpture archive for Jacques Fuller, a Bloemfontein-based sculptor active since 1989. The object leads: the interface is a narrow archive index, a viewport-bound hero, a temporary six-work selection, and a complete working catalogue of 34 records and 232 photographs. A separately dated 61-record historical layer documents the 2001 exhibition without merging historical and current objects by title. It is not a social feed, ecommerce catalogue, or generic portfolio template.

The visual world is cold smoke-grey and mineral on the light side, deep green-black oxide in archive and viewer chapters, and one restrained patina-green accent. Brass remains material evidence inside the supplied photography, never a UI color. Square geometry, hairline rules, contained sculpture images, and very little motion create a forged, structural reading experience.

## Colors

Use the exact OKLCH tokens in the front matter. Light mode is the shipped default; `prefers-color-scheme: dark` remaps page, surface, ink, line, and accent tokens to the dark values defined in `src/index.css` while preserving the oxide language.

- **Smoke page / raised page:** `page` and `page-raised` are the cool exhibition ground and quieter reading surface.
- **Mineral stages:** `surface` and `surface-deep` hold image wells behind Facebook-derived JPEGs without competing with the sculpture.
- **Ink and rules:** `ink`, `ink-muted`, and `line` provide text hierarchy and hairline joins.
- **Patina signal:** `accent` is the single action, hover, selection, and focus color; `accent-strong` is its hover state and `focus` is its light focus ring.
- **Oxide chapter:** `oxide`, `oxide-raised`, `oxide-ink`, `oxide-muted`, and `oxide-line` form the dark living-archive and viewer environment. `focus-on-dark` keeps focus visible there.
- **Paper:** `paper` is reserved for the viewer's narrative/catalogue record chapter.

There is no cobalt, black-and-gold luxury treatment, gold button, or brass UI surface. Natural brass stays in the photography.

## Typography

Petrona Variable is the self-hosted display face for Jacques Fuller, artwork titles, chapter statements, observations, and catalogue prose with a serif fallback stack. Fira Sans Condensed is the self-hosted technical face for navigation, archive codes, captions, metadata labels, controls, and state. Supporting body copy uses the system sans stack from `--font-body`.

The shipped ramp is intentional and must not be normalized to generic defaults:

- **Technical ramp:** micro `0.7rem`, caption `0.76rem`, label `0.8rem`, nav `0.86rem`, action `0.9rem`.
- **Reading ramp:** body-small `clamp(0.98rem, 1.1vw, 1.08rem)`, body-fluid `clamp(1rem, 1.35vw, 1.2rem)`, lead `clamp(1.25rem, 2vw, 1.8rem)`.
- **Display ramp:** card title `clamp(2.2rem, 4vw, 4.2rem)`, biography `clamp(1.75rem, 3vw, 3.1rem)`, section `clamp(3.2rem, 6.6vw, 6rem)`, viewer title `clamp(3.2rem, 6vw, 6rem)`, hero `clamp(4.2rem, 7.2vw, 6rem)`.

Petrona uses negative tracking and tight leading for monograph scale. Technical labels are uppercase, condensed, and tracked. Metadata values stay readable; labels may be small but must never rely on low contrast.

## Layout

The desktop shell is a fixed, narrow archive rail (`clamp(8.5rem, 10.5vw, 10.5rem)`) beside the main content. The rail is sticky and contains the JF mark, primary links, live counts, and Bloemfontein descriptor. The hero is viewport-bound (`100dvh`, capped at `68rem`) on a twelve-column grid: Jacques Fuller occupies the left, the supplied Ship of Fools photograph sits in a central object stage, and its record/action occupies the right. Sculpture images use `object-fit: contain`; full silhouettes are never decoratively cropped.

The six selected works are reversible curation, not a ranking. They use three composition families, cycling by rank: **platform** (large left image, right record, lower detail), **offset** (right image with offset detail and lower record), and **study** (image/detail pair with a spanning record). They are deliberately not alternating selected rows or equal cards. Archive 2001 is an editorial historical chapter: one paper statement and dated quotation, a typographic theme ledger, and two asymmetric relationship studies that distinguish “same object” from “different work, same title.” No catalogue photography ships without rights clearance. About follows with the 2001 biography and timeline before the complete current index.

The artwork viewer opens as a fixed full-screen dialog. Its opening is a 12-column, **75/25** composition: the identity/facts rail occupies columns 1–3 and the image stage occupies columns 4–12. The stage and previous/next controls remain in the opening viewport; all supplied thumbnails follow in a horizontal strip. A paper record chapter holds the visual catalogue note and future story, followed by details/alternate views and previous/next work navigation.

### Spacing and geometry

Use the shared rhythm: `1px` hairline, `4px` micro gap, `8px` small unit, `16px` standard inset, `24px` stage/column gap, `48px` large gap, and `96px` chapter scale. Section padding is `clamp(6rem, 10vw, 10rem)`; selected-work rhythm is `clamp(9rem, 15vw, 15rem)`. All corners are `0px`; no pills, rounded cards, ornamental frames, or permanent shadows.

### Breakpoints

- **1100px:** rail becomes `8rem`; hero columns rebalance; archive becomes three columns.
- **800px:** rail becomes a 4rem sticky top bar; hero becomes a stacked mobile composition; selected-work families collapse to image, record, detail; living archive, artist, viewer record, and sequence become one-column flows; archive becomes two columns.
- **430px:** navigation tightens; hero record/action and summary stack; hero counts and archive become one column; archive cards become one column.

The base document supports a 320px minimum viewport. Mobile hero art is `min(39svh, 29rem)`; selected image stages are `min(68svh, 40rem)`; viewer stage is `min(76svh, 46rem)` so the work remains the primary object at small sizes.

## Elevation & Depth

The system is flat. Depth comes from OKLCH tonal changes, mineral image wells, the paper/oxide transition, hairline borders, and contained photography. There are no shadows.

## Shapes

Every join is square: image stages, archive cards, buttons, metadata groups, thumbnail frames, viewer sections, and rules. The visual language is structural rather than soft or ornamental.

## Components

### Archive rail and navigation
A sticky desktop index becomes a 4rem mobile top bar. Navigation uses Fira Sans Condensed and maintains 44px minimum links. The skip link appears on focus and jumps to selected works.

### Viewport-bound hero
A 12-column hero introduces Jacques Fuller and Ship of Fools at object scale. The lead artwork is high-priority, contained photography; the record exposes only supplied facts and a direct “Open record” action. Mobile reorders title, artwork, record, and counts without losing the object-led sequence.

### Selected work
Each selected item is an `<article>` with a button image stage, selection number, title, known catalogue line, factual visual observation, detail study, and “Open record” text action. Platform, offset, and study are composition families, not data states; all six remain reversible.

### Complete archive card
A borderless, square-edged button contains a 4:5 contained thumbnail, archive number, title, and view count. It is subordinate to the selected sequence and never becomes a rounded card wall.

### Living archive chapter
The oxide chapter exposes future paths named Voice, Studio, and Record. Existing detail studies are explicitly captioned as existing photographic detail. No absent workshop evidence is implied or substituted.

### Artwork viewer
The viewer is `role="dialog"`, `aria-modal="true"`, fixed, scrollable, and full-screen. It focuses Close record on open, restores the previous focus on close, traps Tab focus, closes on Escape, and maps ArrowLeft/ArrowRight to photograph navigation. Previous/next buttons, labelled thumbnails, live photograph position, explicit `aria-current`, and previous/next work controls make the sequence operable without a pointer.

### Metadata record
Facts are rendered as labelled rows. Known material, dimensions, date, and status are shown only when present in the source record; otherwise the exact visible value is **“Not recorded.”** Catalogue notes and future stories are separated from factual fields.

## Motion

Motion is minimal and subordinate to evidence: 180ms ease transitions for links/actions, 220ms viewer entry fade, 260ms active-image reveal, 320ms image readiness, and a restrained 420ms hover scale of roughly 1–2% on image buttons. Smooth scrolling is used only for ordinary navigation and returning to the viewer opening. `prefers-reduced-motion: reduce` disables smooth scrolling and reduces transitions/animations to near-zero.

## Accessibility

Use semantic headings, landmarks, labelled navigation, descriptive/factual image alt text, keyboard-operable buttons and links, visible 3px focus rings with 4px offset, and minimum 44px interactive targets. Keep light and oxide text at accessible contrast; use `focus-on-dark` inside oxide surfaces. The viewer must retain modal semantics, focus management, Escape behavior, arrow-key controls, live position updates, and an inert/aria-hidden background while open. Do not make meaning depend on color, hover, or motion. Respect reduced motion.

## Do's and Don'ts

### Do:
- Preserve complete sculptures with `object-fit: contain`.
- Keep the six-work selection reversible and explicitly temporary.
- Treat the current archive as 34 catalogue records and 232 photographs, distinct from the 61 records documented in 2001.
- Date and attribute every historical quotation, collection value, biography statement, and relationship claim.
- Use **“Not recorded”** for missing facts.
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
