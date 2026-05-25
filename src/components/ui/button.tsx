import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-300",
        variant === "secondary" && "border border-cyan-300/20 bg-white/8 text-cyan-50 hover:bg-white/12",
        variant === "ghost" && "text-cyan-50 hover:bg-white/10",
        variant === "danger" && "bg-rose-500/15 text-rose-100 hover:bg-rose-500/25",
        className
      )}
      {...props}
    />
  );
}
