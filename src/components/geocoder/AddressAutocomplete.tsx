"use client"

import { useEffect, useRef, useState } from "react"
import type { AddressSuggestion } from "@/hooks"
import { useGeocodeAutocomplete } from "@/hooks"
import { useAuth } from "@/hooks/useAuth"

export type AddressAutocompleteProps = {
  id: string
  label: string
  value: string
  onSelect: (suggestion: AddressSuggestion) => void
  onChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
  required?: boolean
  error?: string
}

export const AddressAutocomplete = ({
  id,
  label,
  value,
  onSelect,
  onChange,
  disabled = false,
  placeholder = "Start typing an address...",
  required = false,
  error,
}: AddressAutocompleteProps) => {
  const { authorizationHeader } = useAuth()
  const {
    suggestions,
    loading,
    error: searchError,
    search,
    clear,
  } = useGeocodeAutocomplete({ minChars: 2, debounceMs: 300, authorizationHeader })
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const combinedError = error || searchError

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isOpen])

  const handleInputChange = async (newValue: string) => {
    setInputValue(newValue)
    onChange?.(newValue)

    if (newValue.trim() === "") {
      clear()
      setIsOpen(false)
    } else {
      await search(newValue)
      setIsOpen(true)
    }
  }

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setInputValue(suggestion.label)
    onSelect(suggestion)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-xs font-medium text-typography-primary">
        {label}
        {required && <span className="ml-xs text-error">*</span>}
      </label>

      <div className="relative mt-xs">
        {/** biome-ignore lint/a11y/useSemanticElements: <> */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => inputValue.length >= 2 && setIsOpen(true)}
          disabled={disabled}
          placeholder={placeholder}
          className="block w-full rounded-md border border-border-dark px-sm py-xs text-xs text-typography-primary placeholder-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={`${id}-dropdown`}
          aria-expanded={isOpen}
          role="combobox"
        />

        {loading && (
          <div className="absolute right-sm top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-border-dark border-t-primary" />
          </div>
        )}
      </div>

      {/* Error message */}
      {combinedError && <p className="mt-xs text-xs text-error">{combinedError}</p>}

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        // biome-ignore lint/a11y/useSemanticElements: <>
        <div
          ref={dropdownRef}
          id={`${id}-dropdown`}
          className="absolute top-full z-10 mt-xs w-full rounded-md border border-border-dark bg-white shadow-lg"
          role="listbox"
        >
          <ul className="max-h-80 overflow-y-auto py-0">
            {suggestions.map((suggestion: AddressSuggestion, index: number) => (
              <li key={`${suggestion.id}-${index}`}>
                {/** biome-ignore lint/a11y/useSemanticElements: <> */}
                <button
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSelectSuggestion(suggestion)
                    }
                  }}
                  className={`w-full px-sm py-xs text-left text-xs transition-colors hover:bg-primary-light focus:bg-primary-light focus:outline-none ${
                    index === 0 ? "pt-xs" : ""
                  } ${index === suggestions.length - 1 ? "pb-xs" : ""}`}
                  role="option"
                  aria-selected={false}
                >
                  <div className="font-medium text-typography-primary">{suggestion.label}</div>
                  {suggestion.siteName && (
                    <div className="text-gray-500">{suggestion.siteName}</div>
                  )}
                  {suggestion.locality && (
                    <div className="text-xs text-gray-400">
                      {suggestion.locality}
                      {suggestion.province && `, ${suggestion.province}`}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No results message */}
      {isOpen && !loading && suggestions.length === 0 && inputValue.length >= 2 && (
        <div className="absolute top-full z-10 mt-xs w-full rounded-md border border-border-dark bg-white px-sm py-xs text-xs text-gray-500 shadow-lg">
          No addresses found
        </div>
      )}
    </div>
  )
}
