# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary audience is people encountering Jacques Fuller's sculpture online: collectors, galleries, curators, researchers, and art-interested visitors. They need to see each sculpture as a complete three-dimensional work, understand its material facts, and later read the artist's account of its meaning and making.

Jacques and his family are secondary users. The site must remain straightforward to update as artwork details and stories are collected over time.

## Product Purpose

Create a permanent online gallery for Jacques Fuller, a Bloemfontein-based sculptor active since 1989. The site presents 44 photographed sculptures plus one explicitly labelled Jewellery collection in more depth than Facebook can, with related images grouped into coherent records.

Success means the artwork is visually legible, each work can be explored without social-media clutter, and incomplete artwork details can be added later without redesigning the site.

## Positioning

The site is a focused, artist-led presentation of Jacques's work and material process. It is not a social feed, institutional archive, generic portfolio template, or conventional ecommerce catalogue.

## Operating Context

The initial collection was manually downloaded from Jacques's public Facebook albums and organised as one Google Drive folder per sculpture. Folder names contain confirmed titles and, for some works, materials and dimensions. Sculpture folders contain several JPEG views of the same object; the Jewellery folder is the documented exception and groups multiple distinct pieces in one collection record.

Artwork descriptions, dates, stories, availability, exhibition history, and fuller work records will be supplied later by Jacques or his family.

## Capabilities and Constraints

- Responsive web gallery with 45 current records and 311 photographs.
- A reversible six-work mosaic leads the homepage; a four-work static gateway opens the complete scrollable Works gallery.
- The full Works gallery presents large lead images in three desktop columns, two tablet columns, and one mobile column; selecting an image opens the existing viewer and factual details.
- Multiple-image carousel or gallery for every current record.
- Individual artwork detail views show only known factual metadata, image count, and supplied photo credit.
- About combines an expanded biography with a six-milestone career timeline in an editorial split layout.
- Missing facts remain null in structured data and are omitted from the public interface.
- Historical source and relationship data remain available internally but are not part of the public presentation.
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

## Internal Evidence on Hand

- Source image archive: `source-assets/Jacques/`.
- The source library contains 45 current-record folders: 44 sculptures and one Jewellery collection.
- The complete supplied 2001 catalogue-entry sequence covers catalogue numbers 1–61 on printed pages 24–27.
- The 2001 interview and chronology provide dated first-person and biographical evidence; they are not current statements.
- Biography, process statements, and chronology sourced to the supplied 2001 publication.
- Confirmed metadata currently available in folder names for selected works and in the linked historical record for `JF-030`.
- Most current artwork dates, prices, availability, exhibition history, photographer credits, and work-specific stories remain unavailable; `JF-030` is the documented historical exception and `JF-041` carries the supplied Marie Girard photo credit.

## Product Principles

1. The sculpture leads; interface elements recede.
2. Multiple views belong to one artwork record; any grouped collection must be explicitly identified rather than presented as views of one object.
3. Missing facts remain absent; the interface never substitutes plausible-looking inventions.
4. Material, scale, process, and surface detail deserve the same attention as silhouette.
5. The body of work should grow without changing its underlying structure.
6. Internal research evidence must remain preserved without becoming public institutional framing.

## Accessibility & Inclusion

Artwork browsing, carousels, dialogs, and navigation must be keyboard accessible, screen-reader labelled, responsive, and usable with reduced motion. Image alt text may begin as factual title-and-view placeholders and should be replaced with richer descriptions when Jacques's catalogue information is available.
