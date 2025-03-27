import { cn } from "@/lib/utils"

type SpinnerSize = "small" | "medium" | "large"

interface LoadingSpinnerProps {
  size?: SpinnerSize
  className?: string
}

export default function LoadingSpinner({ size = "medium", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "h-5 w-5 border-2",
    medium: "h-8 w-8 border-3",
    large: "h-12 w-12 border-4",
  }

  return (
    <div
      className={cn("animate-spin rounded-full border-t-transparent", "border-[#f15928]", sizeClasses[size], className)}
      aria-label="Loading"
    />
  )
}

