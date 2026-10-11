import { ErrorPage, type ErrorPageProps } from "./error-page"

export default function UnauthorizedErrorPage(props: Omit<ErrorPageProps, "variant"> = {}) {
  return <ErrorPage {...props} variant="unauthorized" />
}
