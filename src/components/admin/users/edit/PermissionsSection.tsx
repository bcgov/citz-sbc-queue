import type { StaffUser } from "@/generated/prisma/client"

type PermissionsSectionProps = {
  user: StaffUser
  onIsReceptionistChange: (isReceptionist: boolean) => void
  onIsOfficeManagerChange: (isOfficeManager: boolean) => void
  onIsPesticideDesignateChange: (isPesticideDesignate: boolean) => void
  onIsFinanceDesignateChange: (isFinanceDesignate: boolean) => void
  onIsIta2DesignateChange: (isIta2Designate: boolean) => void
  disabled?: boolean
}

/**
 * PermissionsSection component displays various permission toggles for a staff user.
 *
 * @param props - The properties object.
 * @property props.user - The staff user whose permissions are being edited.
 * @property props.onIsReceptionistChange - Callback when receptionist permission changes.
 * @property props.onIsOfficeManagerChange - Callback when office manager permission changes.
 * @property props.onIsPesticideDesignateChange - Callback when pesticide designate permission changes.
 * @property props.onIsFinanceDesignateChange - Callback when finance designate permission changes.
 * @property props.onIsIta2DesignateChange - Callback when ITA2 designate permission changes.
 * @property props.disabled - Whether the section inputs are disabled.
 */
export const PermissionsSection = ({
  user,
  onIsReceptionistChange,
  onIsOfficeManagerChange,
  onIsPesticideDesignateChange,
  onIsFinanceDesignateChange,
  onIsIta2DesignateChange,
  disabled,
}: PermissionsSectionProps) => (
  <div
    className={`space-y-3 rounded-lg border border-border-light bg-background-light-gray p-4 shadow-sm ${disabled ? "opacity-50" : ""}`}
  >
    <h3 className="text-sm font-semibold text-typography-primary">Permissions</h3>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="isReceptionist" className="text-xs font-medium text-typography-primary">
          Receptionist
        </label>
        <input
          id="isReceptionist"
          type="checkbox"
          checked={user.isReceptionist}
          onChange={(e) => onIsReceptionistChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-border-dark disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="isOfficeManager" className="text-xs font-medium text-typography-primary">
          Office Manager
        </label>
        <input
          id="isOfficeManager"
          type="checkbox"
          checked={user.isOfficeManager}
          onChange={(e) => onIsOfficeManagerChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-border-dark disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex items-center justify-between">
        <label
          htmlFor="isPesticideDesignate"
          className="text-xs font-medium text-typography-primary"
        >
          Pesticide Designate
        </label>
        <input
          id="isPesticideDesignate"
          type="checkbox"
          checked={user.isPesticideDesignate}
          onChange={(e) => onIsPesticideDesignateChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-border-dark disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="isFinanceDesignate" className="text-xs font-medium text-typography-primary">
          Finance Designate
        </label>
        <input
          id="isFinanceDesignate"
          type="checkbox"
          checked={user.isFinanceDesignate}
          onChange={(e) => onIsFinanceDesignateChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-border-dark disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="isIta2Designate" className="text-xs font-medium text-typography-primary">
          ITA2 Designate
        </label>
        <input
          id="isIta2Designate"
          type="checkbox"
          checked={user.isIta2Designate}
          onChange={(e) => onIsIta2DesignateChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-border-dark disabled:cursor-not-allowed"
        />
      </div>
    </div>
  </div>
)
