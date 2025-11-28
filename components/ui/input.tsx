import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {/* Label flottant premium */}
        {label && (
          <label className="absolute -top-2.5 left-3 px-2 bg-ylang-cream text-xs font-body text-ylang-charcoal/60 tracking-wide uppercase transition-all duration-300 group-focus-within:text-ylang-rose group-focus-within:font-medium">
            {label}
          </label>
        )}
        
        <input
          type={type}
          className={cn(
            "flex w-full h-14 px-4 bg-ylang-cream border-2 border-ylang-beige rounded-lg",
            "font-body text-base text-ylang-charcoal placeholder:text-ylang-charcoal/40",
            "transition-all duration-300",
            "focus:outline-none focus:border-ylang-rose focus:shadow-[0_0_0_4px_rgba(183,110,121,0.1)]",
            "hover:border-ylang-terracotta/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-400 focus:border-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        
        {/* Underline animé */}
        <div className={cn(
          "absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-ylang-rose to-ylang-terracotta scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left",
          error && "bg-red-500"
        )} />
        
        {/* Message d'erreur */}
        {error && (
          <p className="mt-2 text-sm text-red-600 font-body">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }