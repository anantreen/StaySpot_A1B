-- Bounded newest-first booking browsing, including guest/status filters.
-- Safe to apply to an initialized database: adds indexes without changing rows.
-- IF NOT EXISTS also allows the same file during first-run setup.

CREATE INDEX IF NOT EXISTS idx_bookings_created_id
    ON bookings (created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_guest_created_id
    ON bookings (guest_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_status_created_id
    ON bookings (status, created_at DESC, id DESC);
