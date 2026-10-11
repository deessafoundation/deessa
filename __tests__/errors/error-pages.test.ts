import { describe, expect, it, jest } from "@jest/globals"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { createRoot, type Root } from "react-dom/client"
import { parse } from "node-html-parser"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { ErrorPage, type ErrorPageProps, type ErrorVariant } from "../../components/errors/error-page"
import { EventRegistrationClosed } from "../../components/events/public/event-error"

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const imageProps = { ...props }
    delete imageProps.unoptimized
    return createElement("img", imageProps)
  },
}))
jest.mock("next/link", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const linkProps = { ...props }
    delete linkProps.prefetch
    return createElement("a", linkProps)
  },
}))
jest.mock("@/lib/fonts", () => ({ comicNeue: { variable: "brand-font" } }))

function markup(props: ErrorPageProps) {
  return parse(renderToStaticMarkup(createElement(ErrorPage, props)))
}

describe("error-page presentation and recovery contracts", () => {
  it.each<ErrorVariant>(["not-found", "server", "generic", "network", "unauthorized", "closed"])(
    "%s has usable recovery actions and existing local assets", (variant) => {
      const document = markup({ variant, standalone: true })
      expect(document.querySelectorAll("main")).toHaveLength(1)
      expect(document.querySelectorAll("h1")).toHaveLength(1)
      expect(document.querySelector("a, button")).not.toBeNull()
      for (const image of document.querySelectorAll("img")) {
        expect(existsSync(join(process.cwd(), "public", image.getAttribute("src")!))).toBe(true)
      }
    },
  )

  it("keeps the demo inside its parent main with a level-two heading", () => {
    const document = markup({ variant: "generic", standalone: true, preview: true })
    expect(document.querySelector("main, h1")).toBeNull()
    expect(document.querySelectorAll("h2")).toHaveLength(1)
  })

  it("preserves feature browse destinations and hidden actions", () => {
    const document = markup({ title: "Missing program", primaryHref: "/whatwedo", primaryLabel: "Browse programs",
      secondaryHref: "/events", secondaryLabel: "Browse events" })
    expect(document.querySelector('a[href="/whatwedo"]')?.textContent).toContain("Browse programs")
    expect(document.querySelector('a[href="/events"]')?.textContent).toBe("Browse events")
    expect(markup({ showPrimary: false, showSecondary: false }).querySelector("a, button")).toBeNull()
  })

  it("does not display error messages or stacks, and escapes support references", () => {
    const error = Object.assign(new Error("PRIVATE_DATABASE_PASSWORD"), { digest: "<script>attack()</script>" })
    const document = markup({ variant: "generic", error })
    expect(document.textContent).not.toContain("PRIVATE_DATABASE_PASSWORD")
    expect(document.querySelector("script")).toBeNull()
    expect(document.querySelector("code")?.textContent).toBe(error.digest)
  })

  it("offers sign-in without representing the UI as an authorization check", () => {
    expect(markup({ variant: "unauthorized" }).querySelector('a[href="/admin/login"]')?.textContent).toContain("Team sign in")
  })

  it("keeps the ended-event recovery link", () => {
    const document = parse(renderToStaticMarkup(createElement(EventRegistrationClosed, {
      ended: true, eventHref: "/events/example",
    })))
    expect(document.querySelector("h1")?.textContent).toBe("This event has ended.")
    expect(document.querySelector('a[href="/events/example"]')?.textContent).toBe("Back to event")
  })
})


