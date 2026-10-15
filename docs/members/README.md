# Four-member code organization

All four members are present in the merged StaySpot application. Each layer retains member1–member4 subfolders, and shared entry points connect them into one project. Run installation, setup, build and startup commands from the repository root.

| Member   | Responsibility                                                            | Assigned Figma screens                                                            | Member guide                  |
| -------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------- |
| Member 1 | Browse, Property Details, shared React foundations and PostgreSQL schema  | 00 Foundations & Users; 01 Browse; 02 Property Details                            | [Member 1](member1/README.md) |
| Member 2 | Booking, Status Transition, Wallet Audit, procedure, indexes and triggers | 03 Transaction / Book Stay; 04 Booking Status & Constraint; 05 Wallet Audit Trail | [Member 2](member2/README.md) |
| Member 3 | Analytics, window functions and materialized summaries                    | 06 Analytics                                                                      | [Member 3](member3/README.md) |
| Member 4 | Map, Reviews, MongoDB pipelines, validators and indexes                   | 07 Map / Search Hotspots; 08 Reviews & Amenities                                  | [Member 4](member4/README.md) |

## Folder ownership

```text
api/
├── app.js, server.js, shared/
└── members/member1–4/          Member API route handlers
web/src/
├── main.jsx, style.css
└── members/member1–4/          Member screens and shared components
sql/
├── 01_*.sql ... 07_*.sql       Stable setup/workflow entry points
└── members/member1–3/          Canonical schema and financial/analytics SQL
mongo/
├── numbered workflows, pipelines.cjs
└── members/member4/            Canonical validators, indexes and query builders
data_generation/
├── postgres_seeder.py, mongo_seeder.py, requirements.txt
└── members/member2/, member4/  Canonical seeders
tests/
├── workflows.test.js, helpers.js, database_checks.py
└── members/member1–4/          Member regression cases
docs/members/
├── README.md                  Combined ownership guide
└── member1–4/README.md         Individual member guides
```

## Shared integration

- [web/src/main.jsx](../../web/src/main.jsx) mounts the React application; [web/src/style.css](../../web/src/style.css) contains the shared styles.
- [api/app.js](../../api/app.js) registers all four route modules; [api/server.js](../../api/server.js) owns connections, listening and shutdown. [api/shared](../../api/shared) contains HTTP validation and reusable SQL fragments.
- Root [sql](../../sql) files delegate to member-owned SQL through PostgreSQL's relative `\ir` includes. Root [mongo](../../mongo) files use `load()` or shared exports. Root [data_generation](../../data_generation) Python entry points delegate through `runpy`.
- Browse imports Member 2's booking status action. All feature screens reuse Member 1's components and helpers.
- These folders describe assigned responsibilities. Team names, roll numbers and confirmed personal contributions belong in the project contribution table.

## Running and verification

Follow the [project README](../../README.md) for prerequisites, first-time setup, later starts and graceful shutdown. The root [test entry point](../../tests/workflows.test.js) loads all four members' test files. Run `npm test` against dedicated seeded test databases; these integration tests create fixtures and refresh summaries. The [setup and layout verification](../structure_verification.md) records 13 passing API tests, eight database checks and a full fresh setup. Earlier performance logs retain their original dates.

The [code walkthrough](../code_walkthrough.md) explains the implementation. The [Figma export guide](../design/README.md) and [offline gallery](../design/preview.html) provide 15 UI designs and 14 wireframes with SVG/PNG downloads and member filters. Property Details is a modal; Booking Status is part of Browse → Bookings.
