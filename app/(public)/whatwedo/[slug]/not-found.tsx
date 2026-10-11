import NotFoundErrorPage from "@/components/errors/not-found-error-page"

export default function ProgramNotFound() {
  return <NotFoundErrorPage title="We couldn’t find this program."
    message="This program may have moved or is no longer available. Explore our current programs to find another way to connect."
    primaryHref="/whatwedo" primaryLabel="Browse programs" secondaryHref="/" secondaryLabel="Back to home" />
}
