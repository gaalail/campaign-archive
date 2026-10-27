import test, { afterEach, describe } from "node:test"
import assert from "node:assert"
import { fetchCanonical, responseUrl } from "./util"

const realFetch = globalThis.fetch

function htmlResponse(body: string, servedFrom: string): Response {
  const res = new Response(body, { headers: { "content-type": "text/html; charset=utf-8" } })
  Object.defineProperty(res, "url", { value: servedFrom })
  return res
}

afterEach(() => {
  globalThis.fetch = realFetch
})

describe("responseUrl", () => {
  test("uses the URL the response was served from", () => {
    const requested = new URL("https://example.com/campaign-archive/spells")
    const res = htmlResponse("", "https://example.com/campaign-archive/spells/")
    assert.strictEqual(
      responseUrl(res, requested).href,
      "https://example.com/campaign-archive/spells/",
    )
  })

  test("falls back to the requested URL when the response has none", () => {
    const requested = new URL("https://example.com/campaign-archive/spells")
    assert.strictEqual(responseUrl(htmlResponse("", ""), requested).href, requested.href)
  })

  test("returns a copy so callers can change the hash without touching the request", () => {
    const requested = new URL("https://example.com/a")
    const copy = responseUrl(htmlResponse("", ""), requested)
    copy.hash = "#x"
    assert.strictEqual(requested.hash, "")
  })
})

describe("fetchCanonical", () => {
  test("resolves an alias redirect against where the stub was served", async () => {
    const stub = '<link rel="canonical" href="../campaigns/curse-of-strahd">'
    const fetched: string[] = []
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const href = String(input)
      fetched.push(href)
      if (href === "https://example.com/campaign-archive/curse-of-strahd") {
        return htmlResponse(stub, "https://example.com/campaign-archive/curse-of-strahd/")
      }
      return htmlResponse("real page", href)
    }) as typeof fetch

    const res = await fetchCanonical(
      new URL("https://example.com/campaign-archive/curse-of-strahd"),
    )
    assert.deepStrictEqual(fetched, [
      "https://example.com/campaign-archive/curse-of-strahd",
      "https://example.com/campaign-archive/campaigns/curse-of-strahd",
    ])
    assert.strictEqual(await res.text(), "real page")
  })

  test("returns pages that are not redirects untouched", async () => {
    globalThis.fetch = (async (input: RequestInfo | URL) =>
      htmlResponse("<p>hello</p>", String(input))) as typeof fetch
    const res = await fetchCanonical(new URL("https://example.com/campaign-archive/items/"))
    assert.strictEqual(await res.text(), "<p>hello</p>")
  })
})
