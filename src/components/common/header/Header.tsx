"use client"

import Image from "next/image"
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
            {/* <Image
              src="/bcgov/BCID_H_RGB_pos.svg"
              alt="BC Government logo"
              className="flex items-center"
              width={180}
              height={56}
              fetchPriority="high"
            /> */}
            <SvgBcLogo />
          </Link>
        </div>

        <Loginout />
      </div>
    </header>
  )
}
export default Header
