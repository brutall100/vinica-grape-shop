"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns false during SSR / the first client render and true after hydration.
 * Used to defer cart-dependent UI (persisted in localStorage) so the server
 * and client markup match.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
