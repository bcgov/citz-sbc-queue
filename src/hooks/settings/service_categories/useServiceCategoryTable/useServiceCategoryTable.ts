import { useEffect, useMemo, useState } from "react"
import type { Service } from "@/generated/prisma/client"
import { useAuth } from "@/hooks/useAuth"
import { useDialog } from "@/hooks/useDialog"
import { insertServiceCategory } from "@/lib/prisma/service_category/insertServiceCategory"
import type { ServiceCategoryWithRelations } from "@/lib/prisma/service_category/types"
import { updateServiceCategory } from "@/lib/prisma/service_category/updateServiceCategory"
import type { StaffUserWithRelations } from "@/lib/prisma/staff_user/types"
import { resolvePolicy } from "@/utils/policies/resolvePolicy"
import type { UserContext } from "@/utils/policies/types"

type UseServiceCategoryTableProps = {
  currentUser: StaffUserWithRelations | null
  serviceCategories: ServiceCategoryWithRelations[]
  services: Service[]
  revalidateTable: () => Promise<void>
}

/**
 * Custom hook encapsulating all logic for the ServiceCategoryTable component.
 *
 * @param props - Hook configuration.
 * @property props.currentUser - The currently authenticated staff user.
 * @property props.serviceCategories - Full list of service categories.
 * @property props.services - Full list of services.
 * @property props.revalidateTable - Async function to refresh the table.
 * @returns State, derived values, and handlers for the table and its modals.
 */
export const useServiceCategoryTable = ({
  currentUser,
  serviceCategories,
}: UseServiceCategoryTableProps) => {
  const { role, idir_user_guid } = useAuth()

  const {
    open: editServiceCategoryModalOpen,
    openDialog: openEditServiceCategoryModal,
    closeDialog: closeEditServiceCategoryModal,
  } = useDialog()
  const {
    open: createServiceCategoryModalOpen,
    openDialog: openCreateServiceCategoryModal,
    closeDialog: closeCreateServiceCategoryModal,
  } = useDialog()
  const {
    open: confirmArchiveServiceCategoryModalOpen,
    openDialog: openConfirmArchiveServiceCategoryModal,
    closeDialog: closeConfirmArchiveServiceCategoryModal,
  } = useDialog()

  const userContext = useMemo<UserContext>(
    () => ({
      staff_user_id: idir_user_guid ?? null,
      role,
      location_code: currentUser?.locationCode ?? null,
    }),
    [idir_user_guid, role, currentUser?.locationCode]
  )

  const actions = resolvePolicy("service_category", userContext)

  const [showArchived, setShowArchived] = useState<boolean>(false)
  const [selectedServiceCategory, setSelectedServiceCategory] =
    useState<ServiceCategoryWithRelations | null>(null)
  const [canEditSelectedServiceCategory, setCanEditSelectedServiceCategory] =
    useState<boolean>(false)
  const [canArchiveSelectedServiceCategory, setCanArchiveSelectedServiceCategory] =
    useState<boolean>(false)

  // Determine if the current user can edit/archive the selected service category whenever either changes
  useEffect(() => {
    if (selectedServiceCategory) {
      const categoryActions = resolvePolicy(
        "service_category",
        userContext,
        selectedServiceCategory
      )
      setCanEditSelectedServiceCategory(categoryActions.includes("edit"))
      setCanArchiveSelectedServiceCategory(categoryActions.includes("archive"))
    } else {
      setCanEditSelectedServiceCategory(false)
      setCanArchiveSelectedServiceCategory(false)
    }
  }, [selectedServiceCategory, userContext])

  const handleRowClick = (serviceCategory: ServiceCategoryWithRelations) => {
    setSelectedServiceCategory(serviceCategory)
    openEditServiceCategoryModal()
  }

  const serviceCategoriesToShow = serviceCategories.filter((serviceCategory) => {
    if (!showArchived && serviceCategory.deletedAt !== null) return false
    const categoryActions = resolvePolicy("service_category", userContext, serviceCategory)
    return categoryActions.includes("view")
  })

  const canCreate = actions.includes("create")

  return {
    showArchived,
    setShowArchived,
    selectedServiceCategory,
    canCreate,
    canEditSelectedServiceCategory,
    canArchiveSelectedServiceCategory,
    serviceCategoriesToShow,
    handleRowClick,
    editServiceCategoryModalOpen,
    openEditServiceCategoryModal,
    closeEditServiceCategoryModal,
    createServiceCategoryModalOpen,
    openCreateServiceCategoryModal,
    closeCreateServiceCategoryModal,
    confirmArchiveServiceCategoryModalOpen,
    openConfirmArchiveServiceCategoryModal,
    closeConfirmArchiveServiceCategoryModal,
    updateServiceCategory,
    insertServiceCategory,
  }
}
