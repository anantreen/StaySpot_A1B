/**
 * Read-only, newest-first booking history for Browse.
 *
 * The existing endpoint returns ascending ID pages. Historical booking dates do
 * not follow ID order, so fetch the matching pages and sort by creation time
 * before applying the table's display pagination. No API/query changes are needed.
 */

import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { qs } from "../lib/query.js";

export async function readBookingHistory(url, signal) {
  const items = [];
  let after = null;
  do {
    const page = await api(after ? `${url}&${qs({ after })}` : url, { signal });
    items.push(...page.items);
    after = page.next;
  } while (after);

  // Parse each date once rather than during every sort comparison. Use the ID
  // as a deterministic tie-breaker when two bookings share a creation timestamp.
  const dated = items.map((booking) => ({
    booking,
    createdAt: Date.parse(booking.created_at),
  }));
  dated.sort(
    (a, b) => b.createdAt - a.createdAt || Number(b.booking.id) - Number(a.booking.id),
  );
  return { items: dated.map(({ booking }) => booking) };
}

/**
 * A null URL pauses loading outside the Bookings tab or during invalid searches.
 * Request identity and cleanup prevent old filters from publishing stale rows.
 */
export function useBookingHistory(url) {
  const [state, setState] = useState({
    url,
    loading: Boolean(url),
    data: null,
    error: null,
  });
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((value) => value + 1), []);

  useEffect(() => {
    if (!url) {
      setState({ url, loading: false, data: null, error: null });
      return;
    }
    let alive = true;
    const controller = new AbortController();
    setState({ url, loading: true, data: null, error: null });
    readBookingHistory(url, controller.signal)
      .then((data) => {
        if (alive) setState({ url, loading: false, data, error: null });
      })
      .catch((error) => {
        if (alive) setState({ url, loading: false, data: null, error: error.message });
      });
    return () => {
      // Navigation and filter edits stop the remaining page requests immediately.
      alive = false;
      controller.abort();
    };
  }, [url, version]);

  const current =
    state.url === url ? state : { loading: Boolean(url), data: null, error: null };
  return { loading: current.loading, data: current.data, error: current.error, reload };
}
