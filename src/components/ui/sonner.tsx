"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

import { useTheme } from "@/lib/theme"

function Toaster(props: ToasterProps) {
  const { resolved } = useTheme()

  return (
    <Sonner
      theme={resolved}
      position="top-center"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-xl)",
        } as React.CSSProperties
      }
      toastOptions={{ classNames: { toast: "font-sans shadow-elevated", description: "text-muted-foreground!" } }}
      {...props}
    />
  )
}

export { Toaster }
