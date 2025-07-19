import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
 "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
 {
  variants: {
   variant: {
    default:
     "bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-lg",
    outline:
     "border  bg-background hover:bg-purple-50 hover:text-purple-900 hover:border-purple-400",
    secondary: "bg-purple-100 text-purple-900 hover:bg-purple-200 shadow-sm",
    ghost: "hover:bg-purple-100 hover:text-purple-900 transition-colors",
    link:
     "text-purple-600 underline-offset-4 hover:underline hover:text-purple-700",
    purple:
     "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all",
   },
   size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
   },
  },
  defaultVariants: {
   variant: "default",
   size: "default",
  },
 }
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
    className={cn(buttonVariants({ variant, size, className }))}
    ref={ref}
    {...props}
   />
  );
 }
);
Button.displayName = "Button";

export { Button, buttonVariants };
