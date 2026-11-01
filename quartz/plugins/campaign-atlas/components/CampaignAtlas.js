import { h } from "preact"

function configuredBasePath(fileData) {
  if (fileData.ctx.argv.serve) return ""
  if (!fileData.cfg.baseUrl) return ""
  return new URL(`https://${fileData.cfg.baseUrl}`).pathname.replace(/\/$/, "")
}

function placeUrl(slug, fileData) {
  return `${configuredBasePath(fileData)}/${slug}`.replace(/\/+/g, "/")
}

function placeMarkers(campaignId, files) {
  return files.flatMap((file) => {
    const data = file.frontmatter ?? {}
    if (data.campaign_id !== campaignId || data.type !== "Place") return []
    const { map_x: x, map_y: y } = data
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x > 100 || y < 0 || y > 100) {
      return []
    }
    return [{ slug: file.slug, title: data.title ?? file.slug, x, y }]
  })
}

function mapSource(value, fileData) {
  if (typeof value !== "string" || !value.trim()) return ""
  let source = value.trim().replace(/^\/+/, "")
  const configuredBase = configuredBasePath(fileData)
  const baseWithoutSlash = configuredBase.replace(/^\/+|\/+$/g, "")
  if (baseWithoutSlash && source.startsWith(`${baseWithoutSlash}/`)) {
    source = source.slice(baseWithoutSlash.length + 1)
  }
  return `${configuredBase}/${source}`.replace(/\/+/g, "/")
}

export function CampaignAtlas({ fileData, allFiles }) {
  const metadata = fileData.frontmatter ?? {}
  if (metadata.entity_type !== "campaign" || !metadata.campaign_id) return null

  const locations = placeMarkers(metadata.campaign_id, allFiles)
  const source = mapSource(metadata.map_image, fileData)
  if (!source || locations.length === 0) return null

  return h("section", { class: "campaign-atlas", "aria-labelledby": "campaign-atlas-title" }, [
    h("h2", { id: "campaign-atlas-title" }, "Campaign Atlas"),
    h(
      "div",
      { class: "campaign-atlas-map", role: "group", "aria-label": "Campaign map locations" },
      [
        h("img", { src: source, alt: `${metadata.title ?? "Campaign"} map` }),
        ...locations.map((location) =>
          h(
            "a",
            {
              key: location.slug,
              class: "campaign-atlas-marker",
              style: `left:${location.x}%;top:${location.y}%`,
              href: placeUrl(location.slug, fileData),
              title: location.title,
              "aria-label": location.title,
            },
            "•",
          ),
        ),
      ],
    ),
    h(
      "ul",
      { class: "campaign-atlas-legend" },
      locations.map((location) =>
        h(
          "li",
          { key: location.slug },
          h("a", { href: placeUrl(location.slug, fileData) }, location.title),
        ),
      ),
    ),
  ])
}

CampaignAtlas.css = `
.campaign-atlas { margin: 1.5rem 0; }
.campaign-atlas-map { position: relative; overflow: hidden; border: 1px solid var(--lightgray); border-radius: 0.5rem; }
.campaign-atlas-map img { display: block; width: 100%; height: auto; }
.campaign-atlas-marker { position: absolute; display: grid; place-items: center; transform: translate(-50%, -50%); width: 1.75rem; height: 1.75rem; border: 2px solid white; border-radius: 50%; background: var(--secondary); color: white; font-size: 1.4rem; line-height: 1; text-decoration: none; box-shadow: 0 1px 4px #0008; }
.campaign-atlas-marker:focus-visible { outline: 3px solid var(--dark); outline-offset: 2px; }
.campaign-atlas-legend { columns: 2; }
@media print { .campaign-atlas-marker { print-color-adjust: exact; } }
`

export default function CampaignAtlasComponent() {
  return CampaignAtlas
}
