import assert from "node:assert/strict"
import test from "node:test"
import { canonicalUrl, findMissingSitemapPages, htmlFragmentIds } from "./site-checks.js"

test("sitemap completeness detects canonical pages omitted from the sitemap", () => {
  const documents = [
    {
      filepath: "/public/spells/index.html",
      url: new URL("https://example.com/campaign-archive/spells/"),
      canonical: new URL("https://example.com/campaign-archive/spells/"),
    },
    {
      filepath: "/public/old-spell.html",
      url: new URL("https://example.com/campaign-archive/old-spell"),
      canonical: new URL("https://example.com/campaign-archive/spells/fire-bolt"),
    },
  ]

  assert.deepEqual(
    findMissingSitemapPages(
      documents,
      "<urlset><url><loc>https://example.com/campaign-archive/</loc></url></urlset>",
    ),
    ["/campaign-archive/spells/"],
  )
})

test("generated HTML fragment IDs include headings and explicit IDs", () => {
  const ids = htmlFragmentIds(
    '<main><h2 id="custom">House <em>Rules</em></h2><a name="legacy"></a><div id="explicit"></div></main>',
  )

  assert.ok(ids.has("custom"))
  assert.ok(ids.has("legacy"))
  assert.ok(ids.has("explicit"))
  assert.ok(ids.has("house-rules"))
})

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
