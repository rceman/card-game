import { access } from 'fs/promises'
import path from 'path'

const distDir = path.join(process.cwd(), 'dist')
const iconsDir = path.join(distDir, 'icons')

const requiredIcons = [
  'icon-180.png',
  'icon-192.png',
  'icon-512.png',
  'maskable-192.png',
  'maskable-512.png',
  'favicon-16.png',
  'favicon-32.png',
  'favicon-64.png',
]

const verifyFileExists = async (filePath) => {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

const verifyIcons = async () => {
  const missingFiles = []

  for (const icon of requiredIcons) {
    const iconPath = path.join(iconsDir, icon)
    // eslint-disable-next-line no-await-in-loop
    const exists = await verifyFileExists(iconPath)
    if (!exists) {
      missingFiles.push(path.join('dist', 'icons', icon))
    }
  }

  if (missingFiles.length > 0) {
    console.error('Missing required PWA icon files:')
    for (const file of missingFiles) {
      console.error(`- ${file}`)
    }
    process.exit(1)
  }

  console.log('All required PWA icon files are present in dist/icons.')
}

verifyIcons().catch((error) => {
  console.error(error)
  process.exit(1)
})
