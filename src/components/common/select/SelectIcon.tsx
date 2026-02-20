export type SelectIconProps = {
  className?: string
}

/**
 * SelectIcon component for displaying a visual indicator on select inputs.
 *
 * @param {SelectIconProps} props - Props for the select icon component.
 *
 * @property {string} [className] - Optional additional className for the wrapper.
 */
export const SelectIcon = ({ className = "" }: SelectIconProps) => {
  return (
    <span
      aria-hidden="true"
      className={`w-[32px] h-[32px] flex items-center justify-center rounded-[4px] text-typography-primary ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="w-5 h-5 flex-none"
      >
        <path
          d="M6 8l4 4 4-4"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export default SelectIcon
