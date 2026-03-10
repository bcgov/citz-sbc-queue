# Geocoder Components

Address autocomplete components powered by the BC Address Geocoder API.

## AddressAutocomplete

A controlled autocomplete input component for address selection.

### Usage

```tsx
import { useState } from "react"
import { AddressAutocomplete } from "@/components/geocoder"
import type { AddressSuggestion } from "@/hooks/useGeocodeAutocomplete"

export function LocationForm() {
  const [address, setAddress] = useState("")
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null)

  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    setSelectedAddress(suggestion)
    setAddress(suggestion.label)

    // Use selected address data
    console.log("Coordinates:", suggestion.coordinates)
    console.log("Site ID:", suggestion.id)
  }

  return (
    <form>
      <AddressAutocomplete
        id="location-address"
        label="Location Address"
        value={address}
        onSelect={handleSelectAddress}
        onChange={setAddress}
        placeholder="Enter address to search..."
        required
      />

      {selectedAddress && (
        <div>
          <p>Street: {selectedAddress.streetName}</p>
          <p>City: {selectedAddress.locality}</p>
          <p>Civic #: {selectedAddress.civicNumber}</p>
        </div>
      )}
    </form>
  )
}
```

### Props

- `id` (string) - Unique identifier for the input
- `label` (string) - Label text displayed above the input
- `value` (string) - Current input value
- `onSelect` (function) - Callback when a suggestion is selected; receives the full `AddressSuggestion` object
- `onChange?` (function) - Optional callback when input value changes
- `disabled?` (boolean) - Disable the input (default: false)
- `placeholder?` (string) - Placeholder text (default: "Start typing an address...")
- `required?` (boolean) - Show required indicator (default: false)
- `error?` (string) - Error message to display below input

### AddressSuggestion Object

```tsx
type AddressSuggestion = {
  id: string                      // Site ID from geocoder
  label: string                   // Full address display text
  address: string                 // Full address
  siteName?: string               // Building/facility name
  civicNumber?: string            // Civic address number
  streetName?: string             // Street name
  locality?: string               // City/town name
  province?: string               // Province code (BC)
  coordinates: {
    latitude: number              // Latitude
    longitude: number             // Longitude
  }
}
```

### Features

- **Autocomplete search** - Queries BC Address Geocoder API as user types
- **Loading state** - Animated spinner while searching
- **Error handling** - Displays search errors and custom validation errors
- **Keyboard accessible** - Full keyboard navigation support with ARIA labels
- **Click outside detection** - Dropdown closes when clicking outside
- **Suggestion details** - Shows site names, localities, and provinces when available
- **Minimum characters** - Only searches when input is 2+ characters
- **No results message** - Shows helpful message when no addresses found

### Styling

Component uses BC Government Design System TailwindCSS classes:
- `text-xs`, `text-sm`, `text-base` for typography
- `px-sm`, `py-xs` for spacing
- `border-border-dark` for borders
- `text-typography-primary` for main text
- `text-error` for errors
- `primary` colors for highlights

### Environment Setup

Required environment variables (see `.env.local`):

```
BC_GEOCODER_API_KEY=your_api_key
BC_GEOCODER_BASE_URL=https://geocoder.api.gov.bc.ca
BC_GEOCODER_CLIENT_ID=optional_client_id
```

Get API keys at: https://api.gov.bc.ca/devportal/api-directory/273
