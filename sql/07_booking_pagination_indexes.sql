-- Stable setup/upgrade entry point. Member 1 owns booking browse pagination.
-- Apply with psql -v ON_ERROR_STOP=1 -f sql/07_booking_pagination_indexes.sql.
\ir ./members/member1/07_booking_pagination_indexes.sql
