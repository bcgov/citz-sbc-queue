"use client"

import { createContext, useContext } from "react"
import type { DialogContextType } from "./types"

export const DialogContext = createContext<DialogContextType | null>(null)

/**
 * Custom hook to access the dialog context.
 * @returns {DialogContextType | null} The dialog context value or null if not within a DialogProvider.
 */
export const useDialogContext = () => {
  const context = useContext(DialogContext)
  return context
}
