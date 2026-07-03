import { cn } from "@/lib/utils";

export function GrapeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn("h-8 w-8", className)} aria-hidden>
      <path
        d="M16 9c0-3 1.5-5 4.5-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-vine-700"
      />
      <path
        d="M16.5 8.5c2.5-2.5 5.5-2.5 7.5-1-1.5 2.5-4.5 3.5-7.5 1Z"
        fill="currentColor"
        className="text-vine-600"
      />
      <g fill="currentColor" className="text-wine-700">
        <circle cx="11.5" cy="13.5" r="3.4" />
        <circle cx="20.5" cy="13.5" r="3.4" />
        <circle cx="7.5" cy="19.5" r="3.4" className="text-wine-600" />
        <circle cx="16" cy="19.5" r="3.4" />
        <circle cx="24.5" cy="19.5" r="3.4" className="text-wine-600" />
        <circle cx="11.5" cy="25.5" r="3.4" className="text-wine-800" />
        <circle cx="20.5" cy="25.5" r="3.4" className="text-wine-800" />
        <circle cx="16" cy="30" r="2.6" className="text-wine-900" />
      </g>
    </svg>
  );
}
