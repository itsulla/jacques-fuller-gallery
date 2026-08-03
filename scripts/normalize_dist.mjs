import { chmod, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve('dist')
let directoryCount = 0
let fileCount = 0

async function normalizeDirectory(directory) {
  await chmod(directory, 0o755)
  directoryCount += 1

  const entries = await readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      await normalizeDirectory(path)
    } else if (entry.isFile()) {
      await chmod(path, 0o644)
      fileCount += 1
    }
  }
}

await normalizeDirectory(root)
console.log(`Normalized dist permissions: ${directoryCount} directories, ${fileCount} files.`)
