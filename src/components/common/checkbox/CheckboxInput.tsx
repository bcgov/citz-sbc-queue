type CheckboxInputProps = {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled: boolean
}

export const CheckboxInput = ({ id, label, checked, onChange, disabled }: CheckboxInputProps) => {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-xs font-medium text-typography-primary">
        {label}
      </label>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 rounded border-border-dark disabled:cursor-not-allowed"
      />
    </div>
  )
}
