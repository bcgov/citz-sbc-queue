type SelectInputProps = {
  id: string
  label: string
  value: string | undefined
  onChange: (value: string) => void
  disabled: boolean
  options: { value: string; label: string }[]
}

export const SelectInput = ({
  id,
  label,
  value,
  onChange,
  disabled,
  options,
}: SelectInputProps) => {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-typography-primary">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-xs block w-full rounded-md border border-border-dark px-sm py-xs text-xs text-typography-primary disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
