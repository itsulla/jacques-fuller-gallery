---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: ["src/App.css","src/index.css"]
---

# Jacques Fuller homepage surface brief

## Scope and mode
- Surface: `src/App.jsx`, single-page sculpture archive
- Mode: Experience
- Audience: collectors, curators, researchers, art-interested visitors, Jacques and his family
- Job: encounter the sculpture first, inspect multiple views, then browse the catalogue
- Constraints: preserve all truthful content, catalogue IDs, anchors, viewer behavior, keyboard access, and noindex preview state

## Approved direction
**Forged Archive** combines the Museum Index Gateway structure with the Object Platform's sculpture scale. A persistent desktop index rail gives the archive a specific identity; the first viewport presents Ship of Fools as the dominant object. Cold smoke-grey surfaces, deep green-black ink, one muted patina action color, sharp geometry, Petrona editorial display type, and condensed technical labels. Mechanical structure is functional, never decorative.

## Memorable moment
The visitor enters through a narrow archive index and meets Ship of Fools at object-platform scale. The sculpture, title, catalogue facts, and archive scope are understood in one viewport.

## Asset and implementation inventory
| Ingredient | Source | Implementation |
|---|---|---|
| Ship of Fools hero | Existing optimized artwork photography | Real responsive image, contained and eagerly loaded |
| Desktop archive rail | Product navigation and verified counts | Semantic header/nav plus CSS grid; mobile converts to top bar |
| Editorial display type | Self-hosted Petrona variable font | Fontsource package, only required variable asset |
| Technical labels | Self-hosted Fira Sans Condensed | Fontsource package, selected weights only |
| Patina action color | Visual direction | Semantic CSS tokens with verified contrast |
| Selected-work rhythm | Six existing featured records and photographs | Three distinct CSS composition families, repeated intentionally once each |
| Viewer | Existing React dialog and real image set | Preserve behavior; enlarge media share and add inert/live-region hardening |
| Generated direction comps | `.impeccable/mocks/forged-archive-*.png` | North-star references only; no generated pixels ship publicly |

## Must not be literalized
Generated comps altered sculpture details and introduced raster texture. Production uses real photographs, flat CSS surfaces, semantic text, and no invented metadata. No decorative gears, rivets, metallic gradients, fake handwriting, luxury-gold styling, or ornamental crosshairs.

## Unresolved decisions
Artist stories, dates, provenance, availability, contact details, portrait, workshop imagery, and publication approval remain pending family input.
