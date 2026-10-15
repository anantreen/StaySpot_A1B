/**
 * Read-only wallet ledger with date filters and cursor pages.
 *
 * Each row uses the trigger-stored balance_after snapshot as its running balance.
 * Newest entries appear first; the frontend paginates the reversed API history.
 * The page opening balance is the balance before its oldest displayed entry.
 */

import React, { useState } from "react";
import { ReceiptText, Wallet, CircleCheck } from "lucide-react";
import { money } from "../member1/lib/format.js";
import { date } from "../member1/lib/format.js";
import { useAuditHistory } from "./hooks/useAuditHistory.js";
import { DataState } from "../member1/components/DataState.jsx";
import { Pill } from "../member1/components/Pill.jsx";
import { Heading } from "../member1/components/Heading.jsx";
import { Pager } from "../member1/components/Pager.jsx";
import { Alert } from "../member1/components/Alert.jsx";
import { validateDateRange } from "../member1/lib/validation.js";

/**
 * Render newest-first, date-filtered wallet pages for the selected actor.
 * @param {Object} props actor provides the guest ID and current wallet snapshot.
 */
export function Audit({ actor }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const rangeError = validateDateRange(from, to);
  // A display page belongs to one guest/date scope. Changing either starts at
  // the latest page, including when returning to a previously selected guest.
  const scope = `${actor?.id ?? 1}|${from}|${to}`;
  const [paging, setPaging] = useState({ scope, offset: 0, history: [] });
  const current = paging.scope === scope ? paging : { scope, offset: 0, history: [] };
  if (paging.scope !== scope) setPaging(current);
  const resource = useAuditHistory({
    guestId: actor?.id,
    from,
    to,
    enabled: Boolean(actor) && !rangeError,
  });
  const pageSize = 20;
  const items =
    resource.data?.items.slice(current.offset, current.offset + pageSize) ?? [];
  const next =
    current.offset + pageSize < (resource.data?.items.length ?? 0)
      ? current.offset + pageSize
      : null;
  // Keep the existing opening-balance meaning even though the oldest row now
  // appears at the bottom. Each row's stored running balance is displayed as-is.
  const oldest = items.at(-1);
  const openingBalance = oldest
    ? (Number(oldest.running_balance) - Number(oldest.amount_changed)).toFixed(2)
    : null;
  return (
    <>
      <Heading
        eyebrow="EVERY RUPEE, ACCOUNTED FOR"
        title="A clear trail. Peace of mind."
        description={`Read-only wallet history for ${actor?.name ?? "your selected guest"}.`}
      />
      <div className="audit-summary">
        <div className="panel">
          <small>AVAILABLE IN WALLET</small>
          <strong>{money(actor?.wallet_balance)}</strong>
          <Wallet size={26} />
        </div>
        <div className="panel">
          <small>PAGE OPENING BALANCE</small>
          <strong>{openingBalance == null ? "—" : money(openingBalance)}</strong>
          <ReceiptText size={26} />
        </div>
        <div className="panel assurance">
          <CircleCheck size={25} />
          <div>
            <strong>Always recorded. Never edited.</strong>
            <p>Every wallet change leaves an immutable audit entry.</p>
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="section-head">
          <h2>Wallet activity</h2>
          <div className="date-filters">
            <label>
              From
              <input
                type="date"
                aria-label="Audit from date"
                value={from}
                aria-invalid={Boolean(rangeError)}
                aria-describedby={rangeError ? "audit-range-error" : undefined}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label>
              To
              <input
                type="date"
                aria-label="Audit to date"
                value={to}
                aria-invalid={Boolean(rangeError)}
                aria-describedby={rangeError ? "audit-range-error" : undefined}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
          </div>
        </div>
        {rangeError && (
          <div id="audit-range-error">
            <Alert message={rangeError} />
          </div>
        )}
        {!rangeError && (
          <DataState
            resource={resource}
            empty={!items.length}
            emptyTitle={actor ? "No wallet activity" : "Choose a demo guest"}
            emptyMessage={
              !actor
                ? "Select a guest in the header to view their wallet history."
                : from || to
                  ? "No wallet entries match this date range."
                  : "No wallet changes have been recorded for this guest yet."
            }
            emptyAction={
              (from || to) && (
                <button
                  className="btn secondary"
                  onClick={() => {
                    setFrom("");
                    setTo("");
                  }}
                >
                  Clear dates
                </button>
              )
            }
          >
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Entry</th>
                    <th>Date & time</th>
                    <th>Type</th>
                    <th>Change</th>
                    <th>Running balance</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id}>
                      <td>#{r.id}</td>
                      <td>{date(r.timestamp)}</td>
                      <td>
                        <Pill status={r.action_type} />
                      </td>
                      <td
                        className={
                          Number(r.amount_changed) > 0 ? "positive" : "negative"
                        }
                      >
                        {Number(r.amount_changed) > 0 ? "+" : ""}
                        {money(r.amount_changed)}
                      </td>
                      <td>
                        <strong>{money(r.running_balance)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataState>
        )}
        {!rangeError && actor && (
          <Pager
            pageSize={pageSize}
            history={current.history}
            next={next}
            onNext={() =>
              setPaging({
                scope,
                offset: next,
                history: [...current.history, current.offset],
              })
            }
            onBack={() =>
              setPaging({
                scope,
                offset: current.history.at(-1),
                history: current.history.slice(0, -1),
              })
            }
          />
        )}
      </div>
    </>
  );
}
