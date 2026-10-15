# Submission layout verification — 15 October 2026

The implementation now follows the submission's layers while retaining member ownership inside each layer:

| Layer                   | Member code                                                     |
| ----------------------- | --------------------------------------------------------------- |
| Frontend                | `web/src/members/member1–4/`                                    |
| API                     | `api/members/member1–4/`                                        |
| PostgreSQL              | `sql/members/member1–3/`                                        |
| MongoDB                 | `mongo/members/member4/`                                        |
| Seed generation         | `data_generation/members/member2/` and `member4/`               |
| Regression cases        | `tests/members/member1–4/`                                      |
| Ownership documentation | `docs/members/README.md` and `docs/members/member1–4/README.md` |

The root `sql/`, `mongo/` and `data_generation/` entry points remain available. Their include/delegation paths, API registration, frontend bootstrap, test runner, ownership manifest and packaging references point to the moved files. The Git ignore exception for frontend `lib/` helpers was moved too, so fresh clones include those files.

## Code preservation

- **55 member files moved**, including five READMEs and 50 code files.
- **33 code files remain byte-for-byte identical.** The other 17 have only relative import-path edits. Feature handlers, SQL queries, schemas, triggers, procedures, MongoDB pipeline logic and seed logic were preserved.
- Production **HTML, JavaScript and CSS are byte-for-byte identical** to a build taken before the move. The existing stylesheet and application behavior are unchanged.
- Root commands remain `npm run dev`, `npm run build`, `npm start`, `npm test` and `npm run db:setup`.

## Verification

A fresh source copy installed the locked JavaScript dependencies from the local npm cache and used the installed Python dependencies. It ran against uniquely named disposable databases on the existing PostgreSQL/MongoDB engines.

- Full first-run setup passed: 1,000 guests, 2,000 properties, 50,000 bookings, 100,000 audits, 500,000 search sessions, 50,000 reviews and 2,000 amenities catalogs.
- **13 API tests passed**, including financial atomicity, concurrent spending, audit immutability, status progression and the 1,000-booking browse cap.
- **8 database checks passed**, including assignment-scale counts, constraints, indexes and preserved query-plan evidence.
- The fresh-copy production build and all four member-file checks passed.
- Browser navigation covered Browse, Book a stay, Audit trail, Analytics, Search map and Reviews, plus booking/property dialogs and Bookings → Properties navigation.
- Original demo guest/property/booking/audit counts and wallet totals were unchanged. Disposable verification databases were removed.

The [raw setup/test log](../performance/structure_verification.txt) records the fresh-copy run. The [ownership guide](members/README.md) maps the moved source. No new feature or database-data change was included in this reorganization.

The final packager retains all required layers under `<team>_a1b/` inside `<team>_a1b.zip`; the development checkout keeps its existing name.
