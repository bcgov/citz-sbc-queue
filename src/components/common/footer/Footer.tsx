"use client"

export const Footer = () => {
  const LandAcknowledgement = () => {
    const p = `The B.C. Public Service acknowledges the
        territories of First Nations around B.C. and is grateful to carry out
        our work on these lands. We acknowledge the rights, interests,
        priorities, and concerns of all Indigenous Peoples — First Nations,
        Métis, and Inuit — respecting and acknowledging their distinct
        cultures, histories, rights, laws, and governments.`

    return (
      <div className="w-full flex flex-col items-center justify-around border-y-(length:--border-width-lg) border-y-gold-600 bg-gray-950 p-xl">
        {/* above - bcds-footer--acknowledgement class */}
        {/* below - bcds-footer--acknowledgement-text class */}
        <div className="w-full max-w-[1100px] flex flex-col justify-self-stretch items-center text-typography-primary-invert text-s">
          {p}
        </div>
      </div>
    )
  }

  const Links = () => {
    const title = "More Info"
    const links = [
      { title: "Home", link: "https://www2.gov.bc.ca/gov/content/home" },
      { title: "About gov.bc.ca", link: "https://www2.gov.bc.ca/gov/content/about-gov-bc-ca" },
      {
        title: "Accessibility",
        link: "https://www2.gov.bc.ca//gov/content/home/accessible-government",
      },
      { title: "Privacy", link: "https://www2.gov.bc.ca//gov/content/home/privacy" },
      { title: "Copyright", link: "https://www2.gov.bc.ca//gov/content/home/copyright" },
      { title: "Disclaimer", link: "https://www2.gov.bc.ca//gov/content/home/disclaimer" },
    ]
    return (
      <div className="w-full flex flex-col flex-nowrap items-start justify-self-stretch justify-between gap-xl">
        {/* above - bcds-footer--logo-links class */}
        <figure className="w-full flex flex-col m-none">
          {/** above bcds-footer--links */}
          {/** below bcds-footer--links-title */}
          <figcaption className="w-full block mb-md font-bold uppercase text-sm">
            {title}
          </figcaption>
          {/** below bcds-footer--links -> ul */}
          <ul className="w-full grid grid-cols-4 auto-rows-auto gap-x-xl gap-y-sm list-none m-none p-none">
            {Array.isArray(links) &&
              links.map((element, index) => {
                return (
                  <li
                    className="text-sm"
                    key={`${element.title.toLowerCase().replace(/\s/g, "-")}-${index}`}
                  >
                    {/** above bcds-footer--links -> ul -> li */}
                    {/** below bcds-footer--links -> ul -> li -> a */}
                    <a className="color-typography-primary hover:underline" href={element.link}>
                      {element.title}
                    </a>
                  </li>
                )
              })}
          </ul>
        </figure>
      </div>
    )
  }

  const defaultCopyright = `© ${new Date().getUTCFullYear()} Government of British Columbia.`

  return (
    <div className="w-full flex flex-col justify-self-stretch">
      {/* Above is bcds-footer class */}
      <LandAcknowledgement />
      {/* below - bcds-footer--container class */}
      <div className="flex flex-col items-center justify-around bg-background-light-gray p-xl">
        {/* below - bcds-footer--container-content class */}
        <div className="w-full max-w-[1100px] flex flex-col justify-self-stretch gap-xl">
          <Links />
          {/** below bcds-footer--container-content -> hr */}
          <hr className=" bg-border-dark  h-(--border-width-sm) m-none" />
          {/* below - bcds-footer--copyright class */}
          <div className="text-typography-secondary text-base m-none">{defaultCopyright}</div>
        </div>
      </div>
    </div>
  )
}
export default Footer
