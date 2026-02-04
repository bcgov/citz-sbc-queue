"use client"

import { useLocations } from "@/hooks"

export const ExampleLocation = () => {
  const location = useLocations()
  console.log({ location })
  return <div>Example Location Component</div>
}
