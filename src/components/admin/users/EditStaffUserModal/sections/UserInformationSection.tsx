import type { StaffUser } from "@/generated/prisma/client"
import { Section } from "./common/Section"

type UserInformationSectionProps = {
  user: StaffUser
}

/**
 * UserInformationSection component displays user information details for a staff user.
 *
 * @param props - The properties object.
 * @property props.user - The staff user whose information is being displayed.
 */
export const UserInformationSection = ({ user }: UserInformationSectionProps) => (
  <Section title="User Information" disabled={false}>
    <div className="flex flex-row justify-between text-sm">
      <div>
        <p className="text-xs font-medium text-typography-secondary">Display Name</p>
        <p className="text-typography-primary">{user.displayName}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-typography-secondary">GUID</p>
        <p className="text-typography-primary">{user.guid}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-typography-secondary">Creation Date</p>
        <p className="text-typography-primary">
          {new Date(user.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  </Section>
)
