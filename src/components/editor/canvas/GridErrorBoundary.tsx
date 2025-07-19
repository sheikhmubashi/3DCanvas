// src/components/editor/canvas/GridErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// This component will catch JavaScript errors anywhere in its child component tree,
// log those errors, and display a fallback UI instead of the component tree that crashed.
class GridErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  // This lifecycle method is invoked after an error has been thrown by a descendant component.
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-800 p-4">
          <h2 className="text-2xl font-bold mb-2">3D Canvas Error</h2>
          <p className="text-center mb-4">
            Could not initialize the 3D editor. This is often due to a lack of browser support or disabled hardware acceleration.
          </p>
          <p className="text-xs text-red-600 bg-red-100 p-2 rounded">
            <strong>Error:</strong> {this.state.error?.message}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GridErrorBoundary;