"use client";

import { Component, type ReactNode } from "react";
import { ErrorState } from "@/components/ui/states";

interface Props {
  children: ReactNode;
  title?: string;
  description?: string;
  compact?: boolean;
}

interface State {
  failed: boolean;
}

/**
 * Keeps a failing data section from taking the whole page down. Server
 * Component children that throw (API outage, bad response) render a friendly
 * section-level error instead of the route error page.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== "production") console.error("Section failed to render", error);
  }

  render() {
    if (this.state.failed) {
      return (
        <ErrorState
          compact={this.props.compact}
          title={this.props.title ?? "This section couldn't load"}
          description={this.props.description ?? "The restaurant's systems are busy right now. Please refresh in a moment."}
        />
      );
    }
    return this.props.children;
  }
}
