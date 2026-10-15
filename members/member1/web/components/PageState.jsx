/** Page-level recovery reuses the existing typography, panels and buttons. */
import React from "react";
import { Leaf } from "lucide-react";

export function PageState({ code, title, message, onRetry, onHome }) {
  return (
    <section className="panel page-state" aria-labelledby="page-state-title">
      <Leaf size={34} aria-hidden="true" />
      <div className="eyebrow">{code}</div>
      <h1 id="page-state-title">{title}</h1>
      <p>{message}</p>
      <div className="recovery-actions">
        {onRetry && (
          <button className="btn" onClick={onRetry}>
            Try again
          </button>
        )}
        {onHome && (
          <button className="btn secondary" onClick={onHome}>
            Go to Browse
          </button>
        )}
      </div>
    </section>
  );
}
