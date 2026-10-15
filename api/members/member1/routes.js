/**
 * Member 1 API handlers.
 *
 * GET health, guest/property pages/details and booking pages/details.
 * Lists fetch limit+1; booking pages seek by creation time and ID, newest first.
 * SQL values are bound separately, and booking browsing stops at 1,000 matches.
 * Table/column identifiers come from fixed local constants, never arbitrary user input.
 */

import {
  InputError,
  integer,
  page,
  paged,
  statusSet,
  searchText,
  route,
} from "../../shared/http.js";
import { bookingSelect } from "../../shared/queries.js";

const BOOKING_BROWSE_LIMIT = 1000;

/**
 * Decode the opaque booking cursor without losing PostgreSQL microseconds.
 * The count enforces the browse window; scope prevents reusing a cursor after
 * changing guest, status or booking-ID filters. This cursor is pagination state,
 * not an authorization token.
 */
function bookingCursor(value, scope) {
  if (!value) return null;
  try {
    if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,512}$/.test(value))
      throw new Error("Invalid encoding");
    const cursor = JSON.parse(Buffer.from(value, "base64url").toString());
    if (!Array.isArray(cursor) || cursor.length !== 4)
      throw new Error("Invalid cursor shape");
    const [timestamp, id, seen, filters] = cursor;
    if (
      typeof timestamp !== "string" ||
      !/^(?!0000)\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(timestamp) ||
      !Number.isFinite(Date.parse(timestamp)) ||
      new Date(timestamp).toISOString().slice(0, 19) !== timestamp.slice(0, 19) ||
      JSON.stringify(filters) !== JSON.stringify(scope)
    )
      throw new Error("Invalid timestamp or filter scope");
    return {
      timestamp,
      id: integer(id, "Booking cursor ID"),
      seen: integer(seen, "Booking cursor count", 1, BOOKING_BROWSE_LIMIT),
    };
  } catch {
    throw new InputError("Invalid booking cursor. Start from the first page.");
  }
}

/**
 * Register this member's endpoints on the shared Express instance.
 * @param {import("express").Express} app Existing router/listener host.
 * @param {{pool: import("pg").Pool, mongo: import("mongodb").Db}} dependencies
 */
export function registerMember1Routes(app, { pool, mongo }) {
  app.get(
    "/api/health",
    route(async (req, res) => {
      // A successful health response requires both persistence engines to answer.
      await Promise.all([pool.query("SELECT 1"), mongo.command({ ping: 1 })]);
      res.json({ ok: true, mode: "live", project: "StaySpot" });
    }),
  );
  // Reuse the list/detail shape for two fixed entities while keeping identifiers
  // trusted.
  for (const [entity, column] of [
    ["guests", "name"],
    ["properties", "title"],
  ]) {
    app.get(
      `/api/${entity}`,
      route(async (req, res) => {
        const { limit, after } = page(req.query);
        const s = searchText(req.query.search);
        const values = [after, limit + 1];
        let filter = "";
        if (s) {
          // Escape LIKE wildcards so a user's percent/underscore means literal search
          // text.
          values.push(`%${s.replace(/[\\%_]/g, "\\$&")}%`);
          filter = ` AND ${column} ILIKE $3`;
        }
        // entity/column are fixed constants from the loop, never request values.
        const result = await pool.query(
          `SELECT * FROM ${entity} WHERE id>$1${filter} ORDER BY id LIMIT $2`,
          values,
        );
        res.json(paged(result.rows, limit));
      }),
    );
    app.get(
      `/api/${entity}/:id`,
      route(async (req, res) => {
        const result = await pool.query(`SELECT * FROM ${entity} WHERE id=$1`, [
          integer(req.params.id, "Record ID"),
        ]);
        if (!result.rows.length) throw new InputError("Record not found.", 404);
        res.json(result.rows[0]);
      }),
    );
  }
  app.get(
    "/api/bookings",
    route(async (req, res) => {
      const requested = integer(req.query.limit ?? 20, "Page size", 1, 50);
      const guest = req.query.guest_id ? integer(req.query.guest_id, "Guest") : null;
      const search = req.query.search ? integer(req.query.search, "Booking ID") : null;
      const status = req.query.status || null;
      if (status && !statusSet.includes(status))
        throw new InputError("Choose a valid booking status.");
      const scope = [guest, search, status];
      const after = bookingCursor(req.query.after, scope);
      const seen = after?.seen ?? 0;
      const limit = Math.min(requested, BOOKING_BROWSE_LIMIT - seen);
      if (!limit) return res.json({ items: [], next: null });

      // Apply filters before paging. A timestamp/ID seek avoids OFFSET and does
      // not confuse random seed IDs with chronological booking order.
      const values = [limit + 1];
      const where = [];
      for (const [value, column] of [
        [guest, "b.guest_id"],
        [search, "b.id"],
        [status, "b.status"],
      ]) {
        if (value === null) continue;
        values.push(value);
        where.push(`${column}=$${values.length}`);
      }
      if (after) {
        values.push(after.timestamp, after.id);
        where.push(
          `(b.created_at,b.id)<($${values.length - 1}::timestamptz,$${values.length}::integer)`,
        );
      }
      const result = await pool.query(
        `SELECT booking_page.*,
           to_char(booking_page.created_at AT TIME ZONE 'UTC',
             'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_time
         FROM (
           ${bookingSelect}
           WHERE ${where.length ? where.join(" AND ") : "TRUE"}
           ORDER BY b.created_at DESC, b.id DESC
           LIMIT $1
         ) booking_page
         ORDER BY booking_page.created_at DESC, booking_page.id DESC`,
        values,
      );
      const rows = result.rows.slice(0, limit);
      const last = rows.at(-1);
      const more =
        result.rows.length > limit && seen + rows.length < BOOKING_BROWSE_LIMIT;
      res.json({
        // Keep the existing item fields; cursor_time is internal pagination data.
        items: rows.map(({ cursor_time, ...booking }) => booking),
        next:
          more && last
            ? Buffer.from(
                JSON.stringify([last.cursor_time, last.id, seen + rows.length, scope]),
              ).toString("base64url")
            : null,
      });
    }),
  );
  app.get(
    "/api/bookings/:id",
    route(async (req, res) => {
      const result = await pool.query(`${bookingSelect} WHERE b.id=$1`, [
        integer(req.params.id, "Booking ID"),
      ]);
      if (!result.rows.length) throw new InputError("Booking not found.", 404);
      res.json(result.rows[0]);
    }),
  );
}
