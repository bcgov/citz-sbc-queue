const {
  CSS_API_CLIENT_ID,
  CSS_API_CLIENT_SECRET,
  CSS_API_URL = "https://api.loginproxy.gov.bc.ca/api/v1",
} = process.env

// TODO: Define a type for the token response
// Example: type TokenResponse = { access_token: string, token_type?: string, expires_in?: number }

/**
 * Retrieves an access token from the CSS API using client credentials.
 * @returns {Promise<string | undefined>} The access token or undefined if an error occurs.
 */
// TODO: Add explicit return type -> export const retrieveToken = async (): Promise<string | undefined> => {
export const retrieveToken = async () => {
  "use server"
  try {
    // TODO: Validate env vars before use to prevent runtime errors
    // if (!CSS_API_CLIENT_ID || !CSS_API_CLIENT_SECRET) {
    //   throw new Error("CSS_API_CLIENT_ID and CSS_API_CLIENT_SECRET must be configured")
    // }

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

    // TODO: Use response.json() instead of response.text() + JSON.parse()
    // This is safer and avoids potential JSON parsing errors
    // const data = await response.json() as TokenResponse
    // return data.access_token
    const data = await response.text()
    const access_token = JSON.parse(data).access_token

    return access_token
  } catch (error) {
    console.error(`Error in retrieveToken for CSS API.`, error)
  }
}
