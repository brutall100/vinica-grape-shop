import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const variants = {
  vine: "bg-vine-100 text-vine-800",
  wine: "bg-wine-100 text-wine-800",
  stone: "bg-stone-100 text-stone-700",
  red: "bg-red-100 text-red-800",
  amber: "bg-amber-100 text-amber-800",
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
};

type Props = HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants };

export function Badge({ variant = "stone", className, ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
