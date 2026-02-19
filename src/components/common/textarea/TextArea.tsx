type TextAreaProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  minLength?: number
  maxLength?: number
  required?: boolean
  className?: string
  rows?: number
}

export const TextArea = ({
  id,
  label,
  value,
  onChange,
  disabled = false,
  placeholder,
  minLength,
  maxLength,
  required = false,
  className = "",
  rows = 4,
}: TextAreaProps) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-medium text-typography-primary">
        <span>{label}</span>
        {required && (
          <span className="ml-1 text-red-600" aria-hidden>
            *
          </span>
        )}
      </label>
      <div className="relative">
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          minLength={minLength}
          maxLength={maxLength}
          rows={rows}
          className="mt-xs block w-full rounded-md border border-border-dark px-sm py-xs text-xs text-typography-primary disabled:cursor-not-allowed disabled:bg-gray-100"
        />

        {(minLength !== undefined || maxLength !== undefined) && (
          <div className="absolute right-2 bottom-1 text-xs" aria-hidden>
            <span
              data-testid="length-indicator"
              title={
                minLength !== undefined && value.length < minLength
                  ? `min ${minLength} characters`
                  : undefined
              }
              className={
                value.length < (minLength ?? 0) ? "text-red-600" : "text-typography-secondary"
              }
            >
              {`${value.length}${maxLength !== undefined ? `/${maxLength}` : ""}`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
