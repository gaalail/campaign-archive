export function placeMarkers(campaignId, files) {
  if (!campaignId || !Array.isArray(files)) return []
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

export function hasRealCampaignMap(metadata, files) {
  return (
    metadata?.entity_type === "campaign" &&
    typeof metadata.map_image === "string" &&
    metadata.map_image.trim().length > 0 &&
    placeMarkers(metadata.campaign_id, files).length > 0
  )
}
