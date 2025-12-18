import { useAuth } from "@/hooks/useAuth/useAuth"

export function useLocationPermissions() {
  const { hasRole } = useAuth()
  const canCreate = hasRole("Administrator")
  const canDelete = hasRole("Administrator")
  const canUpdate = hasRole("Administrator") || hasRole("SDM")
  return { canCreate, canUpdate, canDelete }
}
