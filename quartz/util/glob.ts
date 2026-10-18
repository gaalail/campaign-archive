import path from "path"
import fs from "fs/promises"
import { execFile } from "child_process"
import { promisify } from "util"
import ignore from "ignore"
import { glob as tinyGlob } from "tinyglobby"
import { minimatch } from "minimatch"
import { FilePath } from "./path"

const execFileAsync = promisify(execFile)

function getErrorCode(error: unknown): string | number | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined
  const { code } = error
  return typeof code === "string" || typeof code === "number" ? code : undefined
}

export function toPosixPath(fp: string): string {
  return fp.split(path.sep).join("/")
}

const ignoredDirectories = [
  "**/.git/**",
  "**/node_modules/**",
  "**/flow-typed/**",
  "**/coverage/**",
]

function rebaseGitignorePattern(pattern: string, base: string): string {
  const negative = pattern.startsWith("!")
  const cleanPattern = negative ? pattern.slice(1) : pattern
  const slashIndex = cleanPattern.indexOf("/")
  const hasInnerSlash = slashIndex !== -1 && slashIndex !== cleanPattern.length - 1

  let rebased: string
  if (!hasInnerSlash) {
    rebased = path.posix.join(base, "**", cleanPattern)
  } else if (cleanPattern.startsWith("/")) {
    rebased = path.posix.join(base, cleanPattern.slice(1))
  } else {
    rebased = path.posix.join(base, cleanPattern)
  }

  return negative ? `!${rebased}` : rebased
}

function normalizeGitignoreLine(line: string): string {
  line = line.replace(/^\uFEFF/, "")

  let whitespaceStart = line.length
  while (whitespaceStart > 0 && /\s/.test(line[whitespaceStart - 1])) whitespaceStart--
  if (whitespaceStart === line.length) return line

  let backslashCount = 0
  for (let index = whitespaceStart - 1; index >= 0 && line[index] === "\\"; index--) {
    backslashCount++
  }

  return backslashCount % 2 === 1
    ? line.slice(0, whitespaceStart) + " "
    : line.slice(0, whitespaceStart)
}

async function findGitRoot(cwd: string): Promise<string | undefined> {
  let current = path.resolve(cwd)

  while (true) {
    try {
      await fs.access(path.join(current, ".git"))
      return current
    } catch (error) {
      const code = getErrorCode(error)
      if (code !== "ENOENT" && code !== "ENOTDIR") throw error
    }

    const parent = path.dirname(current)
    if (parent === current) return undefined
    current = parent
  }
}

async function readGitPath(gitRoot: string, ...args: string[]): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync("git", args, { cwd: gitRoot, encoding: "utf8" })
    const gitPath = stdout.trim()
    return gitPath ? path.resolve(gitRoot, gitPath) : undefined
  } catch (error) {
    const code = getErrorCode(error)
    if (code === 1 || code === "ENOENT") return undefined
    throw error
  }
}

async function addIgnoreFile(matcher: ReturnType<typeof ignore>, filePath: string, base: string) {
  let content: string
  try {
    content = await fs.readFile(filePath, "utf8")
  } catch (error) {
    if (getErrorCode(error) === "ENOENT") return
    throw error
  }

  const patterns = content
    .split(/\r?\n/)
    .map(normalizeGitignoreLine)
    .filter((pattern) => pattern.length > 0 && !pattern.startsWith("#"))
    .map((pattern) => rebaseGitignorePattern(pattern, base))
  matcher.add(patterns)
}

export async function createGitIgnoredMatcher(cwd: string): Promise<(fp: string) => boolean> {
  const absoluteCwd = path.resolve(cwd)
  const detectedGitRoot = await findGitRoot(absoluteCwd)
  const gitRoot = detectedGitRoot ?? absoluteCwd
  const ignoreFilePaths = new Set<string>()
  const ancestorPaths: string[] = []
  let current = absoluteCwd

  while (current === gitRoot || current.startsWith(`${gitRoot}${path.sep}`)) {
    ancestorPaths.push(path.join(current, ".gitignore"))
    if (current === gitRoot) break
    current = path.dirname(current)
  }

  const descendantIgnoreFiles = await tinyGlob("**/.gitignore", {
    cwd: absoluteCwd,
    dot: true,
    ignore: ignoredDirectories,
  })
  for (const filePath of ancestorPaths) ignoreFilePaths.add(filePath)
  for (const filePath of descendantIgnoreFiles) {
    ignoreFilePaths.add(path.resolve(absoluteCwd, filePath))
  }

  const matcher = ignore()
  const sortedIgnoreFiles = [...ignoreFilePaths].sort((left, right) => left.length - right.length)

  const globalIgnoreFile = await readGitPath(
    absoluteCwd,
    "config",
    "--path",
    "--get",
    "core.excludesFile",
  )
  if (globalIgnoreFile) await addIgnoreFile(matcher, globalIgnoreFile, "")

  if (detectedGitRoot) {
    const gitInfoExclude = await readGitPath(
      detectedGitRoot,
      "rev-parse",
      "--git-path",
      "info/exclude",
    )
    if (gitInfoExclude) await addIgnoreFile(matcher, gitInfoExclude, "")
  }

  for (const filePath of sortedIgnoreFiles) {
    const base = toPosixPath(path.relative(gitRoot, path.dirname(filePath)))
    await addIgnoreFile(matcher, filePath, base)
  }

  return (fp) => {
    const rootRelativePath = toPosixPath(path.relative(gitRoot, path.resolve(absoluteCwd, fp)))
    return matcher.ignores(rootRelativePath)
  }
}

export async function glob(
  pattern: string,
  cwd: string,
  ignorePatterns: string[],
): Promise<FilePath[]> {
  const fps = await tinyGlob(pattern, {
    cwd,
    ignore: [...ignoredDirectories, ...ignorePatterns],
  })
  const gitIgnored = await createGitIgnoredMatcher(cwd)
  const filtered = fps
    .map(toPosixPath)
    .filter((fp) => !gitIgnored(fp))
    .filter(
      (fp) => !ignorePatterns.some((ignorePattern) => minimatch(fp, ignorePattern, { dot: true })),
    )

  const normalized = filtered.sort()
  return normalized as FilePath[]
}
