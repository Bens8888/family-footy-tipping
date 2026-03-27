import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-2xl border border-[#243445] bg-[#101a25] px-4 text-base text-white outline-none transition placeholder:text-[#728297] focus:border-[#20b26f]",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

