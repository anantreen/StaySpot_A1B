/**
 * Frontend-only newest-first audit history.
 *
 * The existing API pages from oldest to newest. Read its guest/date-scoped pages
 * before reversing their display order, so page one contains the actual latest
 * entry rather than just the newest entry from the oldest API page.
 */

import { useCallback, useEffect, useState } from "react";
import { api } from "../../member1/lib/api.js";
import { qs } from "../../member1/lib/query.js";

/**
 * Follow the API's opaque cursors unchanged. Reversing the combined array also
 * reverses its ID tie-breaker without losing timestamp microseconds in a JS sort.
 * Only GET requests are made; audit rows and their balances remain untouched.
 */
export async function readAuditHistory(url, signal) {
  const items = [];
  let after = null;
  do {
    const page = await api(after ? `${url}&${qs({ after })}` : url, { signal });
    items.push(...page.items);
    after = page.next;
  } while (after);
  return { items: items.reverse() };
}

export function useAuditHistory({ guestId, from, to, enabled = true }) {
  // Fifty is the existing endpoint's maximum page size. Filtering stays on the
  // server; only the selected guest's matching history is read by the frontend.
  const url = enabled
    ? `/audit?${qs({ guest_id: guestId, from, to, limit: 50 })}`
    : null;
  const [state, setState] = useState({ url, loading: true, data: null, error: null });
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
    readAuditHistory(url, controller.signal)
      .then((data) => {
        if (alive) setState({ url, loading: false, data, error: null });
      })
      .catch((error) => {
        if (alive) setState({ url, loading: false, data: null, error: error.message });
      });
    return () => {
      // Stop fetching more pages after navigation, a filter change or a new guest.
      alive = false;
      controller.abort();
    };
  }, [url, version]);

  // Do not expose another guest/date scope's records before the effect runs.
  const current =
    state.url === url ? state : { loading: Boolean(url), data: null, error: null };
  return { loading: current.loading, data: current.data, error: current.error, reload };
}
