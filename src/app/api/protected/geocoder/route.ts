"use server"

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

type GeocoderAddressResponse = {
  features: Array<{
    properties: {
      fullAddress: string
      siteID: string
      siteName?: string
      unitNumber?: string
      civicNumber?: string
      streetName?: string
      localityName?: string
      provinceCode?: string
    }
    geometry: {
      coordinates: [number, number]
    }
  }>
}

/**
 * GET /api/protected/geocoder
 * Autocomplete endpoint for BC Address Geocoder
 * @param request Next.js request object
 * @returns JSON response with address suggestions
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const addressString = searchParams.get("address")

  if (!addressString || addressString.trim() === "") {
    return NextResponse.json({ error: "Address query parameter is required" }, { status: 400 })
  }

  if (addressString.length < 2) {
    return NextResponse.json({ error: "Address must be at least 2 characters" }, { status: 400 })
  }

  const apiKey = process.env.BC_GEOCODER_API_KEY
  const clientId = process.env.BC_GEOCODER_CLIENT_ID
  const baseUrl = process.env.BC_GEOCODER_BASE_URL

  if (!apiKey || !baseUrl) {
    console.error("Missing required environment variables for BC Geocoder")
    return NextResponse.json({ error: "Geocoder service is not configured" }, { status: 500 })
  }

  try {
    const params = new URLSearchParams({
      addressString,
      outputFormat: "json",
      autoComplete: "true",
      maxResults: "10",
      echo: "true",
      brief: "false",
      fuzzyMatch: "true",
    })

    const url = `${baseUrl}/addresses.json?${params.toString()}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: apiKey,
        ...(clientId && { "client-id": clientId }),
      },
    })

    if (!response.ok) {
      console.error(`Geocoder API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: `Geocoder service returned status ${response.status}` },
        { status: response.status }
      )
    }

    const data: GeocoderAddressResponse = await response.json()

    const suggestions = data.features.map((feature) => ({
      id: feature.properties.siteID,
      label: feature.properties.fullAddress,
      address: feature.properties.fullAddress,
      siteName: feature.properties.siteName,
      civicNumber: feature.properties.civicNumber,
      streetName: feature.properties.streetName,
      locality: feature.properties.localityName,
      province: feature.properties.provinceCode,
      coordinates: {
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      },
    }))

    return NextResponse.json(
      {
        suggestions,
        count: suggestions.length,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300", // Cache for 5 minutes
        },
      }
    )
  } catch (error) {
    console.error("Geocoder API error:", error)
    return NextResponse.json({ error: "Failed to fetch address suggestions" }, { status: 500 })
  }
}
