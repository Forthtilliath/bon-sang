"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback: ReactNode;
  /** Notifie le parent pour qu'il bascule durablement sur la liste. */
  onError?: () => void;
};

type State = { failed: boolean };

/**
 * Isole la carte : une erreur de rendu de `<CollectesMap>` (WebGL, MapLibre)
 * n'emporte pas la page, on affiche le repli « voir la liste ».
 */
export class MapErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
