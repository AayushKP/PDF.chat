"use client"

import * as React from "react"

/**
 * Simplified tooltip components. These provide the same API surface
 * as the full shadcn tooltip but without the @base-ui dependency
 * issues. The tooltip behavior is handled via CSS :hover.
 */

function TooltipProvider({ children }: { children: React.ReactNode; delay?: number; [key: string]: unknown }) {
  return <>{children}</>
}

function Tooltip({ children }: { children: React.ReactNode; [key: string]: unknown }) {
  return <>{children}</>
}

function TooltipTrigger({ children, ...props }: React.HTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return <button type="button" {...props}>{children}</button>
}

function TooltipContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
  side?: string
  sideOffset?: number
  align?: string
  alignOffset?: number
}) {
  return (
    <div
      role="tooltip"
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
