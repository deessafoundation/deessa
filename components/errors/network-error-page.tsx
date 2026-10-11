import { ErrorPage, type ErrorPageProps } from "./error-page"

export default function NetworkErrorPage(props: Omit<ErrorPageProps, "variant"> = {}) {
  return <ErrorPage {...props} variant="network" />
}
