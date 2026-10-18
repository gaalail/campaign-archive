import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { promisify } from "node:util"
import { createGitIgnoredMatcher, glob } from "./glob"

const execFileAsync = promisify(execFile)

async function createFile(filePath: string, content = "") {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content)
}

test("glob respects parent and nested gitignore rules and configured ignores", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "quartz-glob-"))
  const contentDirectory = path.join(directory, "content")

  try {
    await execFileAsync("git", ["init", "--quiet"], { cwd: directory })
    await createFile(path.join(directory, ".git", "info", "exclude"), "keep.tmp\n")
    await createFile(path.join(directory, ".gitignore"), "private/\n*.tmp\n!keep.tmp\n")
    await createFile(path.join(contentDirectory, ".gitignore"), "ignored.md\n")
    await createFile(path.join(contentDirectory, "visible.md"))
    await createFile(path.join(contentDirectory, "ignored.md"))
    await createFile(path.join(contentDirectory, "private", "secret.md"))
    await createFile(path.join(contentDirectory, "keep.tmp"))
    await createFile(path.join(contentDirectory, "remove.tmp"))
    await createFile(path.join(contentDirectory, "generated", "output.json"))

    const files = await glob("**/*.*", contentDirectory, ["generated"])

    assert.deepEqual(files, ["keep.tmp", "visible.md"])
  } finally {
    await fs.rm(directory, { recursive: true, force: true })
  }
})

test("gitignore matcher applies nested rules to watched paths", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "quartz-watch-ignore-"))

  try {
    await execFileAsync("git", ["init", "--quiet"], { cwd: directory })
    await createFile(path.join(directory, ".gitignore"), "private/\n")
    await createFile(path.join(directory, "content", ".gitignore"), "ignored.md\n")
    const isGitIgnored = await createGitIgnoredMatcher(path.join(directory, "content"))

    assert.equal(isGitIgnored("private/secret.md"), true)
    assert.equal(isGitIgnored("ignored.md"), true)
    assert.equal(isGitIgnored("visible.md"), false)
  } finally {
    await fs.rm(directory, { recursive: true, force: true })
  }
})
