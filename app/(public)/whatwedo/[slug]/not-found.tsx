import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProgramNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-muted">
          <span className="text-4xl">📄</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Program Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The program you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Button asChild>
          <Link href="/whatwedo">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Browse Programs
          </Link>
        </Button>
      </div>
    </div>
  )
}
