import { Footer } from "@/components/common/footer"

export default function Home() {
  return (
    <>
      <div className="grid grid-cols-8 m-8 p-8 gap-4">
        <div className="col-span-6 col-start-2">
          <div className="flex flex-col justify-around ">
            <p className="text-xl">TEST</p>
            <div className="self-center text-h4">Some body content here </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
