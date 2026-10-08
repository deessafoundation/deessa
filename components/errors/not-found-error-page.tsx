import { ErrorPage, type ErrorPageProps } from "./error-page"

export default function NotFound(props: Omit<ErrorPageProps, "variant"> = {}) {
  return <ErrorPage {...props} variant="not-found" />
}
