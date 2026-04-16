import * as React from "react"

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "border border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-100",
    secondary: "border border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-100",
    destructive: "border border-red-200 bg-red-100 text-red-800 hover:bg-red-100",
    outline: "text-slate-950",
  }

  return (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${variants[variant]} ${className || ""}`}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
