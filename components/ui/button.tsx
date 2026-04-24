import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "default" | "ghost" | "outline" | "danger";
};

export function Button({
  className,
  variant = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ECAD6] disabled:pointer-events-none disabled:opacity-60",
        variant === "default" &&
          "bg-[#F5CBCB] text-slate-900 hover:bg-[#f7d8d8] border border-transparent",
        variant === "ghost" &&
          "bg-transparent text-[#FFEAEA] hover:bg-[#748DAE]/30 border border-transparent",
        variant === "outline" &&
          "bg-transparent text-[#FFEAEA] border border-[#9ECAD6] hover:bg-[#748DAE]/25",
        variant === "danger" &&
          "bg-red-500/85 text-white border border-red-300 hover:bg-red-500",
        className,
      )}
      {...props}
    />
  );
}
