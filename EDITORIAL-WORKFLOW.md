# Editorial and Upload Workflow

## Recommendation

Use **Sanity Studio** as the editing interface after the prototype is approved. The public website remains a fast static Vite site; Sanity stores the text and original uploaded images, provides the private editor, and triggers a Vercel rebuild when an editor publishes.

This is deliberately not connected during the private prototype stage. Connecting it requires a Sanity project, editor accounts, and the production deployment target. The current catalogue shape is already compatible with the proposed fields.

## What Jacques or a family editor would see

A private address such as `studio.jacquesrenefuller.com` with four simple areas:

1. **Artworks** — add, edit, reorder, or archive a sculpture.
2. **Selected works** — choose the six works shown prominently and drag them into order.
3. **Artist** — edit the biography, location, process, timeline, and contact details.
4. **Archive material** — add workshop photographs, old press, exhibition records, or transcribed recollections when available.

No code, terminal, GitHub, filenames, or manual image resizing should be visible to the editor.

## Uploading a new work

1. Sign in.
2. Select **New artwork**.
3. Enter the title.
4. Drag the Facebook photographs into the photo field.
5. Drag the strongest photograph into the first position or mark it **Hero image**.
6. Fill only the known fields: material, dimensions, approximate date, status, and story.
7. Leave unknown fields blank; the site will show `To be confirmed` where appropriate.
8. Choose whether it belongs in **Selected works**, and set its display order if it does.
9. Select **Publish**.
10. The public site rebuilds automatically. A preview link can be reviewed before production publication if desired.

## Editing an existing work

An editor opens the artwork by title, changes the text, reorders or replaces photographs, and selects **Publish**. Previous published revisions remain available through the CMS history.

## Proposed artwork fields

| Field | Editor control | Required |
|---|---|---:|
| Title | Short text | Yes |
| Catalogue number | Generated or short text | Yes |
| Slug / URL | Generated from title, editable by administrator | Yes |
| Photographs | Multi-image drag-and-drop upload | Yes |
| Hero photograph | Image selection | Yes |
| Hero crop/focal point | Visual hotspot control | No |
| Material | Short text | No |
| Dimensions | Structured height/width/depth plus display text | No |
| Date | Exact year, circa year, or free-text range | No |
| Status | Available / Artist collection / Private collection / Sold / Commissioned / Archive only / Unknown | No |
| Story in Jacques's words | Rich text | No |
| Catalogue observation | Rich text | No |
| Process notes | Rich text | No |
| Exhibition history | Repeatable dated entries | No |
| Provenance / current location | Restricted text field if privacy is required | No |
| Photo credit | Short text | No |
| Selected work | Toggle | No |
| Selected order | Number or drag order | No |
| Publication state | Draft / published / archived | Yes |

## Roles and safeguards

- **Editor:** can add photographs and change drafts.
- **Publisher:** can approve and publish changes.
- **Administrator:** can change accounts, schema, integrations, and deployment settings.
- Destructive deletion should be replaced by **Archive** for artwork records.
- The source Facebook downloads remain immutable and backed up separately from the CMS.
- Draft previews should remain private; public publication is a separate action.

For the lowest-friction arrangement, Jacques or his family can be Editors while Ulrich remains Publisher/Administrator. If they do not want another login, the fallback is even simpler: they upload a folder to Drive and send a voice note; Ulrich or Atlas enters and publishes the record.

## Prototype-stage workflow

Until the CMS is connected:

1. Add one Drive folder named for the work.
2. Put all photographs of that work in the folder.
3. Send known details in any convenient form, including a WhatsApp voice note.
4. The deterministic catalogue script creates web variants while preserving the source files.
5. Curation fields select the hero image and whether the work belongs in the featured six.

## Why not a public file uploader

A normal website cannot safely write uploaded files into its deployed Vercel filesystem. A purpose-built CMS gives authenticated uploads, image storage, revision history, draft previews, and controlled publication without giving nontechnical editors access to the deployment or source repository.
