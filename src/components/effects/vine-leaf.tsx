import { cn } from "@/lib/utils";

/** Five-lobed grape-vine leaf, shared by the live background, buttons and the hero art. */
export const VINE_LEAF_PATH =
  "M12 22.5c-.3-1.9-.4-3.6-.3-5.1-1.7 1.3-3.7 1.8-5.9 1.4.9-1.4 1.3-2.8 1.2-4.1-1.9.2-3.9-.3-5.5-1.6 1.6-.8 2.6-2 2.9-3.6C3 8.3 2.2 6.8 2 5.1c2 .3 3.8 0 5.3-1 .1 1.4.8 2.6 2 3.4.3-2.2 1.2-4.1 2.7-5.6 1.5 1.5 2.4 3.4 2.7 5.6 1.2-.8 1.9-2 2-3.4 1.5 1 3.3 1.3 5.3 1-.2 1.7-1 3.2-2.4 4.4.3 1.6 1.3 2.8 2.9 3.6-1.6 1.3-3.6 1.8-5.5 1.6-.1 1.3.3 2.7 1.2 4.1-2.2.4-4.2-.1-5.9-1.4.1 1.5 0 3.2-.3 5.1Z";

export const VINE_LEAF_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${VINE_LEAF_PATH}"/><path d="M12 22V9M12 14l-4-3M12 14l4-3" stroke="rgb(0 0 0 / .18)" stroke-width=".8" fill="none"/></svg>`;

export function VineLeaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} aria-hidden>
      <path fill="currentColor" d={VINE_LEAF_PATH} />
    </svg>
  );
}
