/**
 * Read one newest-first booking page from the server.
 *
 * Browse supplies the current cursor and page size. The shared resource hook
 * keeps request identity and ignores late responses after navigation or filters.
 * No cursor-following loop, full-history array or browser sorting is needed.
 */

import { useData } from "./useData.js";

export function useBookingHistory(url) {
  return useData(url);
}
