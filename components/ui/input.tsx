import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-[#9ECAD6]/80 bg-[#111827] px-3 py-2 text-sm text-[#FFEAEA] placeholder:text-[#FFEAEA]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ECAD6]",
        className,
      )}
      {...props}
    />
  );
}
