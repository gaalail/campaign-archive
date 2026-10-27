import fs from "node:fs/promises"
import path from "node:path"

export function ArchiveGraphIndex() {
  return {
    name: "ArchiveGraphIndex",
    async emit(ctx, content) {
      const index = content.flatMap(([, file]) => {
        const data = file.data ?? {}
        if (data.unlisted === true || !data.slug) return []
        return [
          {
            slug: data.slug,
            title: data.frontmatter?.title?.toString() ?? "",
            links: data.links ?? [],
          },
        ]
      })
      const output = path.join(ctx.argv.output, "static", "archiveGraphIndex.json")
      await fs.mkdir(path.dirname(output), { recursive: true })
      await fs.writeFile(output, JSON.stringify(index))
      return [output]
    },
  }
}
