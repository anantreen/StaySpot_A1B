/**
 * Paged browsing for properties, guests and bookings.
 *
 * The active entity determines the endpoint, filters and card/table presentation.
 * Properties and guests use server cursors. Bookings are ordered newest first
 * in the frontend and then split into display pages.
 * Record details belong to Member 1; booking-status actions belong to Member 2.
 */

import React, { useState } from "react";
import { MapPin, ArrowUpRight, Search, Leaf } from "lucide-react";
import { money } from "./lib/format.js";
import { qs } from "./lib/query.js";
import { useData } from "./hooks/useData.js";
import { useBookingHistory } from "./hooks/useBookingHistory.js";
import { Alert } from "./components/Alert.jsx";
import { DataState } from "./components/DataState.jsx";
import { Pill } from "./components/Pill.jsx";
import { Heading } from "./components/Heading.jsx";
import { Pager } from "./components/Pager.jsx";
import { HouseArt } from "./components/HouseArt.jsx";
import { PropertyDetails } from "./PropertyDetails.jsx";
import { BookingStatusAction } from "../../member2/web/BookingStatusAction.jsx";

/**
 * Render bounded pages and details for the chosen entity.
 * @param {Object|null} actor Guest selected by App; its ID scopes the optional booking
 * filter.
 * @param {Function} onBook Pass a property (or null) to App's booking navigation.
 */
export function Browse({ actor, onBook }) {
  // Filters and pagination belong to the selected entity; details/errors belong to its
  // dialog.
  // Keep individual state declarations separate so each control is easy to locate.
  const [entity, setEntity] = useState("properties");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [mine, setMine] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [detailError, setDetailError] = useState("");
  // Cursor/display positions belong to one entity/filter/guest combination. Reset them during
  // render so an actor change cannot briefly request the previous guest's page.
  const scope = JSON.stringify([entity, search, status, mine, actor?.id]);
  const [paging, setPaging] = useState({ scope, after: "", history: [] });
  const current = paging.scope === scope ? paging : { scope, after: "", history: [] };
  if (paging.scope !== scope) setPaging(current);
  const { after, history } = current;
  const pageSize = entity === "properties" ? 8 : 20;
  const bookingId = search.trim();
  // Booking lookup is by numeric ID. Explain invalid input beside the search
  // field and pause its request rather than exposing the API's generic error.
  const bookingSearchError =
    entity === "bookings" &&
    bookingId !== "" &&
    (!/^\d+$/.test(bookingId) ||
      !Number.isSafeInteger(Number(bookingId)) ||
      Number(bookingId) < 1 ||
      Number(bookingId) > 2147483647)
      ? "Search by booking ID using digits only, for example 50001."
      : "";
  // Keep property/guest browsing on its existing bounded server pages. Bookings
  // use the existing endpoint's maximum batch size to read fewer API pages.
  const catalogResource = useData(
    entity === "bookings"
      ? null
      : `/${entity}?${qs({ search, after, limit: pageSize })}`,
  );
  const bookingResource = useBookingHistory(
    entity === "bookings" && !bookingSearchError
      ? `/bookings?${qs({ search: bookingId, status, guest_id: mine ? actor?.id : "", limit: 50 })}`
      : null,
  );
  const resource = entity === "bookings" ? bookingResource : catalogResource;
  // For bookings, `after` is a local offset, never an API cursor. Sorting the
  // complete matching history first keeps newest-first order across pages.
  const offset = Number(after || 0);
  const items =
    (entity === "bookings"
      ? resource.data?.items.slice(offset, offset + pageSize)
      : resource.data?.items) ?? [];
  const next =
    entity === "bookings"
      ? offset + pageSize < (resource.data?.items.length ?? 0)
        ? String(offset + pageSize)
        : null
      : resource.data?.next;
  const entityLabel =
    items.length === 1
      ? { properties: "property", guests: "guest", bookings: "booking" }[entity]
      : entity;
  // The shared hook also discards a pending detail response when its dialog is
  // closed, a different record is opened, or Browse unmounts during navigation.
  const detailResource = useData(detailId == null ? null : `/${entity}/${detailId}`);
  /**
   * Fetch authoritative detail data instead of assuming the list contains every field.
   */
  function open(item) {
    setDetailError("");
    if (detailId === item.id) detailResource.reload();
    setDetailId(item.id);
  }
  return (
    <>
      <Heading
        eyebrow="YOUR NEXT CHAPTER"
        title="A place for every possibility."
        description="Discover thoughtful spaces, familiar comforts, and a little room to explore."
      />
      <div className="browse-banner">
        <div>
          <span className="mini-label">
            <Leaf size={15} /> MADE FOR SLOWER DAYS
          </span>
          <h2>
            Good stays.
            <br />
            Great beginnings.
          </h2>
          <p>
            From city corners to quiet courtyards,
            <br />
            find somewhere that feels like you.
          </p>
          <button className="btn light" onClick={() => onBook(null)}>
            Book a stay <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="banner-art">
          <HouseArt variant={0} />
        </div>
        <div className="banner-stamp">
          STAY A LITTLE
          <br />
          <span>longer</span>
        </div>
      </div>
      <div className="toolbar">
        <div className="tabs">
          {[
            ["properties", "Properties"],
            ["guests", "Guests"],
            ["bookings", "Bookings"],
          ].map(([key, label]) => (
            <button
              className={entity === key ? "active" : ""}
              key={key}
              onClick={() => {
                setEntity(key);
                setSearch("");
                setStatus("");
                setMine(false);
                setDetailId(null);
                setDetailError("");
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="search-field">
          <Search size={18} />
          <input
            aria-label={`Search ${entity}`}
            inputMode={entity === "bookings" ? "numeric" : undefined}
            aria-invalid={Boolean(bookingSearchError)}
            aria-describedby={bookingSearchError ? "booking-search-error" : undefined}
            placeholder={
              entity === "bookings" ? "Find a booking by ID…" : `Search ${entity}…`
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>
      {entity === "bookings" && (
        <div className="filter-row">
          <select
            aria-label="Filter booking status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
            }}
          >
            <option value="">All statuses</option>
            {["CONFIRMED", "CHECKED_IN", "COMPLETED"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={mine}
              onChange={(e) => {
                setMine(e.target.checked);
              }}
            />{" "}
            Selected guest only
          </label>
        </div>
      )}
      {detailError && <Alert message={detailError} />}
      {bookingSearchError ? (
        <div id="booking-search-error">
          <Alert message={bookingSearchError} />
        </div>
      ) : (
        <>
          <DataState
            resource={resource}
            empty={!items.length}
            emptyTitle={`No ${entity} found`}
            emptyMessage={
              search || status || mine
                ? "Try another search or clear the filters to see more results."
                : `There are no ${entity} to show yet.`
            }
            emptyAction={
              (search || status || mine) && (
                <button
                  className="btn secondary"
                  onClick={() => {
                    setSearch("");
                    setStatus("");
                    setMine(false);
                  }}
                >
                  Clear filters
                </button>
              )
            }
          >
            {entity === "properties" ? (
              <div className="property-grid">
                {items.map((p, i) => (
                  <button className="property-card" key={p.id} onClick={() => open(p)}>
                    <div className="property-cover">
                      <HouseArt variant={i} />
                      <span className="cover-chip">
                        <Leaf size={12} /> Thoughtful spaces
                      </span>
                    </div>
                    <div className="property-info">
                      <div className="property-location">
                        <MapPin size={13} />
                        {p.title.split(" ")[0]}
                        <span>#{p.id}</span>
                      </div>
                      <h3>{p.title}</h3>
                      <div className="property-price">
                        <strong>{money(p.base_price)}</strong>
                        <span>/ night</span>
                        <ArrowUpRight size={19} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="panel table-wrap">
                <table>
                  <thead>
                    <tr>
                      {entity === "guests" ? (
                        <>
                          <th>Guest</th>
                          <th>Wallet balance</th>
                          <th>Details</th>
                        </>
                      ) : (
                        <>
                          <th>Booking</th>
                          <th>Guest & property</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Next step</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r) => (
                      <tr key={r.id}>
                        {entity === "guests" ? (
                          <>
                            <td>
                              <div className="record-name">
                                {r.name}
                                <small>Guest #{r.id}</small>
                              </div>
                            </td>
                            <td>{money(r.wallet_balance)}</td>
                            <td>
                              <button className="text-btn" onClick={() => open(r)}>
                                View guest <ArrowUpRight size={15} />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>
                              <button className="text-btn" onClick={() => open(r)}>
                                #{r.id}
                              </button>
                              <small className="cell-small">
                                {r.nights} {Number(r.nights) === 1 ? "night" : "nights"}
                              </small>
                            </td>
                            <td>
                              <div className="record-name">
                                {r.guest_name}
                                <small>{r.property_title}</small>
                              </div>
                            </td>
                            <td>{money(r.total_cost)}</td>
                            <td>
                              <Pill status={r.status} />
                            </td>
                            <td>
                              <BookingStatusAction
                                booking={r}
                                onSuccess={resource.reload}
                                onError={setDetailError}
                              />
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DataState>
          <Pager
            pageSize={pageSize}
            label={`Page ${history.length + 1} · ${items.length} ${entityLabel}`}
            history={history}
            next={next}
            onNext={() => {
              setPaging({
                scope,
                after: next,
                history: [...history, after],
              });
            }}
            onBack={() => {
              setPaging({
                scope,
                after: history.at(-1),
                history: history.slice(0, -1),
              });
            }}
          />
        </>
      )}
      {detailId != null && (
        <PropertyDetails
          entity={entity}
          resource={detailResource}
          onBook={onBook}
          onClose={() => setDetailId(null)}
        />
      )}
    </>
  );
}
