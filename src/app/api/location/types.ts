export type Location = {
  name: string
  id: string
  timezone: string
  streetAddress: string
  mailAddress?: string
  phoneNumber?: string
  latitude: number
  longitude: number
  legacy_office_number?: number
}

export type LocationList = Location[]

export type CreateLocation = Omit<Location, "id"> & { id?: string }
export type UpdateLocation = Partial<Omit<Location, "id">>
