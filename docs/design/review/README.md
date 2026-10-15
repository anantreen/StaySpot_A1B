# StaySpot design comparison and edge-state additions

The supplied Figma file and both SVG boards were compared with the current `StaySpot_A1B` React application. The live Figma file has `ui` and `wireframes` pages containing the corresponding imported SVG groups. It was view-only in this session, so these deliverables are updated local SVGs for import; no changes were published to that Figma file.

## Open or import the updated designs

- [Complete updated UI board](StaySpot_ALL_UI_Updated.svg)
- [Complete updated wireframe board](StaySpot_ALL_Wireframes_Updated.svg)
- [Local preview gallery](preview.html)
- [New UI-state overview](previews/ui_overview.png)
- [New wireframe-state overview](previews/wireframes_overview.png)

In Figma, open the matching page in a file you can edit and drag its updated SVG onto an empty area beside the original board. The existing UI board's 15 groups and wireframe board's 14 groups are preserved; each updated board adds eight frames. Review the imported text/fonts and grouping before replacing your earlier copy. These are editable SVG vectors, not a native Figma component library or linked prototype.

Unmodified copies of the supplied SVGs are in [source/](source/), with SHA-256 checksums in [provenance.json](provenance.json). Source documentation/annotations were treated as design content, not instructions to run commands or change project behavior. Sample IDs, names, amounts and chart values remain illustrative; no stored data was adjusted to match them.

## Comparison

| Area                    | Finding in supplied boards/current app                                                                                  | Result of this review                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Main screens            | Properties, Guests, details, booking, status, Audit, Analytics, Map and Reviews already represented                     | Preserved the existing layout, member sections, palette and components                                                     |
| Personas/user flows     | Foundations and flows are documentation; the app has demo guests rather than authentication                             | Preserved; no invented login, roles or access-denied flows                                                                 |
| Loading/empty/error     | Boards 09 and extra interaction states already cover shared `DataState` behavior                                        | Kept those designs; added contextual recovery examples rather than duplicating entire screens                              |
| Bad navigation          | App previously fell back to Browse for unknown hashes/paths                                                             | Added client page-not-found UI, with navigation back to Browse                                                             |
| Render exception        | No React recovery boundary; a render failure could blank the UI                                                         | Added a screen boundary plus a root fallback. Sidebar navigation survives a screen failure; Retry remounts it              |
| Same-route recovery     | Returning to Browse could leave a failed Browse boundary mounted                                                        | Go to Browse clears the boundary even when Browse is already the selected route                                            |
| Record request          | Details opened only after a successful GET; pending/failed reads had no in-dialog state                                 | Dialog now opens immediately, with shared loading, error and GET retry states; Close and Escape remain usable              |
| Browse/picker empty     | Generic empty text gave no specific next action                                                                         | Added entity-specific wording, Clear filters and Clear search                                                              |
| Booking field errors    | Native input checks did not explain whole-number/range errors beside nights                                             | Added inline 1–365 whole-night validation and accessible field descriptions                                                |
| Booking pending         | Submit was busy, but property/nights/status controls could still change                                                 | Disable the form while submitting and guard duplicate requests; no automatic mutation retry                                |
| Missing guest           | Initial guest failure had no dedicated retry; Audit could fall back to guest #1                                         | Added guest-read retry, booking guidance, and a choose-guest Audit state; no other guest's ledger is fetched as a fallback |
| Audit date error        | Invalid dates caused an API error and a retry of the same invalid range                                                 | Validate next to the date controls, pause invalid reads, preserve editability and provide Clear dates for empty results    |
| Analytics error/refresh | Existing inline date validation and retained refresh snapshot already implemented                                       | Reused the shared date validator and documented both behaviors in new frames                                               |
| Coordinates             | Empty numeric fields could become zero if browser validation was bypassed                                               | Reject blank/out-of-range coordinates with an inline message; zero itself remains valid                                    |
| No recent map pins      | Generic empty message did not explain recency                                                                           | Added No recent searches nearby and Show last 2 hours when applicable; no demo pins are created automatically              |
| Map tile failure        | Static connectivity note, but no actionable tile failure state                                                          | Added tile error feedback and Retry map tiles; keep the results region independent                                         |
| Service connection      | Initial health check could leave a stale badge after later failure                                                      | Added a 30-second health recheck and Retry connection for health/guest reads                                               |
| No reviews/catalog      | Existing no-review/tag text; a catalog containing only metadata could render an empty grid                              | Keep no-review behavior and show the missing-catalog message for empty/metadata-only catalogs                              |
| Modal keyboard behavior | Callback changes could refocus an open dialog; Shift+Tab from the dialog root could escape                              | Stable focus lifecycle, Escape dismissal, focus restoration and improved keyboard containment                              |
| Stale design copy       | Property pager said 20 for eight-card pages; audit sample rows were oldest first; singular-night wording could be wrong | Corrected copied boards to eight records, newest-first audit examples on desktop/phone, and one-night wording              |
| One result              | Browse pager used plural labels for a single match                                                                      | Fixed property/guest/booking singular labels                                                                               |
| Phone recovery          | Existing phone screens covered ordinary states                                                                          | Kept responsive style; added wrapping recovery controls and inspected Browse/404 at 390 × 844                              |

The 404 is a client-side page state; existing HTTP routes and SPA fallback behavior are unchanged. Screen errors are not presented as database errors. Booking success/failure receipt states and the CHECKED_IN uniqueness rules remain the existing behavior.

## Added frames

| Frame                               | UI               | Wireframe                |
| ----------------------------------- | ---------------- | ------------------------ |
| 11 Page not found                   | [SVG](ui/11.svg) | [SVG](wireframes/11.svg) |
| 12 Screen error recovery            | [SVG](ui/12.svg) | [SVG](wireframes/12.svg) |
| 13 Record loading and unavailable   | [SVG](ui/13.svg) | [SVG](wireframes/13.svg) |
| 14 Invalid fields and date ranges   | [SVG](ui/14.svg) | [SVG](wireframes/14.svg) |
| 15 Contextual empty results         | [SVG](ui/15.svg) | [SVG](wireframes/15.svg) |
| 16 Connection and map tile failure  | [SVG](ui/16.svg) | [SVG](wireframes/16.svg) |
| 17 No reviews and missing amenities | [SVG](ui/17.svg) | [SVG](wireframes/17.svg) |
| 18 Pending and background refresh   | [SVG](ui/18.svg) | [SVG](wireframes/18.svg) |

Supplement frames containing multiple scenarios are explicitly illustrative comparisons, rather than new sidebar destinations. Retry controls shown in shared/read errors repeat GETs. The booking flow requires an explicit new submission after correction.

## Verification

- SVG XML, unique IDs and text bounds checked. All original top-level screen groups retained in both complete boards.
- New state overview and detailed field/map previews visually inspected. Corrected original audit/phone SVGs rendered in the browser and inspected.
- 27 pure validation cases passed, including blank coordinates versus valid zero, fractional/invalid nights, impossible calendar dates and the inclusive 90-day analytics limit.
- Isolated browser fixtures exercised service failure/recovery, no guests, read error/retry, pending record dismissal, Escape/focus return, render failure/retry and same-route recovery, empty search resets, invalid Audit ranges with zero additional Audit requests, pending booking controls with one mocked POST, map-tile failure/recovery, extended map time window, blank coordinates, zero reviews and metadata-only amenities.
- Failure fixtures use mock responses and, for tile events, a controlled Leaflet substitute. Their sample booking response does not create a real booking or audit row. This is separate from live-app smoke checks.
- Live smoke checks loaded all six main screens and recovered from an invalid pathname. The 390 × 844 Browse and 404 layouts were visually inspected in browser frames. Browser-extension scripts reported unrelated `removeChild` errors; no application-source error appeared in those checks.
- Frontend production build and formatting/whitespace checks run. No backend routes, database queries, SQL/MongoDB scripts or stored records were changed for this review.

## Rebuild the design artifacts

Use a Python environment with Pillow installed, then run from the repository root:

```bash
python docs/design/build_review_boards.py
```

This uses the checked-in original SVG copies. To start from replacement exports, supply `--source-ui /path/to/UI.svg --source-wireframes /path/to/Wireframes.svg`. The generator reuses `generate_design.py` and its existing source vector assets; it has no database or API connection.

## Existing limitation outside this design review

The original design review left the frontend all-pages booking sorter unchanged. A subsequent functional update, with authorization to change booking reads, replaced it with server cursor pages: 20 rows per UI request, newest first, capped at 1,000 matching records per traversal. See the updated [handover](../../handover_note.md) and [project README](../../../README.md#6-repository-final-commit-and-demo) for the follow-up verification. Audit's selected guest/date accumulation is unchanged.
