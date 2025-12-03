"use client"

import { Header as Dsheader } from "@bcgov/design-system-react-components"
import { Loginout } from "@/components"

export const Header = () => {
  return (
    <Dsheader title="SBC Queue Management">
      <Loginout />
    </Dsheader>
  )
}
export default Header
