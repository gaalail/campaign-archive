import fs from "node:fs/promises"
import path from "node:path"

export function ArchiveGraphIndex() {
  return {
    name: "ArchiveGraphIndex",
    async emit(ctx, content) {
      const pages = content.flatMap(([, file]) => {
        const data = file.data ?? {}
        if (data.unlisted === true || !data.slug) return []
        return [
          {
            slug: data.slug,
            title: data.frontmatter?.title?.toString() ?? "",
            links: data.links ?? [],
            aliases: data.frontmatter?.aliases ?? [],
          },
        ]
      })
      const exactSlugs = new Map(pages.map((page) => [page.slug, page.slug]))
      const folderSlugs = new Map(
        pages
          .filter((page) => page.slug === "index" || page.slug.endsWith("/index"))
          .map((page) => [page.slug.replace(/(?:^|\/)index$/, ""), page.slug]),
      )
      const aliasSlugs = new Map(
        pages.flatMap((page) =>
          (Array.isArray(page.aliases) ? page.aliases : [page.aliases])
            .filter((alias) => typeof alias === "string")
            .map((alias) => [
              alias
                .replace(/^\/+|\/+$/g, "")
                .replace(/\/index$/i, "")
                .toLowerCase(),
              page.slug,
            ]),
        ),
      )
      const index = pages.map(({ aliases, ...page }) => ({
        ...page,
        links: [
          ...new Set(
            page.links
              .map((target) => {
                const route = target.replace(/^\/+|\/+$/g, "")
                return target.endsWith("/")
                  ? (folderSlugs.get(route) ?? exactSlugs.get(route) ?? aliasSlugs.get(route))
                  : (exactSlugs.get(route) ?? aliasSlugs.get(route) ?? folderSlugs.get(route))
              })
              .filter(Boolean),
          ),
        ],
      }))
      const output = path.join(ctx.argv.output, "static", "archiveGraphIndex.json")
      await fs.mkdir(path.dirname(output), { recursive: true })
      await fs.writeFile(output, JSON.stringify(index))
      return [output]
    },
  }
}
