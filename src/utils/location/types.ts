export type LocationDto = {
  id: string
  name: string
  timezone: string
  streetAddress: string
  mailAddress: string | null
  phoneNumber: string | null
  latitude: number
  longitude: number
  legacyOfficeNumber: number | null
}

export type GetAllLocationsResponse =
  | {
      success: true
      data: {
        locations: LocationDto[]
      }
    }
  | {
      success: false
      error: string
    }

export type CurrentLocationResponse =
  | {
      success: true
      data: {
        location: LocationDto | null
      }
    }
  | {
      success: false
      error: string
    }

export type UpdateCurrentLocationRequest = {
  locationId: string | null
}

export type UpdateCurrentLocationResponse =
  | {
      success: true
      data: {
        locationId: string | null
      }
    }
  | {
      success: false
      error: string
    }
