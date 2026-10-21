import { rmSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const targets = ['.next', join('node_modules', '.cache')]

for (const rel of targets) {
  const path = join(root, rel)
  try {
    rmSync(path, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 })
    console.log(`Removed ${rel}`)
  } catch (err) {
    console.warn(`Could not remove ${rel}:`, err.message)
  }
}

console.log('Next.js cache cleared. Run npm run dev (or npm run build) to rebuild.')
