/**
 * Application shell and demo-actor coordination.
 *
 * Owns navigation, the selected guest and a property passed from Browse to Booking.
 * Hash-based navigation supports direct screen links without a routing dependency.
 * The child screens own their data requests; this shell owns shared actor identity.
 */

import React, { useEffect, useState } from "react";
import {
  Home,
  LayoutGrid,
  CalendarPlus,
  ReceiptText,
  ChartNoAxesCombined,
  MapPin,
  Star,
  ArrowUpRight,
  ChevronDown,
  Leaf,
} from "lucide-react";
import { money } from "./lib/format.js";
import { api } from "./lib/api.js";
import { useData } from "./hooks/useData.js";
import { Alert } from "./components/Alert.jsx";
import { Modal } from "./components/Modal.jsx";
import { Picker } from "./components/Picker.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { PageState } from "./components/PageState.jsx";
import { Browse } from "./Browse.jsx";
import { Transaction } from "../../member2/web/Transaction.jsx";
import { Audit } from "../../member2/web/Audit.jsx";
import { Analytics } from "../../member3/web/Analytics.jsx";
import { MapView } from "../../member4/web/MapView.jsx";
import { Reviews } from "../../member4/web/Reviews.jsx";

// Screen keys are also URL hash values. Each entry supplies its label and icon.
// Keep these IDs aligned with the screen selection near the end of this component.
const navigation = [
  ["browse", "Browse", LayoutGrid],
  ["transaction", "Book a stay", CalendarPlus],
  ["audit", "Audit trail", ReceiptText],
  ["analytics", "Analytics", ChartNoAxesCombined],
  ["map", "Search map", MapPin],
  ["reviews", "Reviews", Star],
];

// Invalid links get a recoverable page instead of silently opening another screen.
function viewFromLocation() {
  const next = window.location.hash.slice(1) || "browse";
  const knownPath = ["/", "/index.html"].includes(window.location.pathname);
  return knownPath && navigation.some(([id]) => id === next) ? next : "notfound";
}
/**
 * Render the shared shell and the one screen selected by the URL hash.
 * The selected actor and pending property are the only state shared between screens.
 */
export function App() {
  const [view, setView] = useState(viewFromLocation);
  const [actor, setActor] = useState(null);
  const [actorError, setActorError] = useState("");
  const [actorPicker, setActorPicker] = useState(false);
  const [initialProperty, setInitialProperty] = useState(null);
  const [actorVersion, setActorVersion] = useState(0);
  // The live badge reflects PostgreSQL AND MongoDB connectivity, independently of actor
  // data.
  const health = useData("/health");
  useEffect(() => {
    const timer = setInterval(health.reload, 30000);
    return () => clearInterval(timer);
  }, [health.reload]);
  const initialGuests = useData("/guests?limit=1");
  useEffect(() => {
    const first = initialGuests.data?.items[0];
    if (first) setActor((current) => current ?? first);
  }, [initialGuests.data]);
  const actorMessage =
    actorError ||
    (!actor &&
      (initialGuests.error ||
        (initialGuests.data?.items.length === 0
          ? "No demo guests are available yet."
          : "")));
  function retryActor() {
    setActorError("");
    initialGuests.reload();
    setActorVersion((value) => value + 1);
  }
  useEffect(() => {
    // Listen for Back/Forward or manual hash edits and remove the listener on unmount.
    const handler = () => {
      setView(viewFromLocation());
    };
    window.addEventListener("hashchange", handler);
    window.addEventListener("popstate", handler);
    return () => {
      window.removeEventListener("hashchange", handler);
      window.removeEventListener("popstate", handler);
    };
  }, []);
  /**
   * Keep screen state and URL synchronized, then position the user at the new screen
   * top.
   */
  function navigate(next) {
    setView(next);
    if (["/", "/index.html"].includes(window.location.pathname)) {
      window.location.hash = next;
    } else {
      // A recovery action also removes an invalid pathname from the address bar.
      window.history.pushState(null, "", `/#${next}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  /**
   * Carry a clicked property into the booking form; null starts an unselected form.
   */
  function book(p) {
    setInitialProperty(p);
    navigate("transaction");
  }
  /**
   * Reread the wallet when changing screens so the shell reflects recent bookings.
   */
  useEffect(() => {
    const actorId = actor?.id;
    if (actorId == null) return;
    let alive = true;
    // Discard a response if navigation or guest selection has moved on. An old
    // wallet request must never switch the header back to the previous guest.
    api(`/guests/${actorId}`)
      .then((record) => {
        if (alive) {
          setActor((current) => (current?.id === actorId ? record : current));
          setActorError("");
        }
      })
      .catch((e) => {
        if (alive) setActorError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [view, actor?.id, actorVersion]);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#browse"
          onClick={(e) => {
            e.preventDefault();
            navigate("browse");
          }}
        >
          <span className="brand-mark">
            <Home size={25} />
          </span>
          StaySpot<span className="brand-dot">.</span>
        </a>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav aria-label="Main navigation">
          {navigation.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={view === id ? "active" : ""}
              aria-current={view === id ? "page" : undefined}
            >
              <Icon size={19} />
              {label}
              {view === id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Leaf size={32} />
          <h3>
            A little closer
            <br />
            to feeling at home.
          </h3>
          <p>VACATION RENTALS & EXPERIENCES</p>
          <div className="sidebar-footer">
            Project 03 <span>SSD · 2026</span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span>
            <strong>
              {navigation.find((n) => n[0] === view)?.[1] ?? "Page not found"}
            </strong>
          </div>
          <div className="header-actions">
            <span
              className={`connection ${health.error ? "offline" : ""}`}
              title={health.error ?? "Both PostgreSQL and MongoDB are connected"}
            >
              <i />
              {health.loading && !health.data
                ? "Connecting"
                : health.error
                  ? "Offline"
                  : "Live databases"}
            </span>
            {health.error && (
              <button
                className="btn secondary connection-retry"
                onClick={() => {
                  health.reload();
                  retryActor();
                }}
              >
                Retry connection
              </button>
            )}
            <button
              className="actor-button"
              onClick={() => setActorPicker(true)}
              aria-label="Switch demo guest"
            >
              <span className="avatar">
                {actor?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("") ?? "…"}
              </span>
              <span>
                <strong>{actor?.name ?? "Choose guest"}</strong>
                <small>{money(actor?.wallet_balance)} in wallet</small>
              </span>
              <ChevronDown size={16} />
            </button>
          </div>
        </header>
        <main>
          {actorMessage && !health.error && (
            <div className="recovery-banner">
              <Alert message={actorMessage} />
              <button className="btn secondary" onClick={retryActor}>
                Try again
              </button>
            </div>
          )}
          <ErrorBoundary key={view} onHome={() => navigate("browse")}>
            {{
              browse: <Browse actor={actor} onBook={book} />,
              transaction: (
                <Transaction
                  actor={actor}
                  initialProperty={initialProperty}
                  onWallet={(wallet_balance) =>
                    setActor((a) =>
                      a?.id === actor?.id ? { ...a, wallet_balance } : a,
                    )
                  }
                />
              ),
              audit: <Audit actor={actor} />,
              analytics: <Analytics />,
              map: <MapView />,
              reviews: <Reviews />,
            }[view] ?? (
              <PageState
                code="404"
                title="That page could not be found"
                message="Choose a screen from the sidebar or return to Browse."
                onHome={() => navigate("browse")}
              />
            )}
          </ErrorBoundary>
          <footer className="page-footer">
            <span>StaySpot · Thoughtful stays, meaningful experiences.</span>
            <span>
              Made for wherever life takes you <ArrowUpRight size={13} />
            </span>
          </footer>
        </main>
      </div>
      {actorPicker && (
        <Modal title="Switch your demo guest" onClose={() => setActorPicker(false)}>
          <p className="help">
            Choose a guest to use their wallet and view their stays. No login is
            required for the demo.
          </p>
          <Picker
            entity="guests"
            label="Find a guest"
            value={actor}
            onSelect={(p) => {
              setActor(p);
              setActorError("");
              setActorPicker(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
