/**
 * Browser bootstrap.
 *
 * Mount the Member 1 application shell into the HTML root element.
 * Screen logic lives in web/src/members/; the existing stylesheet owns the unchanged
 * visuals.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./members/member1/App.jsx";
import { ErrorBoundary } from "./members/member1/components/ErrorBoundary.jsx";
import "./style.css";

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
