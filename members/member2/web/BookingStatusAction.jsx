/**
 * Booking status control embedded in the Browse table.
 *
 * CONFIRMED advances to CHECKED_IN; CHECKED_IN advances to COMPLETED.
 * The server enforces legal transitions and PostgreSQL enforces one active stay.
 * Success refreshes the parent page; failure leaves its friendly message there.
 */

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { api } from "../../member1/web/lib/api.js";

/**
 * Render the next legal action for a booking, or All done for a completed stay.
 * @param {Object} props booking is the row; onSuccess reloads it; onError displays its
 * failure.
 */
export function BookingStatusAction({ booking, onSuccess, onError }) {
  // busy blocks a second click while the PATCH is in flight; a double click would
  // otherwise send two transitions and show a misleading "already changed" error.
  const [busy, setBusy] = useState(false);
  /**
   * Choose only the next legal status; the API/database decide whether it can proceed.
   */
  async function advance(item) {
    setBusy(true);
    // Clear an earlier failure banner so it cannot outlive a later successful step.
    onError("");
    try {
      await api(`/bookings/${item.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: item.status === "CONFIRMED" ? "CHECKED_IN" : "COMPLETED",
        }),
      });
      onSuccess();
    } catch (e) {
      onError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return booking.status !== "COMPLETED" ? (
    <button className="text-btn" disabled={busy} onClick={() => advance(booking)}>
      {booking.status === "CONFIRMED" ? "Check in" : "Complete stay"}{" "}
      <ArrowRight size={14} />
    </button>
  ) : (
    <span className="muted">All done</span>
  );
}
