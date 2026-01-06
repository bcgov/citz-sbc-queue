import type { Metadata } from "next"
import "../styles/globals.css"
import localFont from "next/font/local"
import { AuthProvider } from "@/components/auth/AuthProvider"
import { Footer, Header } from "@/components/common"

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
        <div className="h-screen w-screen overflow-x-hidden grid md:grid-cols-12 grid-cols-4 grid-rows-fr auto-rows-max gap-4">
          <header className="col-span-full max-h-auto md:max-h-[118px] bg-background-default">
            <Header />
          </header>
          <main className="grid md:col-span-8 md:col-start-3 col-span-full">
            <div className="grid p-sm m-sm gap-sm md:m-xl md:p-lg justify-around">{children}</div>
          </main>
          <footer className="sticky top-[100vh] col-span-full h-auto">
            <Footer />
          </footer>
        </div>
      </body>
    </html>
  )
}
