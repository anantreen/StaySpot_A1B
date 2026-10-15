/**
 * DataState shared component.
 *
 * Gate children behind a common loading, retryable-error or empty-results state.
 * The resource contract is {loading, error, data, reload}, supplied by useData.
 */

import React from "react";
import { RefreshCw, Leaf } from "lucide-react";

import { Alert } from "./Alert.jsx";

/**
 * Gate children behind a common loading, retryable-error or empty-results state.
 * The resource contract is {loading, error, data, reload}, supplied by useData.
 */
export function DataState({
  resource,
  empty = false,
  keepPreviousData = false,
  emptyTitle = "Nothing here yet",
  emptyMessage = "Try another filter, date range, or property.",
  emptyAction,
  children,
}) {
  // Analytics may keep its last snapshot visible during a background refresh.
  // This is opt-in so other screens retain their existing loading presentation.
  const showPreviousData = keepPreviousData && resource.data != null;
  if (resource.loading && !showPreviousData)
    return (
      <div className="state" role="status" aria-live="polite" aria-busy="true">
        <RefreshCw className="spin" size={24} />
        <p>Getting everything ready…</p>
      </div>
    );
  if (resource.error)
    return (
      <>
        <div className="state">
          <Alert message={resource.error} />
          <button className="btn secondary" onClick={resource.reload}>
            Try again
          </button>
        </div>
        {showPreviousData && children}
      </>
    );
  if (empty)
    return (
      <div className="state" role="status">
        <Leaf size={30} />
        <h3>{emptyTitle}</h3>
        <p>{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  return children;
}
