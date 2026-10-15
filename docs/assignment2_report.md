# Assignment 2 — StaySpot front-end design report

The current folder is **StaySpot_A1B**; the product is **StaySpot**. All four member sections are merged. The backend derives from the corrected Assignment 1 implementation, but this repository does not retain the original Assignment 1 Git ancestry. The [October 15 handover](handover_note.md) and [backend comparison](backend_comparison.md) distinguish verified current behavior from the historical evidence below.

## Requirement audit

| Requirement | Status and evidence |
|---|---|
| Understand and run inherited system | Current build and read-only endpoints passed; handover distinguishes inherited foundations and source defects. Original unmodified setup was not rerun in the October 15 review |
| Preserve Assignment 1 Git history | Outstanding: StaySpot_A1B has a separate root and lacks the original commit; source attribution does not satisfy history preservation |
| Document every backend change | Point-by-point handover and linked original/current backend comparison document schema, transactions, analytics, MongoDB, seeders, setup and API additions |
| API sketch before UI code | docs/api_endpoints.md created before screens; inputs/outputs and workflow mapping retained |
| Users and goals | Guest and property-manager/analyst journeys in docs/design/users_and_style.md |
| Wireframes before implementation | Six SVG wireframes in docs/design/, one per required screen |
| Consistent visual design | Forest green, paper, terracotta; shared cards/buttons/forms/tables/dialogs; native fonts |
| Browse all three entities | Properties, guests and bookings with filters and details; booking display pagination currently follows an all-matching-record fetch |
| No all-record browser load | Not satisfied for newest-first bookings: browser reads all matching pages before sorting. Individual API requests are capped at 50; that does not bound total browser loading |
| Transaction workflow | PostgreSQL CALL create_booking within BEGIN/COMMIT; before/after wallet and trigger audit displayed |
| Friendly transaction failures | Insufficient balance and second active stay shown in browser and API tests; failing writes roll back |
| Read-only audit, date filter, running balance | API has chronological timestamp/id cursors; frontend loads the selected guest/date scope and reverses it for newest-first display, preserving stored balance snapshots |
| Seven-day chart and ranked table | Same Part A revenue_analytics function; top 12 cohort table, top four chart, real DENSE_RANK ties |
| Materialized summaries and refresh | Actual nights/revenue/bookings totals, last-completed refresh timestamp, concurrent refresh button |
| Map with selectable origin and 5 km radius | Leaflet map click or latitude/longitude form; geo query radius enforced by MongoDB |
| Nearest results and live changes | 100 pins sorted by distance, 25 grid hotspots; 15-second polling and add-pin action |
| Review charts from $facet | Indexed property-scoped rating distribution, tag frequencies and overall property average |
| Flexible catalog readable | Nested amenities groups, house rules and accessibility shown as readable sections |
| Loading/empty/error states | Shared resource state and retry UI; empty results explain filters; friendly API errors |
| Responsive laptop/phone | Normal laptop viewport and 390 × 844 phone checks; all six nav destinations visible, no page overflow |
| Simple actor switching | Paged guest search in header dialog updates actor name, wallet and actor-specific views |
| Booking status progression | CONFIRMED → CHECKED_IN → COMPLETED; UI and tests demonstrate uniqueness-slot release |
| Thoughtful tests | Historical logs record 12 API and eight database passes; current test sources are deleted and those passes are not a current run |
| Reproducible setup | README, npm lockfile, env example, setup script, Docker services; local verification .env ignored |
| Short demo and screenshots | Captioned live-browser screen walkthrough and recorded screenshots; demo method disclosed |
| Tech choices and assumptions | README and design document explain React/Vite, Express, PostgreSQL/MongoDB, Leaflet, inline SVG |
| Contribution table and final team metadata | Editable template provided; actual members/roll numbers/contributions pending |
| GitHub fork URL and final commit | Submission repository exists; original ancestry is missing, fork compliance remains unresolved, and final published SHA must be recorded |
| Prescribed ZIP filename, strict <20 MB, exclusions | Team must verify the final archive; the old packaging helper is deleted and is not a current automated check |
| Moodle submission and viva | Pending team action; not claimed |

## Application architecture

React enters through web/src/main.jsx; feature screens and reusable UI are grouped under members/member1 through members/member4. Express enters through api/app.js, which registers the four members’ unchanged route handlers; api/server.js manages database connections and serves the production Vite build. The browser never holds database credentials. PostgreSQL owns financial integrity and analytics; MongoDB runs the exact shared $geoNear/$facet builders imported by the original JS workflow scripts.

API code validates IDs, nights, date periods, pagination and coordinates; SQL values are parameterized. Booking costs supplied by clients cannot override the database price. A per-guest lock makes before/after wallet reporting consistent; row updates serialize competing deductions. Error codes become short messages instead of internal SQL stack traces. Local-demo identity switching is intentionally not authentication.

## Front-end quality and complexity

Backend list endpoints use keyset cursors and limit+1 instead of increasingly expensive OFFSET values or repeated COUNT(*). Actor/property selectors and ordinary property/guest browsing use bounded pages. However, the frontend newest-first booking implementation accumulates all matching pages and sorts them: O(M) retained records and O(M log M) sorting for M matches. Audit accumulates the selected guest/date scope and reverses it in O(A) time/space for A records. These are current limitations, even though only one display page is rendered. Audit API cursors preserve microseconds and an ID tie-breaker. PostgreSQL DATE values remain calendar strings.

Default analytics outputs at most 12 × 90 day rows, plus 12 summary rows, and the chart draws only four series. Map output is at most 100 pins and 25 clusters; processing nearby candidates is still performed in MongoDB. Reviews process all matching reviews for the selected property/date scope, not a statistical sample. UI render time is O(page rows) for browsing, O(CW) for analytics, O(100+25) output markers for the map, and O(5+10+catalog fields) for review presentation. Database work is analyzed separately in [performance_and_complexity.md](performance_and_complexity.md).

## Evidence and limits

See performance/api_test_results.txt, performance/database_test_results.txt, performance/build_results.txt, raw explain files and docs/browser_verification.md for historical evidence. These records do not establish a current suite run or current live counts. The October 15 production build and ten read-only HTTP results are recorded separately in [backend_comparison.md](backend_comparison.md#4-current-verification-results); no database mutations were performed for that review. Current test sources are deleted from the working tree.

The existing demo walkthrough uses actual browser captures with captions. OpenStreetMap tiles require internet, while query results come from local MongoDB. TTL intentionally expires telemetry; the Map's Add pin action can demonstrate a fresh search. The old replenishment helper is deleted. Setup targets empty databases and refuses an existing StaySpot schema/data; refusal alone does not establish a completed seed. The team must resolve fork/history compliance, fill metadata, publish the final version, verify the Moodle archive and complete the viva.

## Four-member source split

The source organization groups UI functions, route registrations, SQL/MongoDB scripts and seeders into four member folders matching the responsibility/Figma table. Root entry points delegate to those implementations. See [the ownership map](../members/README.md). The saved [split verification](../performance/member_split_verification.txt) concerns the earlier reorganization; later UI fixes and current test-source deletions are documented separately.
