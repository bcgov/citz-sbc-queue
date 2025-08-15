export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-1 items-center gap-[32px] row-start-2 sm:items-start">
        <div>
          {/* We can specify the font */}
          <div className="font-BCSans text-black p-8 p-8 bg-blue-50"> bg-blue-50 </div>
          {/* But because it is set as the default for the project we don't have to */}
          <div className="text-black italic p-8 p-8 bg-blue-100"> bg-blue-100 </div>
          <div className="text-black font-bold p-8 p-8 bg-blue-200"> bg-blue-200 </div>
          <div className="text-black font-bold italic p-8 p-8 bg-blue-300"> bg-blue-300 </div>
          <div className="text-black p-8 p-8 bg-blue-400"> bg-blue-400 </div>
          <div className="text-black p-8 bg-blue-500"> bg-blue-500 </div>
          <div className="text-black p-8 bg-blue-600"> bg-blue-600 </div>
          <div className=" p-8 bg-blue-700"> bg-blue-700 </div>
          <div className=" p-8 bg-blue-800"> bg-blue-800 </div>
          <div className=" p-8 bg-blue"> bg-blue </div>
        </div>
        <div>
          <div className="text-black p-8 bg-gold-50"> bg-gold-50 </div>
          <div className="text-black p-8 bg-gold-100"> bg-gold-100</div>
          <div className="text-black p-8 bg-gold-200"> bg-gold-200</div>
          <div className="text-black p-8 bg-gold-300"> bg-gold-300</div>
          <div className="text-black p-8 bg-gold-400"> bg-gold-400</div>
          <div className="text-black p-8 bg-gold-500"> bg-gold-500</div>
          <div className="text-black p-8 bg-gold-600"> bg-gold-600</div>
          <div className="text-black p-8 bg-gold-700"> bg-gold-700</div>
          <div className="text-black p-8 bg-gold-800"> bg-gold-800</div>
          <div className="text-black p-8 bg-gold"> bg-gold</div>
        </div>
        <div>
          <div className="text-black p-8 bg-gray-50"> bg-gray-50 </div>
          <div className="text-black p-8 bg-gray-100"> bg-gray-100</div>
          <div className="text-black p-8 bg-gray-200"> bg-gray-200</div>
          <div className="text-black p-8 bg-gray-300"> bg-gray-300</div>
          <div className="text-black p-8 bg-gray-400"> bg-gray-400</div>
          <div className="text-black p-8 bg-gray-500"> bg-gray-500</div>
          <div className="text-black p-8 bg-gray-600"> bg-gray-600</div>
          <div className=" p-8 bg-gray-700"> bg-gray-700</div>
          <div className=" p-8 bg-gray-800"> bg-gray-800</div>
          <div className=" p-8 bg-gray-900"> bg-gray-900</div>
          <div className=" p-8 bg-gray-950"> bg-gray-950</div>
        </div>
        <div>
          <div className="text-black p-8 bg-success-50"> bg-success-50</div>
          <div className="text-black p-8 bg-success-100"> bg-success-100</div>
          <div className="text-black p-8 bg-success-200"> bg-success-200</div>
          <div className="text-black p-8 bg-success-300"> bg-success-300</div>
          <div className="text-black p-8 bg-success-400"> bg-success-400</div>
          <div className="text-black p-8 bg-success-500"> bg-success-500</div>
          <div className="text-black p-8 bg-success-600"> bg-success-600</div>
          <div className=" p-8 bg-success-700"> bg-success-700</div>
          <div className=" p-8 bg-success-800"> bg-success-800</div>
          <div className=" p-8 bg-success-900"> bg-success-900</div>
          <div className=" p-8 bg-success-950"> bg-success-950</div>
        </div>
        <div>
          <div className="text-black p-8 bg-warning-50"> bg-warning-50</div>
          <div className="text-black p-8 bg-warning-100"> bg-warning-100</div>
          <div className="text-black p-8 bg-warning-200"> bg-warning-200</div>
          <div className="text-black p-8 bg-warning-300"> bg-warning-300</div>
          <div className="text-black p-8 bg-warning-400"> bg-warning-400</div>
          <div className="text-black p-8 bg-warning-500"> bg-warning-500</div>
          <div className="text-black p-8 bg-warning-600"> bg-warning-600</div>
          <div className=" p-8 bg-warning-700"> bg-warning-700</div>
          <div className=" p-8 bg-warning-800"> bg-warning-800</div>
          <div className=" p-8 bg-warning-900"> bg-warning-900</div>
          <div className=" p-8 bg-warning-950"> bg-warning-950</div>
        </div>
        <div>
          <div className="text-black p-8 bg-error-50"> bg-error-50</div>
          <div className="text-black p-8 bg-error-100"> bg-error-100</div>
          <div className="text-black p-8 bg-error-200"> bg-error-200</div>
          <div className="text-black p-8 bg-error-300"> bg-error-300</div>
          <div className="text-black p-8 bg-error-400"> bg-error-400</div>
          <div className="text-black p-8 bg-error-500"> bg-error-500</div>
          <div className="text-black p-8 bg-error-600"> bg-error-600</div>
          <div className=" p-8 bg-error-700"> bg-error-700</div>
          <div className=" p-8 bg-error-800"> bg-error-800</div>
          <div className=" p-8 bg-error-900"> bg-error-900</div>
          <div className=" p-8 bg-error-950"> bg-error-950</div>
        </div>
        <div>
          <div className=" p-8 bg-button-primary"> button-primary</div>
          <div className=" p-8 bg-button-primary-hover"> button-primary-hover</div>
          <div className="text-black p-8 bg-button-secondary"> button-secondary</div>
          <div className=" p-8 bg-button-danger"> button-danger</div>
          <div className=" p-8 bg-button-danger-hover"> button-danger-hover</div>
          <div className="text-black p-8 bg-disabled"> disabled</div>
          <div className="text-black p-8 bg-placeholder"> placeholder</div>
        </div>
      </main>
    </div>
  )
}
