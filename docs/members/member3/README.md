# Member 3 — Analytics, windows and materialized summaries

Assigned Figma screen: **06 Analytics**.

| Area                                             | Source                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Totals, date controls and ranked analytics table | [web/src/members/member3/Analytics.jsx](../../../web/src/members/member3/Analytics.jsx)                 |
| Seven-day revenue SVG chart                      | [web/src/members/member3/LineChart.jsx](../../../web/src/members/member3/LineChart.jsx)                 |
| Analytics GET and materialized refresh POST      | [api/members/member3/routes.js](../../../api/members/member3/routes.js)                                 |
| Materialized totals and concurrent refresh       | [sql/members/member3/05_materialized_views.sql](../../../sql/members/member3/05_materialized_views.sql) |
| CTEs, moving averages and DENSE_RANK             | [sql/members/member3/06_window_analytics.sql](../../../sql/members/member3/06_window_analytics.sql)     |
| Member regression tests                          | [tests/members/member3/workflows.cases.js](../../../tests/members/member3/workflows.cases.js)           |

## Implementation notes

- Analytics uses UTC dates, zero-filled days and six earlier warm-up days for seven-day averages.
- Daily dense ranks compare the selected properties on the same date. The default cohort is the top 12 properties by lifetime materialized revenue; the chart draws four series.
- The API accepts 1–90 inclusive days. The database function pre-aggregates selected bookings before joining its property/day calendar.
- Materialized totals contain bookings, actual nights and gross revenue. Refresh uses the database function and records its completion timestamp.
- Invalid date controls show inline errors. Background refresh retains the previous valid results while loading.

Run project commands from the repository root; the root SQL entry points retain their dependency order. The [member regression cases](../../../tests/members/member3/workflows.cases.js) run through root `npm test` against dedicated seeded test databases. See the [project README](../../../README.md), [combined ownership guide](../README.md), [code walkthrough](../../code_walkthrough.md) and [performance analysis](../../performance_and_complexity.md). Saved performance measurements describe their recorded scopes and earlier environments.
