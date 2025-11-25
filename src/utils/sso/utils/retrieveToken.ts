const {
  CSS_API_CLIENT_ID,
  CSS_API_CLIENT_SECRET,
  CSS_API_URL = "https://api.loginproxy.gov.bc.ca/api/v1",
} = process.env

type TokenResponse = {
  access_token: string
}

/**
 * Retrieves an access token from the CSS API using client credentials.
 * @returns The access token or undefined if an error occurs.
 */
export const retrieveToken = async (): Promise<string | undefined> => {
  "use server"
  try {
    if (!CSS_API_CLIENT_ID || !CSS_API_CLIENT_SECRET) {
      throw new Error("CSS_API_CLIENT_ID and CSS_API_CLIENT_SECRET env vars must be configured")
    }

    const headers = {
      Authorization: `Basic ${btoa(`${CSS_API_CLIENT_ID}:${CSS_API_CLIENT_SECRET}`)}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    }

    const response = await fetch(`${CSS_API_URL}/token`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        grant_type: "client_credentials",
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to retrieve token from CSS API. Status: ${response.status}`)
    }

    const data = (await response.json()) as TokenResponse

    if (!data.access_token) {
      throw new Error("No access token returned from CSS API.")
    }

    return data.access_token
  } catch (error) {
    console.error(`Error in retrieveToken for CSS API.`, error)
  }
}
