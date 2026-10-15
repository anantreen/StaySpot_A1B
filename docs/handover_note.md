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

## 4. Verification for this handover

- **Build:** `npm run build` passed.
- **Running app:** nine read-only HTTP requests passed, covering HTML, health and every read workflow; an unknown API returned the expected 404. Both databases answered health checks. Map search had zero qualifying pins; no data was inserted.
- **Limits:** fresh setup, booking writes, concurrency and rollback were not rerun. October 7 clone/test logs concern an earlier version. Test sources are currently deleted; historical pass counts are not current results.

## 5. Remaining issues and suggestions

- Resolve fork/history compliance while preserving the team's contributions and source attribution.
- Newest-first bookings download all matching pages before sorting, conflicting with the brief's no-all-50,000-rows rule. Audit similarly accumulates its guest/date scope.
- Explain API-owned transaction boundaries in the viva. Plain `BEGIN` does not explicitly request REPEATABLE READ; Project 3's supplied brief does not explicitly require that level.
- Suggestions for the original authors: propagate failures, align IDs, generate coherent ledgers and compare equal query scopes. This is a local demo without authentication or production migrations; privileged owners can bypass audit triggers.
