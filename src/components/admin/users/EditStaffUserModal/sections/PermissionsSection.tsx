import type { Dispatch, SetStateAction } from "react"
import type { StaffUser } from "@/generated/prisma/client"
import { CheckboxInput } from "./common/CheckboxInput"
import { Section } from "./common/Section"

type PermissionsSectionProps = {
  user: StaffUser
  setFormData: Dispatch<SetStateAction<StaffUser | null>>
  disabled?: boolean
}

/**
 * PermissionsSection component displays various permission toggles for a staff user.
 *
 * @param props - The properties object.
 * @property props.user - The staff user whose permissions are being edited.
 * @property props.setFormData - Function to update the form data state.
 * @property props.disabled - Whether the section inputs are disabled.
 */
export const PermissionsSection = ({ user, setFormData, disabled }: PermissionsSectionProps) => (
  <Section title="Permissions" disabled={disabled ?? false}>
    <CheckboxInput
      id="isReceptionist"
      label="Receptionist"
      checked={user.isReceptionist}
      onChange={(checked) => setFormData((prev) => prev && { ...prev, isReceptionist: checked })}
      disabled={disabled ?? false}
    />

    <CheckboxInput
      id="isOfficeManager"
      label="Office Manager"
      checked={user.isOfficeManager}
      onChange={(checked) => setFormData((prev) => prev && { ...prev, isOfficeManager: checked })}
      disabled={disabled ?? false}
    />

    <CheckboxInput
      id="isPesticideDesignate"
      label="Pesticide Designate"
      checked={user.isPesticideDesignate}
      onChange={(checked) =>
        setFormData((prev) => prev && { ...prev, isPesticideDesignate: checked })
      }
      disabled={disabled ?? false}
    />

    <CheckboxInput
      id="isFinanceDesignate"
      label="Finance Designate"
      checked={user.isFinanceDesignate}
      onChange={(checked) =>
        setFormData((prev) => prev && { ...prev, isFinanceDesignate: checked })
      }
      disabled={disabled ?? false}
    />

    <CheckboxInput
      id="isIta2Designate"
      label="ITA2 Designate"
      checked={user.isIta2Designate}
      onChange={(checked) => setFormData((prev) => prev && { ...prev, isIta2Designate: checked })}
      disabled={disabled ?? false}
    />
  </Section>
)
