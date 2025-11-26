"use client"

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid"

type SearchInputProps = {
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * A search input component for filtering data in a datatable.
 *
 * Classnames are used to position the search icon within the input field,
 * which is achieved using absolute positioning since the input element doesnt accept child elements.
 *
 * @param props - The props for the SearchInput component
 * @property props.handleSearchChange - Function to handle changes in the search input
 */
export const SearchInput = ({ handleSearchChange }: SearchInputProps) => {
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-5 -translate-y-1/2 h-5 w-5 text-icon-secondary" />
      <input
        type="text"
        placeholder="Search..."
        onChange={handleSearchChange}
        aria-label="Search table"
        className="w-full rounded border border-border-light bg-background-default py-2 pl-10 pr-4 text-typography-primary placeholder-typography-disabled focus:border-border-active focus:outline-none"
      />
    </div>
  )
}
