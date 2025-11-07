"use client"

import {LoginButton, LogoutButton} from "@/components"

export const Header = () => {
  return (
    <div className="col-span-8 flex justify-between items-center gap-2 mx-auto">
      <LoginButton />
      <LogoutButton />
    </div>
  )
}
