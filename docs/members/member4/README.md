# Member 4 — Map, reviews and MongoDB

Assigned Figma screens: **07 Map / Search Hotspots**, **08 Reviews & Amenities**.

| Area                                             | Source                                                                                                                                                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Interactive origin, search map and polling       | [web/src/members/member4/MapView.jsx](../../../web/src/members/member4/MapView.jsx)                                                                                                                          |
| Review charts and flexible amenities             | [web/src/members/member4/Reviews.jsx](../../../web/src/members/member4/Reviews.jsx)                                                                                                                          |
| Search GET/POST and reviews GET                  | [api/members/member4/routes.js](../../../api/members/member4/routes.js)                                                                                                                                      |
| Nearest pins and hotspot grid cells              | [mongo/members/member4/geospatial.cjs](../../../mongo/members/member4/geospatial.cjs)                                                                                                                        |
| Indexed property-scoped review facets            | [mongo/members/member4/review-facets.cjs](../../../mongo/members/member4/review-facets.cjs)                                                                                                                  |
| Shared pipeline exports                          | [mongo/members/member4/pipelines.cjs](../../../mongo/members/member4/pipelines.cjs)                                                                                                                          |
| Collection validators and geo/TTL/review indexes | [mongo/members/member4/01_collections_and_indexes.js](../../../mongo/members/member4/01_collections_and_indexes.js)                                                                                          |
| Independent shell workflows                      | [mongo/members/member4/02_workflow3_geonear.js](../../../mongo/members/member4/02_workflow3_geonear.js), [mongo/members/member4/03_workflow4_facet.js](../../../mongo/members/member4/03_workflow4_facet.js) |
| MongoDB seed generation                          | [data_generation/members/member4/mongo_seeder.py](../../../data_generation/members/member4/mongo_seeder.py)                                                                                                  |
| Member regression tests                          | [tests/members/member4/workflows.cases.js](../../../tests/members/member4/workflows.cases.js)                                                                                                                |

## Implementation notes

- Search uses a 5 km radius, explicit 15/60/120-minute UI filters and 15-second polling.
- The nearest list returns up to 100 pins in distance order. A separate pipeline groups all qualifying pins into approximate grid hotspots and returns up to 25 cells.
- Search sessions have a two-hour TTL. An explicit query cutoff enforces recency before asynchronous TTL deletion completes.
- Review facets match the selected property/date scope before computing rating distribution, top tags, average and count. The UI also shows that property's flexible amenities catalog.
- The API and root MongoDB shell workflows reuse the same pure builders. Coordinates are stored as GeoJSON [longitude, latitude].
- Tile failures, empty recent searches, missing reviews and empty catalogs have dedicated UI feedback.

Run npm commands and MongoDB shell workflows from the repository root. The [member regression cases](../../../tests/members/member4/workflows.cases.js) run through root `npm test` against dedicated seeded test databases. See the [project README](../../../README.md), [combined ownership guide](../README.md) and [code walkthrough](../../code_walkthrough.md).
