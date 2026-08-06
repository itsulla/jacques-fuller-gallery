# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary audience is people encountering Jacques Fuller's sculpture online: collectors, galleries, curators, researchers, and art-interested visitors. They need to see each sculpture as a complete three-dimensional work, understand its material facts, and later read the artist's account of its meaning and making.

Jacques and his family are secondary users. The site must remain straightforward to update as artwork details and stories are collected over time.

## Product Purpose

Create a permanent online gallery for Jacques Fuller, a Bloemfontein-based sculptor active since 1989. The current site presents 44 photographed sculptures plus one explicitly labelled Jewellery collection record in more depth than Facebook can, with related images grouped into coherent records, and a separately sourced historical layer for the 61 works catalogued in 2001.

Success means the artwork is visually legible, each work can be explored without social-media clutter, and incomplete catalogue details can be added later without redesigning the site.

## Positioning

The site is a focused, single-artist sculpture archive built around multiple views of each physical work and Jacques's material process. It is not a social feed, generic portfolio template, or conventional ecommerce catalogue.

## Operating Context

The initial collection was manually downloaded from Jacques's public Facebook albums and organised as one Google Drive folder per sculpture. Folder names contain confirmed titles and, for some works, materials and dimensions. Sculpture folders contain several JPEG views of the same object; the Jewellery folder is the documented exception and groups multiple distinct pieces in one collection record.

Artwork descriptions, dates, stories, availability, exhibition history, and fuller catalogue records will be supplied later by Jacques or his family.

## Capabilities and Constraints

- Responsive web gallery with 45 current records and 311 photographs.
- A distinct 61-record historical catalogue layer sourced to *Jacques Fuller: Sculptor* (Sanlam Art Collection, 2001).
- A reversible six-work curatorial mosaic leads the monograph-style homepage; a four-work static gateway opens the complete searchable archive in a full-screen index.
- Multiple-image carousel or gallery for every current record.
- Individual artwork detail view with placeholders for future stories and catalogue fields.
- Factual metadata is shown only when present in the source folder name or a cited historical source.
- Current and historical records use separate IDs; title matches do not establish object identity.
- Missing facts use **“Not recorded.”** Unfinished catalogue tasks use **“Research pending.”** Future testimony uses **“Awaiting artist/family account.”**
- Initial images are Facebook-derived JPEGs rather than guaranteed camera originals.
- Preview and production deployments remain separate; review builds are private over Tailscale and never imply a production release.
- Sanity Studio is the recommended post-approval editing and upload interface; it is intentionally not connected until editor accounts and a production deployment are chosen.
- Final collector enquiry and publication-approval workflows remain open decisions.

## Brand Commitments

- Artist name: Jacques Fuller.
- Location: Bloemfontein, South Africa.
- Active as a sculptor since 1989.
- Principal present medium: welded brass, often incorporating sheet brass, found objects, tooled elements, and cast brass parts from discarded industrial machinery.
- Other explored materials include mild steel and red copper.
- Voice should be factual, reflective, and respectful of interpretation. The site must not use hype, invented symbolism, fabricated provenance, or unconfirmed commercial claims.

## Evidence on Hand

- Source image archive: `source-assets/Jacques/`.
- Public source archive contains 45 current-record folders: 44 sculptures and one Jewellery collection.
- The complete supplied 2001 catalogue-entry sequence covers catalogue numbers 1–61 on printed pages 24–27.
- The 2001 interview and chronology provide dated first-person and biographical evidence; they are not current statements.
- Biography, process statements, and chronology sourced to the supplied 2001 publication.
- Confirmed metadata currently available in folder names for selected works and in the linked historical record for `JF-030`.
- Most current artwork dates, prices, availability, exhibition history, photographer credits, and work-specific stories remain unavailable; `JF-030` is the documented historical exception and `JF-041` carries the supplied Marie Girard photo credit.

## Product Principles

1. The sculpture leads; interface elements recede.
2. Multiple views belong to one artwork record; any grouped collection must be explicitly identified rather than presented as views of one object.
3. Missing facts use the explicit archive-state taxonomy, never plausible-looking inventions.
4. Material, scale, process, and surface detail deserve the same attention as silhouette.
5. The archive should grow without changing its underlying structure.
6. Historical ownership, biography, and interview material must remain visibly dated and source-attributed.

## Accessibility & Inclusion

Artwork browsing, carousels, dialogs, and navigation must be keyboard accessible, screen-reader labelled, responsive, and usable with reduced motion. Image alt text may begin as factual title-and-view placeholders and should be replaced with richer descriptions when Jacques's catalogue information is available.
