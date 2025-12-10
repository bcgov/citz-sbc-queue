import type { Metadata } from "next"
import "../styles/globals.css"
import localFont from "next/font/local"
import { AuthProvider } from "@/components/auth/AuthProvider"
import { Footer, Header, Navigation } from "@/components/common"

const BCSans = localFont({
  src: [
    {
      path: "../../public/fonts/BCSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/BCSans-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/BCSans-Bold.woff2",
      weight: "700",
      style: "bold",
    },
    {
      path: "../../public/fonts/BCSans-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-BCSans",
})

export const metadata: Metadata = {
  title: "Service B.C. Queue Management System",
  description: `The Queue Managment System is used to manage
                citizen flow for our Service BC locations.
                This system is designed to be used for government
                offices with a large number of services.`,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${BCSans.variable} font-sans`}>
        <AuthProvider />
        <main className="min-h-screen max-h-screen grid grid-cols-12 gap-4">
          <header className="col-span-full">
            <Header />
            <Navigation />
          </header>
          <div className="col-span-8 col-start-3">{children}</div>
          <footer className="sticky top-[100vh] col-span-full">
            <Footer />
          </footer>
        </main>
      </body>
    </html>
  )
}
