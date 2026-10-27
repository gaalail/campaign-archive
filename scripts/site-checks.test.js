import assert from "node:assert/strict"
import test from "node:test"
import { canonicalUrl } from "./site-checks.js"

test("canonical URLs keep apostrophes inside double-quoted hrefs", () => {
  const page = new URL(
    "https://gaalail.github.io/campaign-archive/character-options/class-options/avatar-features/Avatar's-Invective",
  )
  const html =
    '<link rel="canonical" href="../../../character-options/class-options/avatar-features/avatar\'s-invective">'

  assert.equal(
    canonicalUrl(html, page)?.href,
    "https://gaalail.github.io/campaign-archive/character-options/class-options/avatar-features/avatar's-invective",
  )
})
