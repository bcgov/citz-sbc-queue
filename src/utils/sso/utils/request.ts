import { retrieveToken } from "./retrieveToken"

type RequestParams = {
  integrationEndpoint?: boolean
  endpoint: string
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: Record<string, unknown> | Record<string, unknown>[]
}

const {
  SSO_INTEGRATION_ID,
  SSO_ENVIRONMENT = "dev",
  CSS_API_URL = "https://api.loginproxy.gov.bc.ca/api/v1",
} = process.env

/**
 * Makes an authenticated request to the CSS API.
 * @param {RequestParams} params - The request parameters.
 */
// TODO: Make JSDoc format consistent - use TSDoc style: @param params - Description (no curly braces)
// TODO: Add @returns tag - @returns {Promise<Record<string, unknown> | string | undefined>} The API response
// TODO: Consider adding @example tag to show usage patterns
export const request = async (
  params: RequestParams
): Promise<Record<string, unknown> | string | undefined> => {
  "use server"
  try {
    // TODO: Remove default value for 'endpoint' - it should be required, not optional with empty string default
    const { integrationEndpoint = false, endpoint = "", method = "GET", body } = params

    // Get token.
    const access_token = await retrieveToken()
    if (!access_token) throw new Error("No access token provided by retrieveToken().")

    // TODO: Validate SSO_INTEGRATION_ID when integrationEndpoint is true
    // if (integrationEndpoint && !SSO_INTEGRATION_ID) {
    //   throw new Error("SSO_INTEGRATION_ID must be configured for integration endpoints")
    // }

    // Create headers.
    const headers = {
      Authorization: `Bearer ${access_token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    }

    // Create request url.
    const integration = `integrations/${SSO_INTEGRATION_ID}/`
    // TODO: Simplify nested template literal for better readability
    // const url = `${CSS_API_URL}/${integrationEndpoint ? integration : ""}${SSO_ENVIRONMENT}/${endpoint}`
    const url = `${CSS_API_URL}/${integrationEndpoint ? integration : ""}${`${SSO_ENVIRONMENT}/`}${endpoint}`

    // Fetch request.
    const response = await fetch(
      url,
      body
        ? {
            method,
            headers,
            body: JSON.stringify(body),
          }
        : {
            method,
            headers,
          }
    )

    // Return json if 200 or 201 response, otherwise return text.
    if ([200, 201].includes(response.status)) return await response.json()
    return await response.text()
  } catch (error) {
    console.error(`Error in request of CSS API. Endpoint: ${params.endpoint}.`, error)
  }
}
