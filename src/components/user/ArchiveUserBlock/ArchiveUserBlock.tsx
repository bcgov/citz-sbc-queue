"use client"

import { useEffect, useState } from "react"
import { Loginout } from "@/components/common"
import {
  DialogActions,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Modal,
} from "@/components/common/dialog"
import type { StaffUser } from "@/generated/prisma/client"
import { useAuth } from "@/hooks"

type ArchiveUserBlockProps = {
  getStaffUserBySub: (sub: string) => Promise<StaffUser | null>
}

export const ArchiveUserBlock = ({ getStaffUserBySub }: ArchiveUserBlockProps) => {
  const { isAuthenticated, sub } = useAuth()
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null)

  // Fetch the current user on component mount or when sub changes
  useEffect(() => {
    let mounted = true
    const fetchUser = async () => {
      const user = sub ? await getStaffUserBySub(sub) : null
      if (mounted) setCurrentUser(user)
    }

    fetchUser()

    return () => {
      mounted = false
    }
  }, [sub, getStaffUserBySub])

  if (!isAuthenticated || !currentUser) return null
  const currentUserIsArchived = currentUser.deletedAt !== null

  if (currentUserIsArchived) {
    return (
      // biome-ignore lint/suspicious/noEmptyBlockStatements: <Shouldnt be able to close the modal>
      <Modal open={true} onClose={() => {}} disableEscapeKeyClose={true} size="sm">
        <DialogHeader>
          <DialogTitle>Account Archived</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="p-sm">
            Your account is archived. You will not be able to perform any actions until your account
            is restored by an Administrator.
          </div>
        </DialogBody>

        <DialogActions>
          <Loginout />
        </DialogActions>
      </Modal>
    )
  }

  return null
}
