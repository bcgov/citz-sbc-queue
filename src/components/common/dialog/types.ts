export type DialogSize = "sm" | "md" | "lg" | "xl"

export type Align = "start" | "center" | "end" | "between"

export type DialogPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "relative"

export type DialogOffset = {
  x?: number
  y?: number
}

export type DialogContextType = {
  titleId: string
  descriptionId: string
}
