"use client"

import { LoginButton, LogoutButton } from "@/components"
import { useAuth } from "@/hooks"
import styles from "./Loginout.module.css"

export const Loginout = () => {
  return (
    <div className={styles.controls}>
      {!useAuth().isAuthenticated && <LoginButton />}
      {useAuth().isAuthenticated && <LogoutButton />}
    </div>
  )
}
