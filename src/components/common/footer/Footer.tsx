"use client"

export const Footer = () => {
  // suggested classes for the land acknowledgemetn
  const LandAcknowledgement = () => {
    const p = `The B.C. Public Service acknowledges the
        territories of First Nations around B.C. and is grateful to carry out
        our work on these lands. We acknowledge the rights, interests,
        priorities, and concerns of all Indigenous Peoples — First Nations,
        Métis, and Inuit — respecting and acknowledging their distinct
        cultures, histories, rights, laws, and governments.`

    //      <div className="flex flex-col items-center justify-around border-solid border-t-large border-b-large border-y-gold-600 bg-gray-950 p-xl m-none">

    //         <div className="flex flex-col items-center text-typography-primary-invert text-sm max-w-1100px w-full justify-stretch">

    return (
      <div className=" flex-col justify-around bg-gray-950">
        {/* above - bcds-footer--acknowledgement class */}
        {/* below - bcds-footer--acknowledgement-text class */}
        <div className="">{p}</div>
      </div>
    )
  }

  const Links = () => {
    return (
      <div className="grid grid-cols-">
        {/* above - bcds-footer--container-content class */}
        <a href="https://www2.gov.bc.ca//gov/content/home/accessible-government">Accessibility</a>
        <a href="https://www2.gov.bc.ca//gov/content/home/privacy">Privacy</a>
        <a href="https://www2.gov.bc.ca//gov/content/home/copyright">Copyright</a>
        <a href="https://www2.gov.bc.ca//gov/content/home/disclaimer">Disclaimer</a>
      </div>
    )
  }

  // Suggested formatting for the footer container
  // flex flex-col items-center justify-around bg-[color:var(--surface-color-background-light-gray)] pt-[var(--layout-padding-xlarge)] pr-[var(--layout-padding-xlarge)] pb-[var(--layout-padding-xlarge)] pl-[var(--layout-padding-xlarge)];

  // suggested formatting for the footer container and its contents
  // flex flex-col items-stretch gap-[var(--layout-padding-xlarge)] max-w-[1100px] w-full

  // suggested formatting for

  return (
    <div className="fixed left-0 bottom-0 w-full">
      {/* Above is bcds-footer class */}
      <LandAcknowledgement />
      {/* bcds-footer--container class */}
      <div>
        <Links />
      </div>
      <div>COPYRIGHT</div>
    </div>
  )
}
export default Footer
