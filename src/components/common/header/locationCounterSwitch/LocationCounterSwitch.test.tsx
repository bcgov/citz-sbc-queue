import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest"
import { useAuth } from "@/hooks/useAuth"
import { LocationCounterSwitch } from "./LocationCounterSwitch"

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}))

const mockLocations = [
  {
    id: "loc1",
    name: "Victoria",
    code: "VIC",
    counters: [
      { id: "c1", name: "Counter 1" },
      { id: "c2", name: "Counter 2" },
    ],
  },
  {
    id: "loc2",
    name: "Vancouver",
    code: "YVR",
    counters: [{ id: "c3", name: "Counter 3" }],
  },
]

const mockUser = {
  id: "u1",
  locationCode: "VIC",
  counterId: "c1",
  location: mockLocations[0],
  counter: mockLocations[0].counters[0],
}

describe("LocationCounterSwitch", () => {
  const getAllLocationsMock = vi.fn()
  const getStaffUserBySubMock = vi.fn()
  const updateStaffUserMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    ;(useAuth as Mock).mockReturnValue({
      sub: "123",
      role: "SuperAdmin",
    })

    getAllLocationsMock.mockResolvedValue(mockLocations)
    getStaffUserBySubMock.mockResolvedValue(mockUser)
    updateStaffUserMock.mockResolvedValue({
      ...mockUser,
      locationId: "loc2",
      locationCode: "YVR",
      counterId: "c3",
      location: mockLocations[1],
      counter: mockLocations[1].counters[0],
    })
  })

  it("renders nothing when user is not loaded", async () => {
    getStaffUserBySubMock.mockResolvedValueOnce(null)

    const { container } = render(
      <LocationCounterSwitch
        getAllLocations={getAllLocationsMock}
        getStaffUserBySub={getStaffUserBySubMock}
        updateStaffUser={updateStaffUserMock}
      />
    )

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement()
    })
  })

  it("renders the current user's location and counter", async () => {
    render(
      <LocationCounterSwitch
        getAllLocations={getAllLocationsMock}
        getStaffUserBySub={getStaffUserBySubMock}
        updateStaffUser={updateStaffUserMock}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Victoria")).toBeInTheDocument()
      expect(screen.getByText("Counter 1")).toBeInTheDocument()
    })
  })

  it("disables the switch button for Authenticated role", async () => {
    ;(useAuth as Mock).mockReturnValue({
      sub: "123",
      role: "Authenticated",
    })

    render(
      <LocationCounterSwitch
        getAllLocations={getAllLocationsMock}
        getStaffUserBySub={getStaffUserBySubMock}
        updateStaffUser={updateStaffUserMock}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Victoria")).toBeInTheDocument()
    })

    const button = screen.getByRole("button", { name: /switch location or counter/i })
    expect(button).toBeDisabled()
  })

  it("opens the modal and allows changing location and counter", async () => {
    render(
      <LocationCounterSwitch
        getAllLocations={getAllLocationsMock}
        getStaffUserBySub={getStaffUserBySubMock}
        updateStaffUser={updateStaffUserMock}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Victoria")).toBeInTheDocument()
    })

    // Open modal
    const button = screen.getByRole("button", { name: /switch location or counter/i })
    await userEvent.click(button)

    // Wait for modal components
    await waitFor(() => {
      expect(screen.getByText("Change Location or Counter")).toBeInTheDocument()
    })

    const locationSelect = screen.getByLabelText("Location")
    const counterSelect = screen.getByLabelText("Counter")

    expect(locationSelect).toHaveValue("VIC")
    expect(counterSelect).toHaveValue("c1")

    // Change location to Vancouver
    await userEvent.selectOptions(locationSelect, "YVR")

    await waitFor(() => {
      expect(locationSelect).toHaveValue("YVR")
    })

    // Change counter explicitly
    const updatedCounterSelect = screen.getByLabelText("Counter")
    await userEvent.selectOptions(updatedCounterSelect, "c3")

    await waitFor(() => {
      expect(updatedCounterSelect).toHaveValue("c3")
    })

    // Confirm
    const confirmButton = screen.getByRole("button", { name: "Confirm" })
    await userEvent.click(confirmButton)

    await waitFor(() => {
      expect(updateStaffUserMock).toHaveBeenCalledWith(
        {
          locationCode: "YVR",
          counterId: "c3",
        },
        mockUser
      )
    })

    // Once updated, the mocked updateStaffUser resolves with new user info
    await waitFor(() => {
      expect(screen.getByText("Vancouver")).toBeInTheDocument()
      expect(screen.getByText("Counter 3")).toBeInTheDocument()
    })
  })

  it("resets selections when canceled", async () => {
    render(
      <LocationCounterSwitch
        getAllLocations={getAllLocationsMock}
        getStaffUserBySub={getStaffUserBySubMock}
        updateStaffUser={updateStaffUserMock}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Victoria")).toBeInTheDocument()
    })

    const button = screen.getByRole("button", { name: /switch location or counter/i })
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText("Change Location or Counter")).toBeInTheDocument()
    })

    const locationSelect = screen.getByLabelText("Location")
    await userEvent.selectOptions(locationSelect, "YVR")

    await waitFor(() => {
      expect(locationSelect).toHaveValue("YVR")
    })

    const cancelButton = screen.getByRole("button", { name: "Cancel" })
    await userEvent.click(cancelButton)

    // Re-open and check value
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByLabelText("Location")).toHaveValue("VIC")
    })

    expect(updateStaffUserMock).not.toHaveBeenCalled()
  })
})
