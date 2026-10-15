# StaySpot — Assignment 2

StaySpot is a vacation-rental demonstration application built on the PostgreSQL and MongoDB workflows from Assignment 1. It supports browsing properties, guests and bookings; booking stays from a wallet; checking booking status and audit history; revenue analytics; nearby searches; and review/amenities summaries.

The repository is **StaySpot_A1B**. All four member sections are present. This README includes setup instructions and the full content of the shared member guide plus all four individual member READMEs.

[Setup](#1-setup-steps) · [Assumptions](#2-assumptions-and-current-limits) · [Technology](#3-technology-choices) · [Screenshots](#4-screenshots-and-designs) · [Contributions](#5-contribution-table) · [Repository and demo](#6-repository-final-commit-and-demo) · [All five member READMEs](#7-member-documentation-all-five-readmes)

## 1. Setup steps

### 1.1 Prerequisites

Use Bash on macOS/Linux. On Windows, use a WSL 2 Ubuntu terminal with Docker Desktop's WSL integration enabled, and run the complete setup inside that terminal.

| Tool                     | Required version / purpose                                                              |
| ------------------------ | --------------------------------------------------------------------------------------- |
| Git                      | Clone the repository                                                                    |
| Node.js and npm          | Node.js 22.12 or later; install the locked JavaScript dependencies and run Vite/Express |
| Python                   | Python 3.11 or later with pip and venv; run the seeders                                 |
| Docker with Compose v2   | Run the PostgreSQL 16 and MongoDB 7.0 containers                                        |
| PostgreSQL client `psql` | Run SQL setup scripts from the host terminal                                            |
| MongoDB Shell `mongosh`  | Install MongoDB validators/indexes and run shell workflows                              |

Docker supplies the database servers. The setup script also needs `psql` and `mongosh` on the host/WSL PATH; activating the Python environment does not install these clients or start Docker.

On macOS with Homebrew, install the database clients and expose `psql`:

```bash
brew install libpq mongosh
export PATH="$(brew --prefix libpq)/bin:$PATH"
```

On Ubuntu/WSL, install `postgresql-client` and `python3-venv` through apt, and install MongoDB Shell for that environment. Check that all required commands are available:

```bash
git --version
node --version
npm --version
python3 --version
psql --version
mongosh --version
docker compose version
```

Start Docker Desktop on macOS/Windows, or the Docker Engine service on Linux, before continuing. `docker info` must succeed.

### 1.2 Clone and install dependencies

```bash
git clone https://github.com/anantreen/StaySpot_A1B.git
cd StaySpot_A1B

# First clone: create local configuration from the committed example.
cp .env.example .env

npm ci
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r data_generation/requirements.txt
```

### 1.3 Check local configuration

The example configuration uses these dedicated host ports:

```dotenv
DATABASE_URL=postgresql://stayspot:stayspot@127.0.0.1:55434/stayspot
MONGO_URL=mongodb://127.0.0.1:27021
MONGO_DB=stayspot
POSTGRES_PORT=55434
MONGO_PORT=27021
PORT=3000
```

Keep `DATABASE_URL` aligned with `POSTGRES_PORT`, and `MONGO_URL` aligned with `MONGO_PORT`. Existing native database services can keep their other ports. The `.env` file is local and ignored by Git; `.env.example` documents the settings for teammates.

### 1.4 Start and initialize the databases — first run only

Run this against fresh, empty databases selected by `.env`:

```bash
docker info
docker compose up -d --wait
bash scripts/setup.sh
```

Setup checks the required clients and Python packages, checks for existing StaySpot tables/documents, installs all numbered SQL files in a DDL transaction, installs MongoDB validators/indexes, and then runs the two seeders. Seeding the two databases is a separate phase, not a cross-database transaction.

Initial seed targets are:

| Database   | Table / collection                     |          Initial target |
| ---------- | -------------------------------------- | ----------------------: |
| PostgreSQL | Guests                                 |                   1,000 |
| PostgreSQL | Properties                             |                   2,000 |
| PostgreSQL | Bookings                               |                  50,000 |
| PostgreSQL | Trigger-generated wallet audit entries |                 100,000 |
| MongoDB    | SearchSessions                         |                 500,000 |
| MongoDB    | PropertyReviews                        |                  50,000 |
| MongoDB    | PropertyAmenities                      | One per seeded property |

The first image download and full seed take longer than a normal restart. SearchSessions intentionally expire after two hours, so their later live count can fall below the initial target.

If setup reports existing StaySpot tables, it stops before modifying them. An existing schema alone does not prove every seed phase completed. For a completed installation, use the later-start instructions. For an incomplete installation, inspect the selected databases before choosing how to finish it; setup does not automatically repair or reset them.

For an installation created before the booking-pagination update, install its indexes once without reseeding or rerunning full setup:

```bash
set -a
source .env
set +a
psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f sql/07_booking_pagination_indexes.sql
```

This idempotent upgrade only adds booking indexes. Fresh setup includes it automatically. Rebuild and restart the app after updating the source.

### 1.5 Build and run

```bash
npm run build
npm start
```

Open **http://127.0.0.1:3000**. Keep that terminal running. Vite generates `dist/`; Express serves those assets and the API from the same address. A clone does not include a prebuilt `dist/` folder.

In a second terminal, check connectivity to both database engines:

```bash
curl http://127.0.0.1:3000/api/health
```

Expected response:

```json
{ "ok": true, "mode": "live", "project": "StaySpot" }
```

Health checks database connectivity, rather than completeness of the seed. Use the header's guest picker to switch demo actors. The default seed includes guest #1, Ananya Rao. Map tiles require internet access.

### 1.6 Later starts and frontend development

For an initialized installation with a completed build:

```bash
cd StaySpot_A1B
docker compose up -d --wait
npm start
```

Run `npm run build` again after frontend source changes. Do not rerun full setup or seeders for ordinary restarts; Docker's named volumes preserve the data.

For development, stop the existing app with Ctrl+C, then run:

```bash
npm run dev
```

Open **http://127.0.0.1:5173**. The customized [scripts/dev.mjs](scripts/dev.mjs) starts Vite and the API together. Vite proxies `/api` to port 3000, so keep the default API port for this development command.

### 1.7 Stop gracefully

1. Press **Ctrl+C** in the app/development terminal. The server closes its listener and database clients.
2. Stop this project's database containers while retaining their data:

```bash
docker compose stop
```

Use Ctrl+C rather than Ctrl+Z; Ctrl+Z suspends the process and can leave its port occupied.

### 1.8 Troubleshooting

| Symptom                                          | Action                                                                                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Docker socket missing / cannot connect to Docker | Start Docker Desktop/Engine and wait for `docker info` to succeed                                                              |
| `psql` or `mongosh` not found                    | Install the host/WSL database clients and check PATH                                                                           |
| Python import/dependency error during setup      | Activate `.venv` and install `data_generation/requirements.txt`                                                                |
| `.env not found. Continuing without it.`         | Create `.env` from `.env.example`, check the selected databases/ports and restart the app                                      |
| Database port already in use                     | Choose free host ports in `.env` and update the corresponding connection URLs; check for stale exported shell variables        |
| Setup stops because tables/documents exist       | Use normal startup if initialization completed; otherwise inspect the incomplete setup without rerunning the full seed blindly |
| Missing `dist/index.html`                        | Run `npm run build` from the repository root                                                                                   |
| Port 3000 already in use                         | Stop the previous app with Ctrl+C; keep port 3000 for the default Vite proxy                                                   |
| No map pins in the selected period               | Search sessions expire; try the two-hour window or add a fresh pin at the selected origin through the UI                       |
| MongoDB missing-namespace error                  | Check `MONGO_URL`/`MONGO_DB` and whether MongoDB initialization completed                                                      |

### 1.9 Run the integration checks

Use dedicated, freshly seeded test databases. The API tests create fixture guests, bookings, audit entries and search pins, and refresh summaries. See the [test guide](tests/README.md) for the setup assumptions. From that test installation:

```bash
set -a
source .env
set +a
npm test
python tests/database_checks.py
python scripts/check_members.py
```

The root test runner loads the four members' test files. It includes a regression that verifies newest-first booking pages stop at 1,000 matches. Database tests check seeded volumes, atomicity, audit immutability, constraints, summaries, MongoDB indexes and saved query plans. Run the telemetry-volume check soon after seeding because sessions expire after two hours.

## 2. Assumptions and current limits

- **Demo identity:** the guest selector switches actors for demonstrations. Real authentication, authorization and separate user accounts are not implemented.
- **Money:** currency is INR. PostgreSQL stores financial values as exact NUMERIC amounts. A booking costs the current property base price × 1–365 whole nights; the database calculates the authoritative amount.
- **Booking state:** bookings start CONFIRMED or CHECKED_IN and progress CONFIRMED → CHECKED_IN → COMPLETED. A guest can have multiple confirmed reservations and at most one checked-in stay. Property/date availability, cancellations and refunds are outside this demo.
- **Transactions:** one API connection owns BEGIN/COMMIT/ROLLBACK. The procedure performs the debit and booking insert; the wallet trigger adds the audit entry in the same transaction. The API does not explicitly request REPEATABLE READ.
- **Audit:** debit amounts are negative, credit amounts positive, and each row stores the resulting balance. Ordinary UPDATE/DELETE/TRUNCATE operations are blocked; a privileged database owner can disable triggers.
- **Seed history:** historical seeded bookings represent settled stays before the demo wallet snapshot. The generated audit ledger comes from actual wallet updates; it is not a debit history for every seeded historical booking.
- **Analytics:** UTC creation dates, zero-filled days and six warm-up days define the seven-day average. The default cohort is the top 12 properties by lifetime materialized revenue; ranks compare that cohort on each day. Date filters affect the series, while materialized summary/totals represent lifetime values.
- **MongoDB:** documents reuse real PostgreSQL IDs, but MongoDB does not enforce cross-database foreign keys. GeoJSON stores [longitude, latitude]. Search uses a 5 km radius, explicit recency, approximate grid hotspots and a two-hour TTL.
- **External resources:** map tiles need internet. The core financial and review workflows run against the configured local databases.
- **Pagination:** Bookings fetch one 20-row server page at a time, newest first, and stop at the latest 1,000 matching records. Filters reset the cursor; booking-ID search can find an older record directly. Individual list API requests are capped at 50. Audit still accumulates matching pages within its selected guest/date scope.
- **History requirement:** this repository has the team's member/merge history, but lacks the original Assignment 1 Git ancestry. The fork/history requirement remains unresolved; see the [handover](docs/handover_note.md) and [backend comparison](docs/backend_comparison.md).

The [October 15 setup and layout verification](docs/structure_verification.md) passed a full fresh setup, 13 API tests, eight database checks, the production build and the member-file check in dedicated disposable databases. The original demo data was preserved. The saved [PostgreSQL](performance/postgres_execution_stats.json), [raw EXPLAIN log](performance/postgres_explain_analyzes.txt) and [MongoDB](performance/mongo_execution_stats.json) plan files retain their historical measurement dates.

## 3. Technology choices

| Technology                           | Role and reason for choosing it                                                                             |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| React 19                             | Shared components and state for the six main application screens, dialogs and guest switching               |
| Vite 7                               | Frontend development server, API proxy and production asset build                                           |
| Node.js + Express 5                  | Small HTTP API and production static-file server; keeps database credentials on the server                  |
| PostgreSQL 16                        | Wallet integrity, atomic bookings, constraints, audit triggers, window analytics and materialized summaries |
| MongoDB 7.0                          | Flexible amenities/reviews, geospatial search, TTL sessions and aggregation pipelines                       |
| `pg` and `mongodb`                   | API drivers that call the existing SQL workflows and shared MongoDB builders                                |
| Python + `psycopg`, `pymongo`, Faker | Repeatable seed generation, SQL COPY and bounded document batches                                           |
| Leaflet + OpenStreetMap              | Interactive origin selection, radius/pins and attributed map tiles                                          |
| Inline SVG + Lucide React            | Revenue/review charts and icons without an additional chart library                                         |
| Shared CSS                           | Consistent colors, spacing, controls and responsive layouts across all members                              |
| Docker Compose                       | Dedicated database engines with health checks and persistent named volumes                                  |

[package-lock.json](package-lock.json) records the JavaScript dependency versions; [data_generation/requirements.txt](data_generation/requirements.txt) pins the seeder packages.

### Project structure

| Path | Purpose |
| --- | --- |
| [docs/](docs/) | Handover, API sketch, reports, designs and screenshots |
| [docs/members/](docs/members/README.md) | Combined guide and all four individual member READMEs |
| [web/](web/) | Frontend bootstrap/styles and screens under `web/src/members/memberN/` |
| [api/](api/) | Server composition/shared helpers and routes under `api/members/memberN/` |
| [sql/](sql/) | Assignment 1 SQL entry points and canonical `sql/members/memberN/` scripts |
| [mongo/](mongo/) | Assignment 1 MongoDB entry points and `mongo/members/member4/` implementations |
| [data_generation/](data_generation/) | Stable seed commands and member-owned seeders |
| [tests/](tests/README.md) | Shared harness/database checks and `tests/members/memberN/` cases |
| [scripts/](scripts/) | Setup, development, verification and packaging commands |
| `dist/` | Generated production output, ignored by Git |
| `.env` | Local database configuration, ignored by Git |

The submission retains the required `docs/`, `sql/`, `mongo/`, `data_generation/`, `api/` and `web/` folders. Member ownership is retained inside each layer. All five member guides are included below. The final packager places these files under `14_a1b/` inside `14_a1b.zip`.

## 4. Screenshots and designs

### Application screenshots

These are saved captures of the running application. The full-size images are available by opening their links.

| Browse                                               | Book a stay                                                                       |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| ![Browse properties](docs/screenshots/01_browse.png) | ![Successful booking and wallet receipt](docs/screenshots/02_booking_success.png) |

| Wallet audit                                               | Revenue analytics                                                                  |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| ![Guest wallet audit trail](docs/screenshots/03_audit.png) | ![Revenue chart, ranks and materialized totals](docs/screenshots/04_analytics.png) |

| Search map                                                      | Reviews and amenities                                                    |
| --------------------------------------------------------------- | ------------------------------------------------------------------------ |
| ![Nearby search pins and hotspots](docs/screenshots/05_map.png) | ![Review facets and property amenities](docs/screenshots/06_reviews.png) |

Additional captures: [insufficient balance](docs/screenshots/02a_insufficient_balance.png), [active-stay conflict](docs/screenshots/02b_active_stay_conflict.png), [booking status](docs/screenshots/02c_booking_status.png), [mobile Browse](docs/screenshots/08_mobile_browse.png), [mobile Reviews](docs/screenshots/07_mobile_reviews.png).

### Figma and wireframes

- [StaySpot Figma file](https://www.figma.com/design/0D2LeVzcuIvgOIi6pzxWED/StaySpot?node-id=6-3138).
- [Offline design gallery](docs/design/preview.html): 15 UI designs and 14 wireframes, with member filters and SVG/PNG downloads. Open this HTML file locally; running the application is not required.
- [UI mockups](docs/design/ui-mockups/) and [wireframes](docs/design/wireframes/), including complete native board exports.
- [Design export guide](docs/design/README.md), [users and visual style](docs/design/users_and_style.md), and [additional edge-state review](docs/design/review/README.md).

Figma exports are design artifacts, listed separately from the application screenshots above. The extra interaction-state board exists only on the Figma UI page.

## 5. Contribution table

The responsibilities follow the agreed four-member allocation. Names and confirmed roll numbers come from the team's README edits. Members 3 and 4 previously repeated Member 1's roll number; their correct numbers need team confirmation.

| Member   | Name                     | Roll number     | Assigned contribution                                                               | Source folder                        |
| -------- | ------------------------ | --------------- | ----------------------------------------------------------------------------------- | ------------------------------------ |
| Member 1 | `Anant Preet Singh Reen` | `2026201026`    | Browse, Property Details, shared React components, PostgreSQL schema; screens 00–02 | [member1](docs/members/member1/README.md) |
| Member 2 | `Aditya Mittal`          | `2026201055`    | Booking, Status Transition, Wallet Audit, procedure/indexes/triggers; screens 03–05 | [member2](docs/members/member2/README.md) |
| Member 3 | `Varshitha Vallabhadasu` | To be confirmed | Analytics, window functions and materialized summaries; screen 06                   | [member3](docs/members/member3/README.md) |
| Member 4 | `Ashish Soni`            | To be confirmed | Map, Reviews and MongoDB pipelines; screens 07–08                                   | [member4](docs/members/member4/README.md) |

The folder allocation documents responsibilities; it does not establish personal authorship of inherited code. The full inherited/current comparison is in the [backend handover evidence](docs/backend_comparison.md).

## 6. Repository, final commit and demo

| Item                             | Value                                                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Repository URL                   | [https://github.com/anantreen/StaySpot_A1B](https://github.com/anantreen/StaySpot_A1B)                      |
| Final submitted commit hash      | Recorded automatically in the final ZIP by the packaging command below                                      |
| Demo video link                  | [Watch the walkthrough](https://drive.google.com/file/d/1QPTfYh7q5jZCB6puoEIr3Hwl4Dp5VEW_/view?usp=sharing) |
| Team number                      | `14`                                                                                                        |
| Original Assignment 1 repository | [git-adityamishra/27_a1](https://github.com/git-adityamishra/27_a1)                                         |
| Original reference commit        | `774fbd2f33463c3e88352bdb0b7988165c65abcf`                                                                  |

The current committed base is `d2d9f29c0265a807bd6d21699834260e31815bbc`; the recovered files must be reviewed, committed and pushed before final submission. From the resulting clean checkout, generate the final archive:

```bash
python scripts/package_submission.py --assignment 2 --team 14 --repo-url https://github.com/anantreen/StaySpot_A1B
```

Supporting documents: [handover note](docs/handover_note.md), [API endpoints](docs/api_endpoints.md).

## 7. Member documentation (all five READMEs)

The following sections include the full content of **docs/members/README.md** and **docs/members/member1–4/README.md**. Links are adjusted for this root README. The original guides remain available in their member folders; this consolidated copy reflects them when this README was generated.

<details>
<summary>Shared member organization — docs/members/README.md</summary>

Source: [docs/members/README.md](docs/members/README.md).

<!-- BEGIN INCLUDED README: docs/members/README.md -->

### Four-member code organization

All four member folders are present in the merged StaySpot application. Each member owns related UI, API and database files; shared entry points connect them into one project. Run installation, setup, build and startup commands from the repository root.

| Member   | Responsibility                                                            | Assigned Figma screens                                                            | Member guide                          |
| -------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| Member 1 | Browse, Property Details, shared React foundations and PostgreSQL schema  | 00 Foundations & Users; 01 Browse; 02 Property Details                            | [Member 1](docs/members/member1/README.md) |
| Member 2 | Booking, Status Transition, Wallet Audit, procedure, indexes and triggers | 03 Transaction / Book Stay; 04 Booking Status & Constraint; 05 Wallet Audit Trail | [Member 2](docs/members/member2/README.md) |
| Member 3 | Analytics, window functions and materialized summaries                    | 06 Analytics                                                                      | [Member 3](docs/members/member3/README.md) |
| Member 4 | Map, Reviews, MongoDB pipelines, validators and indexes                   | 07 Map / Search Hotspots; 08 Reviews & Amenities                                  | [Member 4](docs/members/member4/README.md) |

#### Folder ownership

```text
members/
├── README.md
├── member1/
│   ├── web/                 App, Browse, PropertyDetails
│   │   ├── components/      Shared UI, dialogs, loading and error recovery
│   │   ├── hooks/           useData, useBookingHistory
│   │   └── lib/             API client, query, formatting and validation
│   ├── api/                 Health and guest/property/booking read routes
│   ├── sql/                 Relational schema and booking browse indexes
│   └── tests/               Browse, details and bounded booking pagination
├── member2/
│   ├── web/                 Transaction, BookingStatusAction, Audit
│   │   └── hooks/           useAuditHistory
│   ├── api/                 Booking creation, status updates and audit reads
│   ├── sql/                 Indexes, wallet trigger, audit guards and procedure
│   ├── data_generation/     PostgreSQL seeder
│   └── tests/               Wallet, status, rollback, concurrency and audit
├── member3/
│   ├── web/                 Analytics and LineChart
│   ├── api/                 Analytics reads and materialized refresh
│   ├── sql/                 Materialized summaries and window analytics
│   └── tests/               Moving averages, ranks and materialized refresh
└── member4/
    ├── web/                 MapView and Reviews
    ├── api/                 Search, hotspots, reviews and amenities
    ├── mongo/               Validators, indexes, builders and shell workflows
    ├── data_generation/     MongoDB seeder
    └── tests/               Geospatial search, reviews and validators
```

#### Shared integration

- [web/src/main.jsx](web/src/main.jsx) mounts the React application; [web/src/style.css](web/src/style.css) contains the shared styles.
- [api/app.js](api/app.js) registers all four route modules; [api/server.js](api/server.js) owns connections, listening and shutdown. [api/shared/](api/shared) contains HTTP validation and reusable SQL fragments.
- Root [sql/](sql) files delegate to member-owned SQL through PostgreSQL's relative `\ir` includes. Root [mongo/](mongo) files use `load()` or shared exports. Root [data_generation/](data_generation) Python entry points delegate through `runpy`.
- Browse imports Member 2's booking status action. All feature screens reuse Member 1's components and helpers.
- These folders describe assigned responsibilities. Team names, roll numbers and confirmed personal contributions belong in the project contribution table.

#### Running and verification

Follow the [project README](README.md) for prerequisites, first-time setup, later starts and graceful shutdown. The root [test entry point](tests/workflows.test.js) loads all four members' test files. Run `npm test` against dedicated seeded test databases; these integration tests create fixtures and refresh summaries. The [setup and layout verification](docs/structure_verification.md) records 13 passing API tests, eight database checks and a full fresh setup. Earlier performance logs retain their original dates.

The [code walkthrough](docs/code_walkthrough.md) explains the implementation. The [Figma export guide](docs/design/README.md) and [offline gallery](docs/design/preview.html) provide 15 UI designs and 14 wireframes with SVG/PNG downloads and member filters. Property Details is a modal; Booking Status is part of Browse → Bookings.

<!-- END INCLUDED README: docs/members/README.md -->

</details>

<details>
<summary>Member 1: Browse and shared foundations — docs/members/member1/README.md</summary>

Source: [docs/members/member1/README.md](docs/members/member1/README.md).

<!-- BEGIN INCLUDED README: docs/members/member1/README.md -->

### Member 1 — Browse, Property Details and shared foundations

Assigned Figma screens: **00 Foundations & Users**, **01 Browse**, **02 Property Details**.

| Area                                                           | Source                                                                                                                                                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Application layout, navigation and demo guest switching        | [web/App.jsx](web/src/members/member1/App.jsx)                                                                                                                         |
| Properties, guests and bookings browsing                       | [web/Browse.jsx](web/src/members/member1/Browse.jsx)                                                                                                                   |
| Record detail dialog, loading and GET retry                    | [web/PropertyDetails.jsx](web/src/members/member1/PropertyDetails.jsx)                                                                                                 |
| Shared display, form, status, pagination and dialog components | [web/components/](web/src/members/member1/components)                                                                                                                  |
| Page-not-found and render-error recovery                       | [web/components/PageState.jsx](web/src/members/member1/components/PageState.jsx), [web/components/ErrorBoundary.jsx](web/src/members/member1/components/ErrorBoundary.jsx) |
| Request state and stale-response handling                      | [web/hooks/useData.js](web/src/members/member1/hooks/useData.js)                                                                                                       |
| Newest-first booking display                                   | [web/hooks/useBookingHistory.js](web/src/members/member1/hooks/useBookingHistory.js)                                                                                   |
| API client, formatting and query helpers                       | [web/lib/](web/src/members/member1/lib)                                                                                                                                |
| Shared nights, date and coordinate validation                  | [web/lib/validation.js](web/src/members/member1/lib/validation.js)                                                                                                     |
| Health, browse and detail API handlers                         | [api/routes.js](api/members/member1/routes.js)                                                                                                                     |
| Relational schema and ERD                                      | [sql/01_schema_ddl.sql](sql/members/member1/01_schema_ddl.sql), [ERD](docs/relational_erd.png)                                                                     |
| Newest-first booking indexes                                   | [sql/07_booking_pagination_indexes.sql](sql/members/member1/07_booking_pagination_indexes.sql)                                                                     |
| Member regression tests                                        | [tests/workflows.cases.js](tests/members/member1/workflows.cases.js)                                                                                               |

#### Implementation notes

- Shared visual styles live in [style.css](web/src/style.css); user journeys are described in [users_and_style.md](docs/design/users_and_style.md).
- All three entities use API cursor pages. Bookings load 20 rows per request, ordered by creation time and ID descending, with a browse window of the latest 1,000 matching records. Search, status and selected-guest filters run before pagination; a booking-ID lookup can find an older record outside the unfiltered window.
- Booking cursors preserve microseconds, include an ID tie-breaker and reset when filters change. Back/Next and status-action reloads fetch only the current page; the browser does not accumulate booking rows.
- Request identity and cleanup prevent late data from one entity, guest or filter from appearing in another view.
- Browse reuses [Member 2's status action](web/src/members/member2/BookingStatusAction.jsx). The other members reuse this folder's UI components and helpers.

Run project commands from the repository root; see the [project README](README.md) and [combined ownership guide](docs/members/README.md). The [member regression cases](tests/members/member1/workflows.cases.js) run through root `npm test` against dedicated seeded test databases. Source comments and the [code walkthrough](docs/code_walkthrough.md) explain state, handlers and failure paths.

<!-- END INCLUDED README: docs/members/member1/README.md -->

</details>

<details>
<summary>Member 2: Booking, status and audit — docs/members/member2/README.md</summary>

Source: [docs/members/member2/README.md](docs/members/member2/README.md).

<!-- BEGIN INCLUDED README: docs/members/member2/README.md -->

### Member 2 — Booking, status and wallet audit

Assigned Figma screens: **03 Transaction / Book Stay**, **04 Booking Status & Constraint**, **05 Wallet Audit Trail**.

| Area                                            | Source                                                                                   |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Booking form, quote, wallet changes and receipt | [web/Transaction.jsx](web/src/members/member2/Transaction.jsx)                               |
| Check in / Complete stay action inside Browse   | [web/BookingStatusAction.jsx](web/src/members/member2/BookingStatusAction.jsx)               |
| Read-only ledger, date filters and balances     | [web/Audit.jsx](web/src/members/member2/Audit.jsx)                                           |
| Newest-first guest/date audit display           | [web/hooks/useAuditHistory.js](web/src/members/member2/hooks/useAuditHistory.js)             |
| Booking POST, status PATCH and audit GET        | [api/routes.js](api/members/member2/routes.js)                                           |
| Active-stay and query indexes                   | [sql/02_indexes.sql](sql/members/member2/02_indexes.sql)                                 |
| Wallet trigger and append-only audit guards     | [sql/03_triggers_and_audit.sql](sql/members/member2/03_triggers_and_audit.sql)           |
| Server-priced atomic booking procedure          | [sql/04_stored_procedures.sql](sql/members/member2/04_stored_procedures.sql)             |
| PostgreSQL seed generation                      | [data_generation/postgres_seeder.py](data_generation/members/member2/postgres_seeder.py) |
| Member regression tests                         | [tests/workflows.cases.js](tests/members/member2/workflows.cases.js)                     |

#### Implementation notes

- The API borrows one PostgreSQL connection, starts a transaction, locks the guest, calls the procedure and commits or rolls back before replying.
- The procedure calculates property price × nights, conditionally deducts the wallet and inserts the booking. The wallet trigger adds the audit entry in the same transaction.
- Legal status progression is CONFIRMED → CHECKED_IN → COMPLETED. The partial unique index permits at most one CHECKED_IN stay per guest.
- The audit API uses timestamp/ID cursors with microsecond precision. The frontend fetches the selected guest/date scope and reverses it for newest-first display; saved running balances remain intact.
- Shared UI and HTTP validation helpers are imported. The root SQL and seeder filenames delegate to this member's implementations.

Run project commands from the repository root; see the [project README](README.md) and [combined ownership guide](docs/members/README.md). The [member regression cases](tests/members/member2/workflows.cases.js) run through root `npm test` against dedicated seeded test databases. The [code walkthrough](docs/code_walkthrough.md) explains transactions, rollback and error paths.

<!-- END INCLUDED README: docs/members/member2/README.md -->

</details>

<details>
<summary>Member 3: Analytics — docs/members/member3/README.md</summary>

Source: [docs/members/member3/README.md](docs/members/member3/README.md).

<!-- BEGIN INCLUDED README: docs/members/member3/README.md -->

### Member 3 — Analytics, windows and materialized summaries

Assigned Figma screen: **06 Analytics**.

| Area                                             | Source                                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------------------ |
| Totals, date controls and ranked analytics table | [web/Analytics.jsx](web/src/members/member3/Analytics.jsx)                         |
| Seven-day revenue SVG chart                      | [web/LineChart.jsx](web/src/members/member3/LineChart.jsx)                         |
| Analytics GET and materialized refresh POST      | [api/routes.js](api/members/member3/routes.js)                                 |
| Materialized totals and concurrent refresh       | [sql/05_materialized_views.sql](sql/members/member3/05_materialized_views.sql) |
| CTEs, moving averages and DENSE_RANK             | [sql/06_window_analytics.sql](sql/members/member3/06_window_analytics.sql)     |
| Member regression tests                          | [tests/workflows.cases.js](tests/members/member3/workflows.cases.js)           |

#### Implementation notes

- Analytics uses UTC dates, zero-filled days and six earlier warm-up days for seven-day averages.
- Daily dense ranks compare the selected properties on the same date. The default cohort is the top 12 properties by lifetime materialized revenue; the chart draws four series.
- The API accepts 1–90 inclusive days. The database function pre-aggregates selected bookings before joining its property/day calendar.
- Materialized totals contain bookings, actual nights and gross revenue. Refresh uses the database function and records its completion timestamp.
- Invalid date controls show inline errors. Background refresh retains the previous valid results while loading.

Run project commands from the repository root; the root SQL entry points retain their dependency order. The [member regression cases](tests/members/member3/workflows.cases.js) run through root `npm test` against dedicated seeded test databases. See the [project README](README.md), [combined ownership guide](docs/members/README.md), [code walkthrough](docs/code_walkthrough.md) and [performance analysis](docs/performance_and_complexity.md). Saved performance measurements describe their recorded scopes and earlier environments.

<!-- END INCLUDED README: docs/members/member3/README.md -->

</details>

<details>
<summary>Member 4: Map and reviews — docs/members/member4/README.md</summary>

Source: [docs/members/member4/README.md](docs/members/member4/README.md).

<!-- BEGIN INCLUDED README: docs/members/member4/README.md -->

### Member 4 — Map, reviews and MongoDB

Assigned Figma screens: **07 Map / Search Hotspots**, **08 Reviews & Amenities**.

| Area                                             | Source                                                                                                                                                     |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Interactive origin, search map and polling       | [web/MapView.jsx](web/src/members/member4/MapView.jsx)                                                                                                         |
| Review charts and flexible amenities             | [web/Reviews.jsx](web/src/members/member4/Reviews.jsx)                                                                                                         |
| Search GET/POST and reviews GET                  | [api/routes.js](api/members/member4/routes.js)                                                                                                             |
| Nearest pins and hotspot grid cells              | [mongo/geospatial.cjs](mongo/members/member4/geospatial.cjs)                                                                                               |
| Indexed property-scoped review facets            | [mongo/review-facets.cjs](mongo/members/member4/review-facets.cjs)                                                                                         |
| Shared pipeline exports                          | [mongo/pipelines.cjs](mongo/members/member4/pipelines.cjs)                                                                                                 |
| Collection validators and geo/TTL/review indexes | [mongo/01_collections_and_indexes.js](mongo/members/member4/01_collections_and_indexes.js)                                                                 |
| Independent shell workflows                      | [mongo/02_workflow3_geonear.js](mongo/members/member4/02_workflow3_geonear.js), [mongo/03_workflow4_facet.js](mongo/members/member4/03_workflow4_facet.js) |
| MongoDB seed generation                          | [data_generation/mongo_seeder.py](data_generation/members/member4/mongo_seeder.py)                                                                         |
| Member regression tests                          | [tests/workflows.cases.js](tests/members/member4/workflows.cases.js)                                                                                       |

#### Implementation notes

- Search uses a 5 km radius, explicit 15/60/120-minute UI filters and 15-second polling.
- The nearest list returns up to 100 pins in distance order. A separate pipeline groups all qualifying pins into approximate grid hotspots and returns up to 25 cells.
- Search sessions have a two-hour TTL. An explicit query cutoff enforces recency before asynchronous TTL deletion completes.
- Review facets match the selected property/date scope before computing rating distribution, top tags, average and count. The UI also shows that property's flexible amenities catalog.
- The API and root MongoDB shell workflows reuse the same pure builders. Coordinates are stored as GeoJSON [longitude, latitude].
- Tile failures, empty recent searches, missing reviews and empty catalogs have dedicated UI feedback.

Run npm commands and MongoDB shell workflows from the repository root. The [member regression cases](tests/members/member4/workflows.cases.js) run through root `npm test` against dedicated seeded test databases. See the [project README](README.md).

<!-- END INCLUDED README: docs/members/member4/README.md -->

</details>
