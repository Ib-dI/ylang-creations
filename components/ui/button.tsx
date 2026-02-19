import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
  // Base styles LUXE - transitions ultra-fluides
  "inline-flex items-center justify-center font-body text-sm tracking-wide transition-[background-color,border-color,color,fill,stroke,opacity,box-shadow,transform] duration-500 disabled:opacity-50 disabled:pointer-events-none group relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ylang-rose focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: [
          "bg-ylang-rose text-white",
          "hover:bg-ylang-charcoal hover:shadow-[0_8px_30px_rgba(183,110,121,0.3)]",
          "hover:scale-[1.02] active:scale-[0.98]",
          // Effet shimmer premium
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
          "before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        ],
        secondary: [
          "border-2 border-ylang-rose text-ylang-rose bg-transparent",
          "hover:bg-ylang-rose hover:text-ylang-white",
          "hover:shadow-[0_4px_20px_rgba(183,110,121,0.25)]",
          "hover:scale-[1.02] active:scale-[0.98]",
        ],
        ghost: [
          "text-[var(--color-ylang-charcoal)] hover:bg-[var(--color-ylang-beige)]/60",
          "hover:translate-x-1 transition-transform duration-300",
        ],
        luxury: [
          "bg-ylang-rose bg-gradient-to-r from-[var(--color-ylang-rose)] via-[var(--color-ylang-terracotta)] to-[var(--color-ylang-rose)] bg-[length:200%_auto]",
          "text-white font-medium",
          "hover:bg-[position:100%_0%] hover:shadow-[0_5px_15px_rgba(183,110,121,0.4)]",
          "hover:scale-[1.03] active:scale-[0.99]",
          "animate-gradient",
        ],
        link: [
          "text-ylang-rose underline-offset-4 hover:underline",
          "hover:text-ylang-charcoal transition-colors",
        ],
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-10 px-6 py-2 text-xs",
        lg: "h-14 px-10 py-4 text-base",
        xl: "h-16 px-12 py-5 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
