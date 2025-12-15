"use client"

import { useCallback, useMemo } from "react"

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export const Switch = ({ checked, onChange, disabled = false, className }: SwitchProps) => {
  const handleToggle = useCallback(() => {
    if (disabled) {
      return
    }

    if (onChange) {
      onChange(!checked)
    }
  }, [checked, disabled, onChange])

  const stateClasses = useMemo(() => {
    const base =
      "inline-flex items-center gap-2 rounded-full border border-border-light p-0 " +
      "transition-colors select-none "
    const disabledClasses = disabled ? " opacity-50 cursor-not-allowed" : " cursor-pointer"

    return [base, disabledClasses, className ?? ""].join(" ")
  }, [className, disabled])

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={stateClasses}
      aria-pressed={checked}
      disabled={disabled}
    >
      {/* Track */}
      <span
        className={
          "relative inline-flex h-4.5 w-9.5 items-center rounded-full transition-colors " +
          (checked ? " bg-background-dark-blue" : " bg-background-light-gray")
        }
      >
        {/* Circle */}
        <span
          className={
            "inline-block h-3.5 w-3.5 rounded-full bg-white shadow " +
            "transform transition-transform " +
            (checked ? " translate-x-5.5" : " translate-x-1 outline-2 outline-border-light")
          }
        />
      </span>
    </button>
  )
}
