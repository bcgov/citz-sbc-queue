import type { Location } from "./types"

// In-memory mock locations. This is temporary and intended for development
// until a real backend is available. Module-level state is used for simplicity.
export const locations: Location[] = [
  {
    name: "Downtown Service Centre",
    number: "001",
    timezone: "America/Vancouver",
    streetAddress: "123 Government St, Victoria, BC V8W 1R7",
    mailAddress: "PO Box 1234, Victoria, BC V8W 2A1",
    phoneNumber: "250-555-0100",
    latitude: 48.4284,
    longitude: -123.3656,
  },
  {
    name: "North Branch Office",
    number: "002",
    timezone: "America/Vancouver",
    streetAddress: "456 Maple Ave, Nanaimo, BC V9R 5G8",
    mailAddress: "PO Box 5678, Nanaimo, BC V9R 6H1",
    phoneNumber: "250-555-0200",
    latitude: 49.1659,
    longitude: -123.9401,
  },
  {
    name: "Victoria Regional Office",
    number: "003",
    timezone: "America/Vancouver",
    streetAddress: "789 Douglas St, Victoria, BC V8W 2B1",
    mailAddress: "PO Box 9000, Victoria, BC V8W 9A1",
    phoneNumber: "250-555-0300",
    latitude: 48.4284,
    longitude: -123.3656,
  },
  {
    name: "Test Office",
    number: "999",
    timezone: "America/Vancouver",
    streetAddress: "1 Test Lane, Testville, BC T0T 0T0",
    mailAddress: "",
    phoneNumber: "250-555-0999",
    latitude: 49.0000,
    longitude: -123.0000,
  },
  {
    name: "Eastside Community Office",
    number: "004",
    timezone: "America/Vancouver",
    streetAddress: "321 Oak St, Courtenay, BC V9N 2B3",
    mailAddress: "PO Box 4321, Courtenay, BC V9N 3D4",
    phoneNumber: "250-555-0400",
    latitude: 49.6846,
    longitude: -124.9810,
  },
]
