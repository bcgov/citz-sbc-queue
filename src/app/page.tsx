import { ExampleDialog } from "@/components/examples/ExampleDialog"
import { ExampleModal } from "@/components/examples/ExampleModal"

export default function Home() {
  return (
    <div className="flex flex-col">
      <h1 className="text-xl">TEST</h1>
      <div className="self-center text-h4">Some body content here </div>
      <div className="flex justify-between items-center gap-2 mx-auto">
        <ExampleModal />
        <ExampleDialog />
      </div>
      {/* <div className="text-white">This should fail</div> */}
    </div>
  )
}
