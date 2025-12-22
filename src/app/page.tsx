import { ExampleDialog } from "@/components/examples/ExampleDialog"
import { ExampleModal } from "@/components/examples/ExampleModal"

export default function Home() {
  return (
    <div className="grid p-2 m-2 gap-2 md:grid-cols-8 md:m-8 md:p-8 md:gap-4">
      <div className="md:col-span-6 md:col-start-2">
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
  )
}
