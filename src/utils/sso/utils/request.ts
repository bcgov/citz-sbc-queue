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
 * @param params - The request parameters.
 */
export const request = async (
  params: RequestParams
): Promise<Record<string, unknown> | string | undefined> => {
  "use server"
  try {
    const { integrationEndpoint = false, endpoint, method = "GET", body } = params

    // Get token.
    const access_token = await retrieveToken()
    if (!access_token) throw new Error("No access token provided by retrieveToken().")

    if (integrationEndpoint && !SSO_INTEGRATION_ID) {
      throw new Error(
        "SSO_INTEGRATION_ID env variable must be configured for CSS API integration endpoints"
      )
    }

    // Create headers.
    const headers = {
      Authorization: `Bearer ${access_token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    }

    // Create request url.
    const integrationEndpointSegment = integrationEndpoint
      ? `integrations/${SSO_INTEGRATION_ID}/`
      : ""
    const url = `${CSS_API_URL}/${integrationEndpointSegment}${`${SSO_ENVIRONMENT}/`}${endpoint}`

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
