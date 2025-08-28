export type CloseButtonProps = {
  onClick: () => void
}

/**
 * CloseButton component for displaying a button to close the dialog.
 *
 * @param {CloseButtonProps} props - Props for the close button component.
 *
 * @property {() => void} onClick - Function called when the close button is clicked.
 */
export const CloseButton = ({ onClick }: CloseButtonProps) => {
  return (
    <button
      type="button"
      aria-label="Close dialog"
      className="w-[32px] h-[32px] flex items-center justify-center rounded-[4px] text-typography-primary"
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="w-5 h-5 flex-none"
      >
        <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="2" />
      </svg>
    </button>
  )
}

export default CloseButton
