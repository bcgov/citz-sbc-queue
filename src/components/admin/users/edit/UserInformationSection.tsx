import type { StaffUser } from "@/generated/prisma/client"

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
  <div className="space-y-2 rounded-lg border border-border-light bg-background-light-gray p-4 shadow-sm">
    <h3 className="text-sm font-semibold text-typography-primary">User Information</h3>
    <div className="grid grid-cols-3 gap-4 text-sm">
      <div>
        <p className="text-xs font-medium text-typography-secondary">GUID</p>
        <p className="text-typography-primary">{user.guid}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-typography-secondary">Display Name</p>
        <p className="text-typography-primary">{user.displayName}</p>
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
  </div>
)
