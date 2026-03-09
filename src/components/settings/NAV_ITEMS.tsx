import { FolderOpenIcon, HandRaisedIcon, MapPinIcon, UsersIcon } from "@heroicons/react/24/outline"

export const NAV_ITEMS = [
  {
    label: "Users",
    href: "/protected/settings/users",
    icon: <UsersIcon className="h-7 w-7 text-blue" />,
  },
  {
    label: "Locations",
    href: "/protected/settings/locations",
    icon: <MapPinIcon className="h-7 w-7 text-blue" />,
  },
  {
    label: "Services",
    href: "/protected/settings/services",
    icon: <HandRaisedIcon className="h-7 w-7 text-blue" />,
  },
  {
    label: "Service Categories",
    href: "/protected/settings/service-categories",
    icon: <FolderOpenIcon className="h-7 w-7 text-blue" />,
  },
]
