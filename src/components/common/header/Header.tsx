"use client"

import Link from "next/link"
import { Loginout, SvgBcLogo } from "@/components"

export const Header = () => {
  return (
    <header className="flex flex-row w-full min-h-[65px] h-[65px] justify-center border-b-(length:--border-width-sm) border-b-border-light px-md">
      {/** Above is bcds-header class */}
      {/** below is bcds-header--container class */}
      <div className="flex flex-row grow max-w-[1200px] justify-between items-center gap-(--length-padding-md)">
        <div className="flex max-h-[65px] h-[65px] max-w-[129px] w-[129px]">
          <Link href="/" title="BC Government home" className="flex w-full h-full">
            <SvgBcLogo />
          </Link>
        </div>

        <Loginout />
      </div>
    </header>
  )
}
export default Header
