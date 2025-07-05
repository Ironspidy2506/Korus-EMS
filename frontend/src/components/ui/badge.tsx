import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-500 text-white hover:bg-green-600",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        info:
          "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        purple:
          "border-transparent bg-purple-500 text-white hover:bg-purple-600",
        pink:
          "border-transparent bg-pink-500 text-white hover:bg-pink-600",
        indigo:
          "border-transparent bg-indigo-500 text-white hover:bg-indigo-600",
        teal:
          "border-transparent bg-teal-500 text-white hover:bg-teal-600",
        orange:
          "border-transparent bg-orange-500 text-white hover:bg-orange-600",
        cyan:
          "border-transparent bg-cyan-500 text-white hover:bg-cyan-600",
        emerald:
          "border-transparent bg-emerald-500 text-white hover:bg-emerald-600",
        rose:
          "border-transparent bg-rose-500 text-white hover:bg-rose-600",
        amber:
          "border-transparent bg-amber-500 text-white hover:bg-amber-600",
        lime:
          "border-transparent bg-lime-500 text-white hover:bg-lime-600",
        sky:
          "border-transparent bg-sky-500 text-white hover:bg-sky-600",
        violet:
          "border-transparent bg-violet-500 text-white hover:bg-violet-600",
        fuchsia:
          "border-transparent bg-fuchsia-500 text-white hover:bg-fuchsia-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
