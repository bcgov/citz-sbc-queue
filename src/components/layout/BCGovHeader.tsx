import Image from "next/image"
import Link from "next/link"

export const BCGovHeader = () => {
  return (
    <header className="bg-background-dark-blue">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* BC Gov Logo and Service Title */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/bcgov/BCID_H_RGB_rev.svg"
                alt="Government of British Columbia"
                width={181}
                height={44}
                className="h-11 w-auto"
                priority
              />
              <div className="h-8 w-px bg-gold" />
              <span className="text-typography-primary-invert text-xl font-normal">
                Service BC Queue Management
              </span>
            </Link>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-typography-primary-invert hover:bg-white hover:bg-opacity-10 px-4 py-2 rounded transition-colors font-normal inline-block"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-button-primary hover:bg-button-primary-hover text-typography-primary-invert px-4 py-2 rounded transition-colors font-normal border border-white border-opacity-30 inline-block"
            >
              Register
            </Link>
            <Link
              href="/help"
              className="text-typography-primary-invert hover:bg-white hover:bg-opacity-10 px-4 py-2 rounded transition-colors font-normal flex items-center space-x-1"
            >
              <span>📖</span>
              <span>Help</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
