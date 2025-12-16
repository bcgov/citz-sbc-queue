import { useCurrentLocation } from "@/hooks/useLocation"

export const ExampleCurrentLocation = () => {
  const currentLocation = useCurrentLocation()
  console.log("Current Location:", currentLocation)

  return (
    <div className="rounded-md bg-surface-100 border px-4 py-2 text-sm text-surface-700">
      <strong>Current location:</strong>
      
    </div>
  )
}
