"use client"

import Image from "next/image"
import Link from "next/link"
import { LoginButton, LogoutButton } from "@/components"
import { useAuth } from "@/hooks"
import styles from "./Header.module.css"

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <Link href="/" aria-label="BC Government home">
            <Image
              src="/bcgov/BCID_H_RGB_pos.svg"
              alt="BC Government logo"
              className={styles.logoImg}
              width={180}
              height={56}
              fetchPriority="high"
            />
          </Link>
        </div>

        <div className={styles.controls}>
          {!useAuth().isAuthenticated && <LoginButton />}
          {useAuth().isAuthenticated && <LogoutButton />}
        </div>
      </div>
    </header>
  )
}
export default Header
