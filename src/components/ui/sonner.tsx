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
        // Use direct style overrides for consistent appearance
        style: {
          backgroundColor: "white",  // White background
          color: "var(--ai-cyan)",   // Text color as ai-cyan
          borderColor: "var(--ai-cyan)",
          borderWidth: "1px",
        },
        // Add additional class overrides for specific elements
        classNames: {
          title: "!text-ai-cyan", // Force text color with !important
          description: "!text-ai-cyan", // Force text color with !important
          actionButton: "!bg-ai-cyan !text-white hover:!bg-ai-cyan/80",
          cancelButton: "!bg-gray-200 !text-gray-700",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }