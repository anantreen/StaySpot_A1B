# StaySpot handover note

Reviewed **15 October 2026** against the current `StaySpot_A1B` working tree. See the [backend comparison](backend_comparison.md) for source links, Git evidence and verification details.

## 1. Source and history

- **Original:** [git-adityamishra/27_a1](https://github.com/git-adityamishra/27_a1), commit `774fbd2f33463c3e88352bdb0b7988165c65abcf`. Compared committed source using `git show`, excluding local corrections.
- **Current:** `StaySpot_A1B`, branded **StaySpot**, with all four member sections merged.
- **Correction:** `StaySpotAI` retains the original ancestry; `StaySpot_A1B` has a separate root and lacks those commits. The previous handover's history claim was incorrect. The brief's history-preservation requirement remains unmet.

## 2. Useful inherited foundations

- Relational entities, foreign keys, coordinate checks, the active-stay partial unique index and a balance-guarded wallet update already existed.
- The wallet trigger, materialized-view unique index, calendar/window query, geospatial index, two-hour TTL and review facets also came from the original authors.

## 3. Problems and documented changes

- **Transactions:** the old procedure terminated transactions inside an exception-handling block. The revised procedure propagates errors; one API connection commits or rolls back the wallet, booking and audit together. Price now comes from database price × nights.
- **Schema/audit:** nullable wallets, absent nights and editable ledger history were weaknesses. Added financial constraints, nights, defaults, action/sign checks and audit UPDATE/DELETE/TRUNCATE guards.
- **Analytics:** replaced full-history calendar expansion with selected-property/date pre-aggregation, six warm-up days and zero-filled dates. Ranks now compare properties on each day. Materialized totals include actual nights and refresh-completion time.
- **MongoDB:** added collection validators, review property/date indexes and matching, shared pipelines, explicit search recency and grid hotspots. Preserved the five-kilometre radius and two-hour TTL.
- **Seed/setup:** replaced fabricated audit balances with trigger-generated entries; aligned MongoDB IDs with SQL records and used COPY/bulk batches. Setup checks dependencies and refuses used databases before writing; refusal alone does not prove completed seeding.
- **Application:** added the HTTP/React layer to the inherited database scripts. Member-owned routes validate inputs and translate errors. Later navigation/loading/recovery fixes are listed in the [UI review](design/review/README.md).
- **Booking browsing follow-up:** replaced the frontend all-pages sorter with one 20-row server page at a time, ordered by creation timestamp and ID descending. Filter-scoped microsecond cursors stop each traversal at 1,000 matching records. Added global/guest/status pagination indexes through an idempotent SQL upgrade; financial data and booking-write procedures are unchanged.

## 4. Verification for this handover

- **Build:** `npm run build` passed.
- **Running app:** nine read-only HTTP requests passed, covering HTML, health and every read workflow; an unknown API returned the expected 404. Both databases answered health checks. Map search had zero qualifying pins; no data was inserted.
- **Limits:** fresh setup, booking writes, concurrency and rollback were not rerun. October 7 clone/test logs concern an earlier version. Test sources are currently deleted; historical pass counts are not current results.
- **Pagination follow-up:** a temporary-table check exercised 1,105 fixtures, timestamp ties, microsecond boundaries, filters, malformed cursors, record details and the exact 1,000-record stop. Browser checks covered page navigation and a status change against those temporary fixtures. Index installation preserved live booking/audit counts and wallet totals. No deleted tests were restored; this is targeted verification, not a restored test-suite run.
- **Live pagination reads:** health passed for both databases. The first two booking pages returned 20 rows each in the same order as PostgreSQL's timestamp/ID query; combined guest/status filters and a booking detail lookup also passed. These checks did not write live data.

## 5. Remaining issues and suggestions

- Resolve fork/history compliance while preserving the team's contributions and source attribution.
- Audit still accumulates its selected guest/date scope. The booking all-pages load has been fixed; initialized databases need the documented `07_booking_pagination_indexes.sql` upgrade.
- Explain API-owned transaction boundaries in the viva. Plain `BEGIN` does not explicitly request REPEATABLE READ; Project 3's supplied brief does not explicitly require that level.
- Suggestions for the original authors: propagate failures, align IDs, generate coherent ledgers and compare equal query scopes. This is a local demo without authentication or production migrations; privileged owners can bypass audit triggers.
