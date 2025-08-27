import type { Align, DialogPosition, DialogSize } from "./types"

export const DIALOG_SIZE_CLASSES: Record<DialogSize, string> = {
  sm: "max-w-[400px]",
  md: "max-w-[600px]",
  lg: "max-w-[800px]",
  xl: "max-w-[1000px]",
}

export const ALIGN_MAP: Record<Align, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
}

export const DIALOG_POSITION_CLASSES: Record<DialogPosition, string> = {
  "top-left": "absolute top-4 left-4",
  "top-center": "absolute top-4 left-1/2 -translate-x-1/2",
  "top-right": "absolute top-4 right-4",
  "center-left": "absolute top-1/2 left-4 -translate-y-1/2",
  center: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  "center-right": "absolute top-1/2 right-4 -translate-y-1/2",
  "bottom-left": "absolute bottom-4 left-4",
  "bottom-center": "absolute bottom-4 left-1/2 -translate-x-1/2",
  "bottom-right": "absolute bottom-4 right-4",
  relative: "relative",
}
