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
