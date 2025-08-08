export const DEV_AUTH_URL = "https://dev.loginproxy.gov.bc.ca/auth" as const
export const TEST_AUTH_URL = "https://test.loginproxy.gov.bc.ca/auth" as const
export const PROD_AUTH_URL = "https://loginproxy.gov.bc.ca/auth" as const

export const AUTH_URLS = {
  dev: DEV_AUTH_URL,
  test: TEST_AUTH_URL,
  prod: PROD_AUTH_URL,
} as const

export const SITE_MINDER_DEV_LOGOUT_URL = "https://logontest7.gov.bc.ca/clp-cgi/logoff.cgi"
export const SITE_MINDER_TEST_LOGOUT_URL = "https://logontest7.gov.bc.ca/clp-cgi/logoff.cgi"
export const SITE_MINDER_PROD_LOGOUT_URL = "https://logon7.gov.bc.ca/clp-cgi/logoff.cgi"

export const SITE_MINDER_LOGOUT_URLS = {
  dev: SITE_MINDER_DEV_LOGOUT_URL,
  test: SITE_MINDER_TEST_LOGOUT_URL,
  prod: SITE_MINDER_PROD_LOGOUT_URL,
} as const

export const IDIR_IDENTITY_PROVIDERS = ["idir", "azureidir"] as const
export const BCEID_IDENTITY_PROVIDERS = ["bceidbasic", "bceidbusiness", "bceidboth"] as const
export const GITHUB_IDENTITY_PROVIDERS = ["githubbcgov"] as const
export const DIGITAL_CREDENTIALS_IDENTITY_PROVIDERS = ["digitalcredential"] as const
