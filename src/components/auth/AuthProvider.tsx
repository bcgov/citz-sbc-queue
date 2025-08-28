import { Suspense } from "react"
import AuthExpiryModal from "./AuthExpiryModal"
import AuthInitializer from "./AuthInitializer"
import LogoutHandler from "./LogoutHandler"

/**
 * AuthProvider component that initializes authentication and handles session expiration.
 */
export const AuthProvider = () => {
  return (
    <>
      <AuthInitializer />
      <AuthExpiryModal />
      <Suspense fallback={null}>
        {/* Suspense is required because LogoutHandler uses useSearchParams */}
        <LogoutHandler />
      </Suspense>
    </>
  )
}

export default AuthProvider
