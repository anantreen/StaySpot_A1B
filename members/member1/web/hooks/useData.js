/**
 * Small shared JSON-fetching hook.
 *
 * Starts with a loading state; a URL change or reload requests a new snapshot.
 * The cleanup flag ignores results arriving after this effect was replaced/unmounted.
 * It does not cancel the HTTP request; it only prevents stale state publication.
 */

import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api.js";

/**
 * @param {string|null} url API path relative to /api; null pauses requests while
 * client-side filters are invalid.
 * @param {Object} options keepPreviousData retains the last successful snapshot
 * while filters change and after failed refreshes, for screens such as Analytics.
 * @returns {{loading: boolean, data: any, error: string|null, reload: Function}}
 */
export function useData(url, { keepPreviousData = false } = {}) {
  // Store the request URL alongside its result. React renders new props before
  // running effects, so an effect alone cannot hide another endpoint's records.
  const [state, set] = useState({
    url,
    loading: Boolean(url),
    data: null,
    error: null,
  });
  // Incrementing a local version triggers the effect without modifying the endpoint
  // URL.
  const [version, bump] = useState(0);
  const reload = useCallback(() => bump((v) => v + 1), []);
  useEffect(() => {
    // A paused filter must not send a request or leave its loader running forever.
    if (!url) {
      set((v) => ({
        url,
        loading: false,
        data: keepPreviousData ? v.data : null,
        error: null,
      }));
      return;
    }
    // Each effect instance gets its own flag; old requests cannot overwrite a newer
    // scope.
    let alive = true;
    // Same-query polling can keep its existing snapshot. A changed query must
    // clear it unless the caller explicitly supports displaying previous results.
    set((v) => ({
      url,
      loading: true,
      data: v.url === url || keepPreviousData ? v.data : null,
      error: null,
    }));
    api(url)
      .then((data) => alive && set({ url, loading: false, data, error: null }))
      .catch((error) => {
        if (alive)
          set((v) => ({
            url,
            loading: false,
            data: keepPreviousData ? v.data : null,
            error: error.message,
          }));
      });
    return () => {
      alive = false;
    };
  }, [url, version, keepPreviousData]);
  // Hide mismatched data synchronously, including the render before the effect
  // starts. Children are evaluated before DataState can show a loading spinner.
  const current =
    state.url === url
      ? state
      : {
          loading: Boolean(url),
          data: keepPreviousData ? state.data : null,
          error: null,
        };
  return { loading: current.loading, data: current.data, error: current.error, reload };
}
