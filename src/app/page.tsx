"use client"
import { useAuth } from "@/app/hooks"
import { LoginButton } from "@/components/auth/LoginButton"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { ExampleDialog } from "@/components/ExampleDialog"
import { ExampleModal } from "@/components/ExampleModal"

export default function Home() {
  const x = useAuth()

  console.log("Home session:", x)

  return (
    /*
    This first div wraps everything to all nested elements will inherit the following:
      Grid with 9 columns & gap 4 between them,
      min height to the screen height, margin 8, padding 4
      NOTE: --spacing is set to 0.125rem in spacing.css
            all spacing values are set using this formula:
            calc(var(--spacing) * <value>); => 0.125rem * <value>
            - gap 4 => 0.125rem * 4 = 0.5rem
    */
    <div className="grid grid-cols-8 min-h-screen m-8 p-8 gap-4">
      <div className="col-span-8 flex justify-between items-center gap-2 mx-auto">
        <LoginButton />
        <LogoutButton />
      </div>
      <div className="col-span-8 flex justify-between items-center gap-2 mx-auto">
        <ExampleModal />
        <ExampleDialog />
      </div>
      <div className="col-span-8 mb-8 mx-auto">
        <h2 className="text-typography-primary p-2">Buttons</h2>
        <p className="p-2 mb-2">Try hover and active/focus (keyboard navigation) states</p>
        <div className="overflow-auto">
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 bg-gray-100">classNames</th>
                <th className="text-left p-4">Enabled</th>
                <th className="text-left p-4">Disabled</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 font-medium bg-gray-100">primary</td>
                <td className="p-4">
                  <button type="button" className="primary">
                    Primary
                  </button>
                </td>
                <td className="p-4">
                  <button type="button" className="primary" disabled>
                    Disabled
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-medium bg-gray-100">secondary</td>
                <td className="p-4">
                  <button type="button" className="secondary">
                    Secondary
                  </button>
                </td>
                <td className="p-4">
                  <button type="button" className="secondary" disabled>
                    Disabled
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-medium bg-gray-100">tertiary</td>
                <td className="p-4">
                  <button type="button" className="tertiary">
                    Tertiary
                  </button>
                </td>
                <td className="p-4">
                  <button type="button" className="tertiary" disabled>
                    Disabled
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-medium bg-gray-100">primary small</td>
                <td className="p-4">
                  <button type="button" className="primary small">
                    Primary
                  </button>
                </td>
                <td className="p-4">
                  <button type="button" className="primary small" disabled>
                    Disabled
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-medium bg-gray-100">secondary small</td>
                <td className="p-4">
                  <button type="button" className="secondary small">
                    Secondary
                  </button>
                </td>
                <td className="p-4">
                  <button type="button" className="secondary small" disabled>
                    Disabled
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-medium bg-gray-100">tertiary small</td>
                <td className="p-4">
                  <button type="button" className="tertiary small">
                    Tertiary
                  </button>
                </td>
                <td className="p-4">
                  <button type="button" className="tertiary small" disabled>
                    Disabled
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-medium bg-gray-100">primary danger</td>
                <td className="p-4">
                  <button type="button" className="primary danger">
                    Primary
                  </button>
                </td>
                <td className="p-4">
                  <button type="button" className="primary danger" disabled>
                    Disabled
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-medium bg-gray-100">secondary danger</td>
                <td className="p-4">
                  <button type="button" className="secondary danger">
                    Secondary
                  </button>
                </td>
                <td className="p-4">
                  <button type="button" className="secondary danger" disabled>
                    Disabled
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-medium bg-gray-100">tertiary danger</td>
                <td className="p-4">
                  <button type="button" className="tertiary danger">
                    Tertiary
                  </button>
                </td>
                <td className="p-4">
                  <button type="button" className="tertiary danger" disabled>
                    Disabled
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/*
      Setting the following to use the same background colour with different text colours
        Setting text to align to the top right of the available space,
        Also setting the start and end columns for the section
      */}
      <div className="align-top text-right col-start-2 col-end-4 bg-background-default">
        <h1 className="text-typography-primary p-2">This is a H1 header</h1>
        <h2 className="text-typography-secondary p-2">This is a H2 header</h2>
        <h3 className="text-typography-disabled p-2">This is a H3 header</h3>
        <h4 className="text-typography-link p-2">This is a H4 header</h4>
        <h5 className="text-typography-danger p-2">This is a H5 header</h5>
        {/* Over writing the background colour for this block to see the text colour better */}
        <h6 className="bg-gray-950 text-typography-primary-invert p-2">This is a H6 header</h6>
      </div>
      {/*
      This section has the text colour defined on the higer level and backgrounds lower
        Keeping the text aligned to the center middle of available space
        Also setting the start and end columns for the section
      */}
      <div className="align-middle text-typography-primary text-center col-start-4 col-end-6">
        <h1 className="bg-background-light-gray p-2">This is a H1 header</h1>
        <h2 className="bg-button-danger p-2">This is a H2 header</h2>
        <h3 className="bg-button-danger-hover p-2">This is a H3 header</h3>
        <h4 className="bg-disabled p-2">This is a H4 header</h4>
        {/* Changing the background colour here to see the text colours better */}
        <h5 className="bg-gray-950 text-typography-primary-invert p-2">This is a H5 header</h5>
        <h6 className="bg-gray-950 text-typography-secondary-invert p-2">This is a H6 header</h6>
      </div>
      {/*
      This section has the text colour defined on the higer level and backgrounds lower
        Keeping the text aligned to the bottom right of available space
        Also setting the start and end columns for the section
      */}
      <div className="align-bottom text-left col-start-6 col-end-8 bg-background-light-blue text-typography-primary">
        <h1 className="bg-disabled p-2">This is a H1 header</h1>
        <h2 className="bg-info p-2">This is a H2 header</h2>
        <h3 className="bg-danger p-2">This is a H3 header</h3>
        <h4 className="text-typography-primary-invert bg-button-primary p-2">
          This is a H4 header
        </h4>
        <h5 className="text-typography-primary-invert bg-button-primary-hover p-2">
          This is a H5 header
        </h5>
        <h6 className="bg-button-secondary p-2">This is a H6 header</h6>
      </div>
      {/*
      Unsectioned area, defining start of the h1 which will effect the rest of the tags
        Defining background in each tag, as well as text colour and alignment
       */}
      <h1 className="col-start-2 bg-button-secondary-hover text-typography-primary p-2">H1</h1>
      <h2 className="bg-disabled text-typography-primary p-2">H2</h2>
      <h3 className="bg-button-tertiary text-typography-primary p-2">H3</h3>
      <h4 className="bg-button-tertiary-hover text-typography-primary p-2">H4</h4>
      <h5 className="bg-background-dark-blue p-2">H5 </h5>
      {/* no background defined, inherits from parent page */}
      <h6 className="p-2">H6 </h6>
      {/*
       Defining the starting column again here, all child elements will align with this
       And all further sections will fall in line
      */}
      <div className="col-start-2">
        {/* We can specify the font */}
        <div className="font-BCSans text-typography-primary p-8 p-8 bg-blue-50"> bg-blue-50 </div>
        {/* But because it is set as the default for the project we don't have to */}
        <div className="text-typography-primary p-8 p-8 bg-blue-100"> bg-blue-100 </div>
        {/* See this square for an example of bold BCSans */}
        <div className="text-typography-primary font-bold p-8 p-8 bg-blue-200"> bg-blue-200 </div>
        {/* See this square for an example of itailic BCSans */}
        <div className="text-typography-primary italic p-8 p-8 bg-blue-300"> bg-blue-300 </div>
        {/* See this square for an example of bold itailic BCSans */}
        <div className="text-typography-primary font-bold italic p-8 p-8 bg-blue-400">
          bg-blue-400
        </div>
        <div className="text-typography-primary p-8 bg-blue-500"> bg-blue-500 </div>
        <div className="text-typography-primary p-8 bg-blue-600"> bg-blue-600 </div>
        <div className=" p-8 bg-blue-700"> bg-blue-700 </div>
        <div className=" p-8 bg-blue-800"> bg-blue-800 </div>
        <div className=" p-8 bg-blue"> bg-blue </div>
      </div>
      <div>
        <div className="text-typography-primary p-8 bg-gold-50"> bg-gold-50 </div>
        <div className="text-typography-primary p-8 bg-gold-100"> bg-gold-100</div>
        <div className="text-typography-primary p-8 bg-gold-200"> bg-gold-200</div>
        <div className="text-typography-primary p-8 bg-gold-300"> bg-gold-300</div>
        <div className="text-typography-primary p-8 bg-gold-400"> bg-gold-400</div>
        <div className="text-typography-primary p-8 bg-gold-500"> bg-gold-500</div>
        <div className="text-typography-primary p-8 bg-gold-600"> bg-gold-600</div>
        <div className="text-typography-primary p-8 bg-gold-700"> bg-gold-700</div>
        <div className="text-typography-primary p-8 bg-gold-800"> bg-gold-800</div>
        <div className="text-typography-primary p-8 bg-gold"> bg-gold</div>
      </div>
      <div>
        <div className="text-typography-primary p-8 bg-gray-50"> bg-gray-50 </div>
        <div className="text-typography-primary p-8 bg-gray-100"> bg-gray-100</div>
        <div className="text-typography-primary p-8 bg-gray-200"> bg-gray-200</div>
        <div className="text-typography-primary p-8 bg-gray-300"> bg-gray-300</div>
        <div className="text-typography-primary p-8 bg-gray-400"> bg-gray-400</div>
        <div className="text-typography-primary p-8 bg-gray-500"> bg-gray-500</div>
        <div className="text-typography-primary p-8 bg-gray-600"> bg-gray-600</div>
        <div className=" p-8 bg-gray-700"> bg-gray-700</div>
        <div className=" p-8 bg-gray-800"> bg-gray-800</div>
        <div className=" p-8 bg-gray-900"> bg-gray-900</div>
        <div className=" p-8 bg-gray-950"> bg-gray-950</div>
      </div>
      <div>
        <div className="text-typography-primary p-8 bg-success"> bg-success</div>
        <div className="text-typography-primary p-8 bg-success-50"> bg-success-50</div>
        <div className="text-typography-primary p-8 bg-success-100"> bg-success-100</div>
        <div className="text-typography-primary p-8 bg-success-200"> bg-success-200</div>
        <div className="text-typography-primary p-8 bg-success-300"> bg-success-300</div>
        <div className="text-typography-primary p-8 bg-success-400"> bg-success-400</div>
        <div className="text-typography-primary p-8 bg-success-500"> bg-success-500</div>
        <div className="text-typography-primary p-8 bg-success-600"> bg-success-600</div>
        <div className=" p-8 bg-success-700"> bg-success-700</div>
        <div className=" p-8 bg-success-800"> bg-success-800</div>
        <div className=" p-8 bg-success-900"> bg-success-900</div>
        <div className=" p-8 bg-success-950"> bg-success-950</div>
      </div>
      <div>
        <div className="text-typography-primary p-8 bg-warning"> bg-warning</div>
        <div className="text-typography-primary p-8 bg-warning-50"> bg-warning-50</div>
        <div className="text-typography-primary p-8 bg-warning-100"> bg-warning-100</div>
        <div className="text-typography-primary p-8 bg-warning-200"> bg-warning-200</div>
        <div className="text-typography-primary p-8 bg-warning-300"> bg-warning-300</div>
        <div className="text-typography-primary p-8 bg-warning-400"> bg-warning-400</div>
        <div className="text-typography-primary p-8 bg-warning-500"> bg-warning-500</div>
        <div className="text-typography-primary p-8 bg-warning-600"> bg-warning-600</div>
        <div className=" p-8 bg-warning-700"> bg-warning-700</div>
        <div className=" p-8 bg-warning-800"> bg-warning-800</div>
        <div className=" p-8 bg-warning-900"> bg-warning-900</div>
        <div className=" p-8 bg-warning-950"> bg-warning-950</div>
      </div>
      <div>
        <div className="text-typography-primary p-8 bg-error-50"> bg-error-50</div>
        <div className="text-typography-primary p-8 bg-error-100"> bg-error-100</div>
        <div className="text-typography-primary p-8 bg-error-200"> bg-error-200</div>
        <div className="text-typography-primary p-8 bg-error-300"> bg-error-300</div>
        <div className="text-typography-primary p-8 bg-error-400"> bg-error-400</div>
        <div className="text-typography-primary p-8 bg-error-500"> bg-error-500</div>
        <div className="text-typography-primary p-8 bg-error-600"> bg-error-600</div>
        <div className=" p-8 bg-error-700"> bg-error-700</div>
        <div className=" p-8 bg-error-800"> bg-error-800</div>
        <div className=" p-8 bg-error-900"> bg-error-900</div>
        <div className=" p-8 bg-error-950"> bg-error-950</div>
      </div>
    </div>
  )
}
