---
name: Jacques Fuller Living Monograph
assessment: A sculptural monograph paired with an explicitly unfinished family archive.
colors:
  primary: "#315fcb"
  accent-ink: "#f4f6f2"
  mineral-page: "#e4e7e3"
  mineral-raised: "#f0f1ec"
  paper: "#f5f3ed"
  brushed-steel: "#c9cfcb"
  deep-oxide: "#182126"
  muted-oxide: "#526066"
  steel-line: "#a9b2ae"
  viewer-oxide: "#101a20"
  viewer-raised: "#19272e"
  viewer-ink: "#edf1ed"
typography:
  display:
    fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif'
    fontSize: "9.5rem"
    fontWeight: 400
    lineHeight: 0.83
    letterSpacing: "-0.06em"
  body:
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: '"Arial Narrow", "Aptos Narrow", "Helvetica Neue", Arial, sans-serif'
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  sharp: "0px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "96px"
components:
  action:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.sharp}"
    padding: "13px 16px"
  selected-work:
    backgroundColor: "{colors.mineral-page}"
    textColor: "{colors.deep-oxide}"
    rounded: "{rounded.sharp}"
    padding: "0px"
  artwork-stage:
    backgroundColor: "{colors.brushed-steel}"
    rounded: "{rounded.sharp}"
    padding: "24px"
  artist-section:
    backgroundColor: "{colors.mineral-raised}"
    textColor: "{colors.deep-oxide}"
    rounded: "{rounded.sharp}"
    padding: "48px"
  record-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted-oxide}"
    rounded: "{rounded.sharp}"
    padding: "48px"
  divider:
    backgroundColor: "{colors.steel-line}"
    height: "1px"
    width: "100%"
  viewer:
    backgroundColor: "{colors.viewer-oxide}"
    textColor: "{colors.viewer-ink}"
    rounded: "{rounded.sharp}"
  viewer-media:
    backgroundColor: "{colors.viewer-raised}"
    textColor: "{colors.viewer-ink}"
    rounded: "{rounded.sharp}"
---

# Design System: Jacques Fuller Living Monograph

## Overview

**Creative North Star: “The Living Monograph”**

The site combines the authority and visual pacing of a printed sculpture monograph with the honesty of an archive still being assembled by a family. Six works form a temporary exhibition; all records remain available below. Workshop material, recollections, provenance, and dates can be added without changing the visual grammar.

The interface is quiet but not anonymous. Monumental serif typography, cool mineral fields, strict catalogue labels, and deep oxide reading environments frame the work while letting photographed brass provide the warmth.

**Key Characteristics:**
- Six-work curatorial sequence before the complete archive
- Large contained sculpture photography rather than decorative crops
- Monograph serif for names and narrative; narrow sans-serif for record labels
- Cool mineral surfaces, deep oxide sections, and one rare cobalt signal
- Square corners, hairline rules, and no permanent shadows
- Visible placeholders where the record remains incomplete

## Colors

Cobalt is the sole high-chroma interface accent. Every other token is a mineral, steel, paper, or oxide neutral.

### Primary
- **Catalogue Cobalt:** Primary actions, focus, active states, and occasional image-view prompts.

### Neutral
- **Mineral Page:** Default exhibition ground.
- **Mineral Raised:** Artist biography and reading surfaces.
- **Paper:** Light catalogue-record sections inside the oxide viewer.
- **Brushed Steel:** Image wells that support both white and dark Facebook photographs.
- **Deep Oxide:** Primary text and dark structural contrast.
- **Viewer Oxide:** Immersive record and living-archive ground.

**The Natural Brass Rule.** Never use gold as a UI accent. Brass belongs in the sculpture photographs.

**The One Cobalt Rule.** Cobalt remains rare enough to identify a real action immediately.

## Typography

**Display Font:** Iowan Old Style with Palatino, Book Antiqua, and Georgia fallbacks  
**Body Font:** Helvetica Neue with Helvetica and Arial fallbacks  
**Label Font:** Arial Narrow with Aptos Narrow and Helvetica Neue fallbacks

The serif provides the authority and cadence of an artist monograph. The sans-serif body remains neutral and legible. Narrow uppercase labels separate factual catalogue material from narrative text.

### Hierarchy
- **Artist / artwork names:** Large serif, regular weight, tight spacing, compact leading.
- **Section headings:** Large serif with restrained line length.
- **Artwork observations:** Medium serif for visual, non-interpretive descriptions.
- **Body:** Regular sans-serif with open leading and practical measure.
- **Catalogue labels:** Small uppercase condensed sans-serif with high contrast.

Metadata labels may be small, but values remain readable and never depend on low contrast.

## Layout

The homepage uses twelve desktop columns. The opening viewport deliberately splits a typographic artist introduction and one contained sculpture stage. The selected sequence alternates image and record positions, with slight changes in column span to avoid a feed or equal-card wall.

The Living Archive becomes a deep oxide chapter between selected works and biography. It explains how voice notes, studio fragments, and historical records can join the object catalogue without fabricating missing material.

Below 760px, each composition collapses to one column. The complete archive uses two columns on normal phones and one below 430px. Interactive targets maintain a minimum dimension of 44px.

## Elevation & Depth

The system is flat. Depth comes from tonal layering, image wells, paper-versus-oxide contrast, hairline separators, and the full-screen viewer transition. Permanent card shadows are prohibited.

## Shapes

Corners are square throughout. Image wells, buttons, thumbnails, catalogue records, and archive cards use hard edges. Pills, soft dashboards, and ornamental frames do not belong in this system.

## Components

### Selected Work
- A large contained image stage and a compact record block.
- The record shows temporary selection number, title, known metadata, a factual visual observation, and one explicit action.
- Alternating placement creates exhibition pacing without changing interaction behavior.

### Complete Archive Card
- Contained thumbnail with catalogue number, title, and view count.
- No decorative border or shadow around the whole card.
- The complete archive is visually subordinate to the selected six.

### Living Archive Chapter
- Deep oxide ground with three future record paths: Voice, Studio, and Record.
- Existing sculpture details may demonstrate the photographic archive, but must be labelled as existing detail studies rather than workshop photographs.
- Missing portraits and studio images remain optional and are never replaced by generated facsimiles.

### Artwork Viewer
- Full-screen oxide environment with title and facts beside a viewport-bounded image stage.
- Previous and next photograph controls remain visible in the first viewport.
- Thumbnails expose every supplied view; keyboard arrows mirror pointer controls.
- A paper record chapter holds the visual catalogue note and clearly marked future artist story.

## Do’s and Don’ts

### Do:
- **Do** preserve complete sculptures with `object-fit: contain`.
- **Do** treat the six-work selection as reversible curation, not a permanent ranking.
- **Do** use existing detail photographs honestly while workshop material is unavailable.
- **Do** keep catalogue uncertainty explicit until Jacques or his family confirms it.
- **Do** let handwritten notes, tools, voice, and old records expand the archive later.

### Don’t:
- **Don’t** introduce black-and-gold luxury styling.
- **Don’t** round cards or turn metadata into pills.
- **Don’t** infer dates, materials, symbolism, provenance, or availability from photographs.
- **Don’t** imply that a sculpture detail is a studio photograph.
- **Don’t** require a formal portrait; hands, tools, surfaces, and voice can carry the human record.
- **Don’t** add motion that delays access to the photographs.
