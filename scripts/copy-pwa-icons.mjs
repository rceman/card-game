import { cp, mkdir, stat, rm } from 'fs/promises'
import path from 'path'

const rootDir = process.cwd()
const sourceDir = path.join(rootDir, 'src', 'assets', 'icons')
const destDir = path.join(rootDir, 'public', 'icons')

const ensureSourceExists = async () => {
  let s
  try {
    s = await stat(sourceDir)
  } catch {
    throw new Error(`PWA icon source folder not found: ${sourceDir}`)
  }
  if (!s.isDirectory()) {
    throw new Error(`PWA icon source is not a directory: ${sourceDir}`)
  }
}

const copyIcons = async () => {
  await ensureSourceExists()
  await rm(destDir, { recursive: true, force: true })
  await mkdir(destDir, { recursive: true })
  await cp(sourceDir, destDir, { recursive: true })
}

copyIcons().catch((error) => {
  console.error(error)
  process.exit(1)
})
