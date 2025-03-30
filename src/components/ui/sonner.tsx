'use client'

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-ai-cyan group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          // Add custom styles here
          // You can make the background darker with:
          default: "group-[.toaster]:bg-ai-cyan group-[.toaster]:text-ai-cyan group-[.toaster]:text-ai-cyan group-[.toaster]:border-ai-cyan",
          // For a colored background:
          // default: "group-[.toaster]:bg-blue-950 group-[.toaster]:text-blue-50 group-[.toaster]:border-blue-900",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }