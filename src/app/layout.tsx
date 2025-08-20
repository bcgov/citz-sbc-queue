import type { Metadata } from "next"
import "./styles/globals.css"
import "@bcgov/bc-sans/css/BCSans.css"
import { BCGovHeader } from "@/components/layout/BCGovHeader"

export const metadata: Metadata = {
  title: "Service BC Queue Management",
  description: "Modern queue management system for BC Government services",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "BCSans, sans-serif" }}>
        <BCGovHeader />
        {children}
      </body>
    </html>
  )
}
