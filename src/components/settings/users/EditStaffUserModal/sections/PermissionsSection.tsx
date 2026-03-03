import type { Dispatch, SetStateAction } from "react"
import { CheckboxInput } from "@/components/common/checkbox"
import type { StaffUser } from "@/generated/prisma/client"
import { Section } from "./Section"

type PermissionsSectionProps = {
  user: StaffUser
  setFormData: Dispatch<SetStateAction<StaffUser | null>>
  disabled?: boolean
}

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
      onChange={(checked) => setFormData((prev) => prev && { ...prev, isFinanceDesignate: checked })}
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
