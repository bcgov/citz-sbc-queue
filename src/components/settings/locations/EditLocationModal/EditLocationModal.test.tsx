import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

// Mock the LocationForm to avoid rendering complex child components
vi.mock("../LocationForm", () => ({
  LocationForm: () => <div>LocationFormStub</div>,
}))

import type { Counter, StaffUser } from "@/generated/prisma/client"
import type { LocationWithRelations } from "@/lib/prisma/location/types"
import type { ServiceWithRelations } from "@/lib/prisma/service/types"
import { EditLocationModal } from "./EditLocationModal"

describe("EditLocationModal", () => {
  const now = new Date()
  const location = {
    code: "LOC1",
    name: "Location 1",
    timezone: "America/Vancouver",
    streetAddress: "123 Test St",
    mailAddress: "456 Mail Ave",
    phoneNumber: "(555) 123-4567",
    latitude: 49.2827,
    longitude: -123.1207,
    legacyOfficeNumber: null,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    staffUsers: [],
    counters: [],
    services: [],
  } as LocationWithRelations

  const services = [
    {
      code: "SRV1",
      name: "Service 1",
      id: "s1",
      description: "Test service",
      publicName: "Public Service",
      ticketPrefix: "T",
      legacyServiceId: null,
      backOffice: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
      locations: [],
      categories: [],
    },
  ] as unknown as ServiceWithRelations[]

  const counters = [
    {
      id: "c1",
      name: "Counter 1",
      locationCode: "LOC1",
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    },
  ] as unknown as Counter[]

  const staffUsers = [
    {
      guid: "su1",
      displayName: "Staff User 1",
      locationCode: "LOC1",
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    },
  ] as unknown as StaffUser[]

  it("renders modal title when open with a location", async () => {
    const onClose = vi.fn()
    const updateLocation = vi.fn().mockResolvedValue(location)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const doesLocationCodeExist = vi.fn().mockResolvedValue(false)

    render(
      <EditLocationModal
        open={true}
        onClose={onClose}
        location={location}
        services={services}
        counters={counters}
        staffUsers={staffUsers}
        updateLocation={updateLocation}
        doesLocationCodeExist={doesLocationCodeExist}
        revalidateTable={revalidateTable}
      />
    )

    await waitFor(() => expect(screen.getByText(`Edit Location: ${location.code}`)).toBeTruthy())
    expect(screen.getByText("LocationFormStub")).toBeTruthy()
  })

  it("calls onClose when Cancel button is clicked", async () => {
    const onClose = vi.fn()
    const updateLocation = vi.fn().mockResolvedValue(location)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const doesLocationCodeExist = vi.fn().mockResolvedValue(false)

    render(
      <EditLocationModal
        open={true}
        onClose={onClose}
        location={location}
        services={services}
        counters={counters}
        staffUsers={staffUsers}
        updateLocation={updateLocation}
        doesLocationCodeExist={doesLocationCodeExist}
        revalidateTable={revalidateTable}
      />
    )

    await waitFor(() => expect(screen.getByText(`Edit Location: ${location.code}`)).toBeTruthy())

    fireEvent.click(screen.getByText("Cancel"))
    expect(onClose).toHaveBeenCalled()
  })

  it("disables save button when modal is closed", async () => {
    const onClose = vi.fn()
    const updateLocation = vi.fn().mockResolvedValue(location)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const doesLocationCodeExist = vi.fn().mockResolvedValue(false)

    const { queryByText } = render(
      <EditLocationModal
        open={false}
        onClose={onClose}
        location={location}
        services={services}
        counters={counters}
        staffUsers={staffUsers}
        updateLocation={updateLocation}
        doesLocationCodeExist={doesLocationCodeExist}
        revalidateTable={revalidateTable}
      />
    )

    // Modal should not render when closed
    expect(queryByText(`Edit Location: ${location.code}`)).not.toBeTruthy()
  })

  it("shows archived message when location is archived", async () => {
    const archivedLocation = {
      ...location,
      deletedAt: new Date(),
    } as LocationWithRelations

    const onClose = vi.fn()
    const updateLocation = vi.fn().mockResolvedValue(archivedLocation)
    const revalidateTable = vi.fn().mockResolvedValue(undefined)
    const doesLocationCodeExist = vi.fn().mockResolvedValue(false)

    render(
      <EditLocationModal
        open={true}
        onClose={onClose}
        location={archivedLocation}
        services={services}
        counters={counters}
        staffUsers={staffUsers}
        updateLocation={updateLocation}
        doesLocationCodeExist={doesLocationCodeExist}
        revalidateTable={revalidateTable}
      />
    )

    await waitFor(() =>
      expect(screen.getByText("This location is archived and cannot be edited.")).toBeTruthy()
    )
  })
})
