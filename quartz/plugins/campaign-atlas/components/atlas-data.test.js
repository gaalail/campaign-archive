import assert from "node:assert/strict"
import test from "node:test"
import { hasRealCampaignMap, placeMarkers } from "./atlas-data.js"

const files = [
  {
    slug: "campaigns/vyrun/place/Keep",
    frontmatter: { title: "Keep", campaign_id: "vyrun", type: "Place", map_x: 25, map_y: 70 },
  },
  {
    slug: "campaigns/vyrun/place/OutOfBounds",
    frontmatter: {
      title: "Out of bounds",
      campaign_id: "vyrun",
      type: "Place",
      map_x: 101,
      map_y: 40,
    },
  },
  {
    slug: "campaigns/other/place/Keep",
    frontmatter: { title: "Other Keep", campaign_id: "other", type: "Place", map_x: 10, map_y: 20 },
  },
]

test("campaign atlas uses only explicitly mapped places from its own campaign", () => {
  assert.deepEqual(
    placeMarkers("vyrun", files).map(({ slug, x, y }) => ({ slug, x, y })),
    [{ slug: "campaigns/vyrun/place/Keep", x: 25, y: 70 }],
  )
})

test("campaign atlas does not render without a non-empty image and valid mapped place", () => {
  assert.equal(
    hasRealCampaignMap(
      { entity_type: "campaign", campaign_id: "vyrun", map_image: "media/world.png" },
      files,
    ),
    true,
  )
  assert.equal(
    hasRealCampaignMap({ entity_type: "campaign", campaign_id: "vyrun", map_image: " " }, files),
    false,
  )
  assert.equal(
    hasRealCampaignMap(
      { entity_type: "campaign", campaign_id: "unknown", map_image: "media/world.png" },
      files,
    ),
    false,
  )
})
