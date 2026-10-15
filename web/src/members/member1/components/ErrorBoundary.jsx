/**
 * Catch render failures so a broken screen cannot blank the application.
 * Retry remounts the screen; it never replays a booking or other API mutation.
 */
import React from "react";
import { PageState } from "./PageState.jsx";

export class ErrorBoundary extends React.Component {
  state = { failed: false, attempt: 0 };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error("StaySpot screen could not be displayed", error, info);
  }

  goHome = () => {
    // Browse may itself be the failed screen, so navigating to the same route
    // must clear this boundary too instead of leaving the recovery button stuck.
    this.setState(({ attempt }) => ({ failed: false, attempt: attempt + 1 }));
    if (this.props.onHome) this.props.onHome();
    else window.location.assign("/#browse");
  };

  render() {
    if (this.state.failed)
      return (
        <PageState
          code="SCREEN ERROR"
          title="Something went wrong"
          message="This screen could not be displayed. Try again or return to Browse."
          onRetry={() =>
            this.setState(({ attempt }) => ({ failed: false, attempt: attempt + 1 }))
          }
          onHome={this.goHome}
        />
      );
    return (
      <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>
    );
  }
}
