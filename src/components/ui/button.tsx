import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-vine-700 text-white hover:bg-vine-800 focus-visible:outline-vine-700 disabled:bg-stone-300",
  secondary:
    "bg-wine-700 text-white hover:bg-wine-800 focus-visible:outline-wine-700 disabled:bg-stone-300",
  outline:
    "border border-stone-300 bg-white text-stone-800 hover:border-vine-600 hover:text-vine-700",
  ghost: "text-stone-700 hover:bg-stone-100",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-stone-300",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant = "primary", size = "md", className, ...props }: Props) {
  return <button className={cn(buttonClasses(variant, size), className)} {...props} />;
}
