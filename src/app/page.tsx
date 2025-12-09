import { Header, Navigation } from "@/components"
import { Footer } from "@/components/common/footer"
import { ExampleDialog } from "@/components/examples/ExampleDialog"
import { ExampleModal } from "@/components/examples/ExampleModal"
import { useCurrentLocation, CurrentLocationProvider } from "@/hooks"

export default function Home() {
  const currentLocation = useCurrentLocation()
  console.log("Current Location:", currentLocation)
  return (
    <CurrentLocationProvider>
      <Header />
      <Navigation />
      <div className="grid grid-cols-8 m-8 p-8 gap-4">
        <div className="rounded-md bg-surface-100 border px-4 py-2 text-sm text-surface-700">
          <strong>Current location:</strong>
          {/* <div>{location ? `${location.name} (${location.number})` : "Unknown"}</div> */}
          location goes here
        </div>
        <div className="col-span-6 col-start-2">
          <div className="flex flex-col justify-around ">
            <p className="text-xl">TEST</p>
            <div className="self-center text-h4">Some body content here </div>
            <div className="col-span-8 flex justify-between items-center gap-2 mx-auto">
              <ExampleModal />
              <ExampleDialog />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </CurrentLocationProvider>
  )
}
