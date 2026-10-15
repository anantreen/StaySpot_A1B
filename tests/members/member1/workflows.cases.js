/**
 * Member 1 integration regression cases.
 *
 * Each check names the behavior under test and asserts real HTTP/database results.
 * Fixtures come from tests/helpers.js; these cases keep their previous assertions.
 */

import assert from "node:assert/strict";
import { check, request, pool } from "../../helpers.js";

// Regression: keyset browsing returns bounded non-overlapping pages and detail records.
check(
  "keyset browsing returns bounded non-overlapping pages and detail records",
  async () => {
    const a = await request("/api/properties?limit=5");
    assert.equal(a.data.items.length, 5);
    const b = await request(`/api/properties?limit=5&after=${a.data.next}`);
    assert.equal(b.data.items.length, 5);
    assert.ok(b.data.items[0].id > a.data.items.at(-1).id);
    const detail = await request(`/api/properties/${a.data.items[0].id}`);
    assert.equal(detail.status, 200);
    assert.equal((await request("/api/properties?limit=100000")).status, 400);
    assert.equal(
      (await request("/api/properties?search=does-not-exist")).data.items.length,
      0,
    );
  },
);

// Regression: newest-first ordering belongs to SQL, and browsing must stop at
// 1,000 matches rather than downloading all 50,000 seeded bookings.
check(
  "booking pages are newest first and stop after 1,000 matching records",
  async () => {
    const expected = (
      await pool.query(
        "SELECT id FROM bookings ORDER BY created_at DESC,id DESC LIMIT 1000",
      )
    ).rows.map((row) => row.id);
    assert.equal(expected.length, 1000);
    const seen = [];
    let after = "";
    let firstCursor;
    do {
      const page = await request(
        `/api/bookings?limit=20${after ? `&after=${encodeURIComponent(after)}` : ""}`,
      );
      assert.equal(page.status, 200);
      assert.ok(page.data.items.length > 0 && page.data.items.length <= 20);
      seen.push(...page.data.items.map((row) => row.id));
      assert.ok(seen.length <= 1000);
      after = page.data.next;
      if (!firstCursor) firstCursor = after;
    } while (after);
    assert.deepEqual(seen, expected);
    assert.equal(new Set(seen).size, 1000);
    assert.equal(
      (await request(`/api/bookings?status=COMPLETED&after=${firstCursor}`)).status,
      400,
    );
    const older = (
      await pool.query("SELECT id FROM bookings ORDER BY created_at,id LIMIT 1")
    ).rows[0].id;
    const lookup = await request(`/api/bookings?search=${older}`);
    assert.equal(lookup.status, 200);
    assert.deepEqual(
      lookup.data.items.map((row) => row.id),
      [older],
    );
    assert.equal((await request(`/api/bookings/${older}`)).status, 200);
  },
);
