export type Location = {
  name: string
  // `number` is stored as a string (per requirements)
  number: string
  timezone: string
  streetAddress: string
  mailAddress?: string
  phoneNumber?: string
  latitude: number
  longitude: number
}

export type LocationList = Location[]

export type CreateLocation = Omit<Location, "number"> & { number?: string }
export type UpdateLocation = Partial<Omit<Location, "number">>
