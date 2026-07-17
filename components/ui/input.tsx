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
          <label className="font-body absolute -top-2.5 left-3 bg-white px-2 text-xs tracking-wide text-gray-400 uppercase transition-colors duration-200 group-focus-within:text-gray-600">
            {label}
          </label>
        )}

        <input
          type={type}
          className={cn(
            "flex h-11 w-full border border-gray-200 bg-white px-4",
            "font-body text-sm text-gray-800 placeholder:text-gray-300",
            "transition-[border-color] duration-200",
            "focus-visible:border-gray-400 focus-visible:outline-none",
            "hover:border-gray-300",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-400 focus-visible:border-red-500",
            className,
          )}
          ref={ref}
          {...props}
        />

        {/* Underline animé */}
        {/* <div
          className={cn(
            "from-ylang-rose to-ylang-terracotta absolute right-0 -bottom-1 left-0 h-0.5 origin-left scale-x-0 bg-linear-to-r transition-transform duration-500 group-focus-within:scale-x-100",
            error && "bg-red-500",
          )}
        /> */}

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
