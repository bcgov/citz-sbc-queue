"use client"

import { Transition } from "@headlessui/react"
import { Bars3Icon } from "@heroicons/react/24/solid"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Loginout, SvgBcLogo } from "@/components"
import { Navigation } from "./navigation"

export const Header = () => {
  const pathname = usePathname()
  const [showNavList, setShowNavList] = useState(false)

  // Close nav after page changes
  useEffect(() => {
    setShowNavList(false)
  }, [pathname])

  const HamburgerNav = () => {
    const toggleNavList = () => {
      setShowNavList(!showNavList)
    }
    return (
      <button
        type="button"
        onClick={toggleNavList}
        className="icon secondary"
        aria-label={`Show Navigation Items`}
      >
        <Bars3Icon className={`h-4 w-4 text-icon-secondary`} />
      </button>
    )
  }

  const BCGovLogo = () => {
    return (
      <div className="flex max-h-[65px] h-[65px] max-w-[129px] w-[129px] px-sm">
        <Link href="/" title="BC Government home" className="flex w-full h-full">
          <SvgBcLogo />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-row w-full min-h-[65px] h-[65px] justify-center border-b-sm border-b-border-light">
        {/** Above is bcds-header class */}
        {/** below is bcds-header--container class */}
        <div className="flex flex-row grow max-w-[1200px] justify-between ">
          <BCGovLogo />
          <div className="flex flex-row  justify-around gap-sm px-sm items-center">
            {/** Display navagation as a hamburger icon button on mobile devices */}
            <div className="contents md:hidden ">
              <HamburgerNav />
            </div>
            <Loginout />
          </div>
        </div>
      </div>
      {/** List navigation only shown on non-mobile devices */}
      <div className="max-sm:hidden lg:contents">
        <Navigation />
      </div>
      {/** Show list navigation when hamburger button is selected */}
      <Transition
        show={showNavList}
        enter="duration-500" // Open speed
        enterFrom="transform max-h-0" // Starting point on opening
        enterTo="transform max-h-[300px]" // End point on opening
        leave="duration-300" // Closing speed
        leaveFrom="transform max-h-[300px]" // Starting point on closing
        leaveTo="transform max-h-0" // End point on closing
      >
        {/** Apply this class to all elements in the Transition */}
        <div className="transition-all ease-in-out overflow-hidden">
          <Navigation />
        </div>
      </Transition>
    </div>
  )
}
export default Header
