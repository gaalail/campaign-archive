import fs from "node:fs/promises"
import path from "node:path"
import { lint } from "markdownlint/sync"

const markdownFiles = []

async function collectMarkdownFiles(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      await collectMarkdownFiles(filePath)
    } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".md") {
      markdownFiles.push(filePath)
    }
  }
}

for (const entry of await fs.readdir(".", { withFileTypes: true })) {
  if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".md") {
    markdownFiles.push(entry.name)
  }
}

for (const directory of ["content", "docs", "quartz", "scripts", ".github"]) {
  try {
    await fs.access(directory)
  } catch (error) {
    if (error.code === "ENOENT") continue
    throw error
  }
  await collectMarkdownFiles(directory)
}

markdownFiles.sort()
const config = JSON.parse(await fs.readFile(".markdownlint.json", "utf8"))
const results = lint({ files: markdownFiles, config })
const diagnostics = Object.entries(results).flatMap(([filePath, errors]) =>
  errors.map(({ lineNumber, ruleNames, ruleDescription, errorDetail }) => {
    const detail = errorDetail ? ` (${errorDetail})` : ""
    return `${filePath}:${lineNumber} ${ruleNames[0]} ${ruleDescription}${detail}`
  }),
)

if (diagnostics.length > 0) {
  console.error(diagnostics.join("\n"))
  console.error(
    `Markdown lint found ${diagnostics.length} issues in ${Object.keys(results).length} files.`,
  )
  process.exitCode = 1
} else {
  console.log(`Markdown lint passed for ${markdownFiles.length} files.`)
}
