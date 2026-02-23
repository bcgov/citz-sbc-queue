import type { Dispatch, SetStateAction } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Notice, Switch, TextArea, TextField } from "@/components/common"
import { MultiSelect } from "@/components/common/select/MultiSelect"
import type { Location } from "@/generated/prisma/client"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"

type ServiceFormProps = {
  initialCode?: string
  service: Partial<ServiceWithRelations>
  offices: Location[]
  setFormData: Dispatch<SetStateAction<Partial<ServiceWithRelations> | null>>
  doesServiceCodeExist: (code: string) => Promise<boolean>
  isReadonly: boolean
}

/**
 * ServiceForm component renders the form fields for editing a service.
 *
 * @param props - The properties object.
 * @property props.initialCode - The initial code of the service, used to determine if the code has changed.
 * @property props.service - The service being edited.
 * @property props.offices - List of office locations.
 * @property props.setFormData - Function to update the form data state.
 * @property props.doesServiceCodeExist - Function to check if a service code already exists.
 * @property props.isReadonly - Whether the section inputs are read-only.
 */
export const ServiceForm = ({
  initialCode,
  service,
  offices,
  setFormData,
  doesServiceCodeExist,
  isReadonly,
}: ServiceFormProps) => {
  const officeOptions = useMemo(() => offices.map((o) => ({ key: o.id, label: o.name })), [offices])

  const selectedOfficeIds = service.locations ? service.locations.map((l) => l.id) : []
  const [codeExists, setCodeExists] = useState<boolean | null>(null)
  const initialCodeRef = useRef<string | undefined>(initialCode ?? service.code)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    // when the service changes (new service loaded) reset initial code and state
    initialCodeRef.current = initialCode ?? service.code
    setCodeExists(null)
  }, [service.updatedAt, initialCode])

  useEffect(() => {
    // debounce checking service code existence
    const code = service.code
    if (!code || code.length === 0) {
      setCodeExists(null)
      return
    }

    // don't warn if the code is unchanged from the initial value
    if (initialCodeRef.current === code) {
      setCodeExists(false)
      return
    }

    const t = setTimeout(() => {
      doesServiceCodeExist(code)
        .then((exists) => setCodeExists(exists))
        .catch(() => setCodeExists(null))
    }, 500)

    return () => clearTimeout(t)
  }, [service.code, doesServiceCodeExist])

  return (
    <div className="flex flex-col gap-2">
      {codeExists && <Notice type="warn" message="A service with this code already exists." />}
      <div className="grid grid-cols-7 gap-2">
        <TextField
          id="service-code"
          label="Code"
          value={service.code || ""}
          onChange={(v) => setFormData((s) => (s ? { ...s, code: v.replace(/\s/g, "") } : s))}
          disabled={isReadonly}
          required
          className="col-span-3"
        />

        <TextField
          id="service-ticketPrefix"
          label="Ticket Prefix"
          value={service.ticketPrefix || ""}
          onChange={(v) => setFormData((s) => (s ? { ...s, ticketPrefix: v } : s))}
          disabled={isReadonly}
          required
          className="col-span-3"
        />

        <div className="flex flex-col justify-center gap-1">
          <p className="block text-xs font-medium text-typography-primary">Back Office</p>
          <Switch
            checked={service.backOffice || false}
            onChange={(checked) => setFormData((s) => (s ? { ...s, backOffice: checked } : s))}
            disabled={isReadonly}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <TextField
          id="service-name"
          label="Name"
          value={service.name || ""}
          onChange={(v) => setFormData((s) => (s ? { ...s, name: v } : s))}
          disabled={isReadonly}
          required
        />

        <TextField
          id="service-publicName"
          label="Public Name"
          value={service.publicName || ""}
          onChange={(v) => setFormData((s) => (s ? { ...s, publicName: v } : s))}
          disabled={isReadonly}
          required
        />

        <TextArea
          id="service-description"
          label="Description"
          value={service.description || ""}
          onChange={(v) => setFormData((s) => (s ? { ...s, description: v } : s))}
          disabled={isReadonly}
          maxLength={1000}
          className="col-span-2"
        />
      </div>

      <div>
        <div className="mt-xs">
          <MultiSelect
            id="service-offices"
            label="Offices"
            options={officeOptions}
            selected={selectedOfficeIds}
            onChange={(selected) =>
              setFormData((s) =>
                s
                  ? {
                      ...s,
                      locations: selected.map((id) => offices.find((o) => o.id === id) as Location),
                    }
                  : s
              )
            }
            placeholder="Select offices"
            disabled={isReadonly}
          />
        </div>
      </div>
    </div>
  )
}
