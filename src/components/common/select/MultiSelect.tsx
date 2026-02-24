"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import SelectIcon from "@/components/common/select/SelectIcon"

type Option = {
  key: string
  label: string
}

type MultiSelectProps = {
  id?: string
  label: string
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export const MultiSelect = ({
  id,
  label,
  options,
  selected,
  onChange,
  placeholder = "Search...",
  disabled = false,
}: MultiSelectProps) => {
  const [query, setQuery] = useState("")
  const [focusedWithin, setFocusedWithin] = useState(false)

  const lower = query.trim().toLowerCase()

  // Show options that match the query and are not already selected
  const visibleOptions = useMemo(() => {
    // when there's a query, filter by label and exclude selected
    if (lower)
      return options.filter(
        (o) => o.label.toLowerCase().includes(lower) && !selected.includes(o.key)
      )
    // when focused but no query, show all unselected options
    if (focusedWithin) return options.filter((o) => !selected.includes(o.key))
    return []
  }, [options, lower, selected, focusedWithin])

  const isSelected = (key: string) => selected.includes(key)

  const toggle = (key: string) => {
    if (disabled) return
    if (isSelected(key)) onChange(selected.filter((s) => s !== key))
    else onChange([...selected, key])
  }

  const remove = (e: React.MouseEvent, key: string) => {
    e.stopPropagation()
    if (disabled) return
    onChange(selected.filter((s) => s !== key))
  }

  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(e: Event) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setQuery("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [])

  // track focus within the component so we can show options when input is focused
  useEffect(() => {
    function handleFocusIn(e: FocusEvent) {
      if (rootRef.current?.contains(e.target as Node)) setFocusedWithin(true)
    }
    function handleFocusOut(e: FocusEvent) {
      // relatedTarget is the element receiving focus; if it's still inside, keep focusedWithin
      const related = (e as FocusEvent).relatedTarget as Node | null
      if (rootRef.current) {
        if (!related || !rootRef.current.contains(related)) setFocusedWithin(false)
      }
    }

    document.addEventListener("focusin", handleFocusIn)
    document.addEventListener("focusout", handleFocusOut)

    return () => {
      document.removeEventListener("focusin", handleFocusIn)
      document.removeEventListener("focusout", handleFocusOut)
    }
  }, [])

  // keyboard navigation
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const optionsRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    if (lower && visibleOptions.length > 0) {
      setActiveIndex(0)
    } else {
      setActiveIndex(null)
    }
    // reset refs array length
    optionsRefs.current = []
  }, [lower, visibleOptions.length])

  const inputRef = useRef<HTMLInputElement | null>(null)

  const focusOption = (index: number) => {
    const el = optionsRefs.current[index]
    if (el) {
      el.focus()
      setActiveIndex(index)
    }
  }

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (visibleOptions.length > 0) {
        // wait for options to be focusable
        setTimeout(() => focusOption(0), 0)
      }
    }
    if (e.key === "Escape") {
      setQuery("")
      ;(e.target as HTMLInputElement).blur()
    }
  }

  return (
    <div ref={rootRef}>
      <label className="block text-xs font-medium text-typography-primary" htmlFor={id}>
        {label}
      </label>

      <div className="relative">
        {/** biome-ignore lint/a11y/useSemanticElements: <Custom component> */}
        <input
          id={id}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          ref={inputRef}
          onKeyDown={onInputKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          role="combobox"
          aria-controls={`${id ?? "multi-select"}-list`}
          aria-expanded={Boolean(lower || focusedWithin)}
          aria-activedescendant={
            activeIndex !== null && visibleOptions[activeIndex]
              ? `${id ?? "multi-select"}-opt-${visibleOptions[activeIndex].key}`
              : undefined
          }
          className="mt-xs block w-full rounded-md border border-border-dark px-sm py-xs pr-9 text-xs text-typography-primary disabled:cursor-not-allowed disabled:bg-gray-100"
          aria-label={placeholder}
        />

        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <SelectIcon />
        </span>
      </div>

      {lower || focusedWithin ? (
        // biome-ignore lint/a11y/useSemanticElements: <Custom component>
        <div
          id={`${id ?? "multi-select"}-list`}
          role="listbox"
          aria-label={label}
          className="mt-xs max-h-48 overflow-auto rounded-md border border-border-dark bg-white"
        >
          {visibleOptions.length === 0 ? (
            <div className="p-sm text-xs text-typography-secondary">No results</div>
          ) : (
            visibleOptions.map((opt, idx) => {
              const onOptionKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault()
                  const next = idx + 1 < visibleOptions.length ? idx + 1 : 0
                  focusOption(next)
                } else if (e.key === "ArrowUp") {
                  e.preventDefault()
                  const prev = idx - 1 >= 0 ? idx - 1 : visibleOptions.length - 1
                  focusOption(prev)
                } else if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  toggle(opt.key)
                } else if (e.key === "Escape") {
                  setQuery("")
                  inputRef.current?.focus()
                }
              }

              const optionId = `${id ?? "multi-select"}-opt-${opt.key}`
              const isActive = activeIndex === idx
              return (
                // biome-ignore lint/a11y/useSemanticElements: <custom component>
                <button
                  key={opt.key}
                  type="button"
                  role="option"
                  id={optionId}
                  aria-posinset={idx + 1}
                  aria-setsize={visibleOptions.length}
                  aria-selected={isSelected(opt.key)}
                  ref={(el) => {
                    optionsRefs.current[idx] = el
                  }}
                  tabIndex={0}
                  onFocus={() => setActiveIndex(idx)}
                  onKeyDown={onOptionKeyDown}
                  onClick={() => toggle(opt.key)}
                  className={`w-full text-left flex items-center justify-between px-sm py-2 text-xs cursor-pointer hover:bg-gray-50 focus:outline-none focus:bg-gray-100 ${
                    isActive ? "bg-gray-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-ellipsis break-words">{opt.label}</span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      ) : null}

      {/* Selected items list */}
      <div className="mt-sm flex flex-wrap gap-2">
        {selected
          .map((key) => options.find((o) => o.key === key))
          .filter(Boolean)
          .map((opt) => {
            const o = opt as Option
            const matches = lower !== "" && o.label.toLowerCase().includes(lower)
            return (
              <div
                key={o.key}
                className="inline-flex items-center gap-2 rounded-full border border-border-light bg-white px-2 py-1"
              >
                <span
                  className={`text-xs text-typography-secondary ${matches ? "font-semibold" : ""}`}
                >
                  {o.label}
                </span>
                {!disabled && (
                  <button
                    type="button"
                    aria-label={`Remove ${o.label}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => remove(e as React.MouseEvent, o.key)}
                    className="inline-flex px-2 h-5 items-center justify-center rounded-full border border-border-light bg-button-secondary text-icon-primary hover:bg-button-danger hover:text-white text-sm font-semibold"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default MultiSelect
