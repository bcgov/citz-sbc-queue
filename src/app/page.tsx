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
      <h2 className="text-blue-600">Passing Lines</h2>
      <div className="text-blue-700">This should pass</div>
      <hr />
      {/* <h3 className="text-blue-500">Failing lines</h3>
      <div className="text-blue-600">2 - Longer content that may fail accessibility checks</div>
      <br />
      <div className="text-white">3</div> */}
    </div>
  )
}
