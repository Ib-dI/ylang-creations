import { cn } from "@/lib/utils";
import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="group relative w-full">
        {/* Label flottant premium */}
        {label && (
          <label className="bg-ylang-cream font-body text-ylang-charcoal/60 group-focus-within:text-ylang-rose absolute -top-2.5 left-3 px-2 text-xs tracking-wide uppercase transition-all duration-300 group-focus-within:font-medium">
            {label}
          </label>
        )}

        <input
          type={type}
          className={cn(
            "bg-ylang-cream border-ylang-beige flex h-11 w-full rounded-lg border px-4",
            "font-body text-ylang-charcoal placeholder:text-ylang-charcoal/40 text-sm",
            "transition-all duration-300",
            "focus:border-ylang-rose focus:shadow-[0_0_0_4px_rgba(183,110,121,0.1)] focus:outline-none",
            "hover:border-ylang-terracotta/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-400 focus:border-red-500",
            className,
          )}
          ref={ref}
          {...props}
        />

        {/* Underline animé */}
        <div
          className={cn(
            "from-ylang-rose to-ylang-terracotta absolute right-0 -bottom-1 left-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 group-focus-within:scale-x-100",
            error && "bg-red-500",
          )}
        />

        {/* Message d'erreur */}
        {error && (
          <p className="font-body mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
