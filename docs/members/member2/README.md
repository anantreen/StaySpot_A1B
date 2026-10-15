# Member 2 — Booking, status and wallet audit

Assigned Figma screens: **03 Transaction / Book Stay**, **04 Booking Status & Constraint**, **05 Wallet Audit Trail**.

| Area                                            | Source                                                                                                            |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Booking form, quote, wallet changes and receipt | [web/src/members/member2/Transaction.jsx](../../../web/src/members/member2/Transaction.jsx)                       |
| Check in / Complete stay action inside Browse   | [web/src/members/member2/BookingStatusAction.jsx](../../../web/src/members/member2/BookingStatusAction.jsx)       |
| Read-only ledger, date filters and balances     | [web/src/members/member2/Audit.jsx](../../../web/src/members/member2/Audit.jsx)                                   |
| Newest-first guest/date audit display           | [web/src/members/member2/hooks/useAuditHistory.js](../../../web/src/members/member2/hooks/useAuditHistory.js)     |
| Booking POST, status PATCH and audit GET        | [api/members/member2/routes.js](../../../api/members/member2/routes.js)                                           |
| Active-stay and query indexes                   | [sql/members/member2/02_indexes.sql](../../../sql/members/member2/02_indexes.sql)                                 |
| Wallet trigger and append-only audit guards     | [sql/members/member2/03_triggers_and_audit.sql](../../../sql/members/member2/03_triggers_and_audit.sql)           |
| Server-priced atomic booking procedure          | [sql/members/member2/04_stored_procedures.sql](../../../sql/members/member2/04_stored_procedures.sql)             |
| PostgreSQL seed generation                      | [data_generation/members/member2/postgres_seeder.py](../../../data_generation/members/member2/postgres_seeder.py) |
| Member regression tests                         | [tests/members/member2/workflows.cases.js](../../../tests/members/member2/workflows.cases.js)                     |

## Implementation notes

- The API borrows one PostgreSQL connection, starts a transaction, locks the guest, calls the procedure and commits or rolls back before replying.
- The procedure calculates property price × nights, conditionally deducts the wallet and inserts the booking. The wallet trigger adds the audit entry in the same transaction.
- Legal status progression is CONFIRMED → CHECKED_IN → COMPLETED. The partial unique index permits at most one CHECKED_IN stay per guest.
- The audit API uses timestamp/ID cursors with microsecond precision. The frontend fetches the selected guest/date scope and reverses it for newest-first display; saved running balances remain intact.
- Shared UI and HTTP validation helpers are imported. The root SQL and seeder filenames delegate to this member's implementations.

Run project commands from the repository root; see the [project README](../../../README.md) and [combined ownership guide](../README.md). The [member regression cases](../../../tests/members/member2/workflows.cases.js) run through root `npm test` against dedicated seeded test databases. The [code walkthrough](../../code_walkthrough.md) explains transactions, rollback and error paths.
