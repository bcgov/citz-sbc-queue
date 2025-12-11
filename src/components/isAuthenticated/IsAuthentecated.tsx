type Props = {
  isAuthenticated?: string
  children: React.ReactNode
}

export const IsAuthenticated = (props: Props) => {
  const { isAuthenticated, children } = props


  if (isAuthenticated) {
    return <>{children}</>
  }

  return null
}
