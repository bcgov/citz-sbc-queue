const {
  CSS_API_CLIENT_ID,
  CSS_API_CLIENT_SECRET,
  CSS_API_URL = "https://api.loginproxy.gov.bc.ca/api/v1",
} = process.env

/**
 * Retrieves an access token from the CSS API using client credentials.
 * @returns {Promise<string | undefined>} The access token or undefined if an error occurs.
 */
export const retrieveToken = async () => {
  "use server"
  try {
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

    const data = await response.text()
    const access_token = JSON.parse(data).access_token

    return access_token
  } catch (error) {
    console.error(`Error in retrieveToken for CSS API.`, error)
  }
}
