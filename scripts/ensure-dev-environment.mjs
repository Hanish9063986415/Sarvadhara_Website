import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const nextDir = join(root, '.next')

/** `next build` leaves BUILD_ID; `next dev` needs a fresh development .next */
export function hasProductionNextOutput() {
  return existsSync(join(nextDir, 'BUILD_ID'))
}

export function shouldCleanBeforeDev() {
  if (process.env.SKIP_NEXT_CLEAN === '1' && !hasProductionNextOutput()) {
    return false
  }
  if (!existsSync(nextDir)) return false
  if (hasProductionNextOutput()) {
    console.log('Detected production build in .next — must clear before dev (stop `npm run start` / rebuild first).')
    return true
  }
  return process.env.SKIP_NEXT_CLEAN !== '1'
}

export function killDevPort(port = 3000) {
  spawnSync(process.execPath, [join(root, 'scripts', 'kill-port.mjs'), String(port)], {
    stdio: 'inherit',
    cwd: root,
  })
}

export function cleanNext() {
  spawnSync(process.execPath, [join(root, 'scripts', 'clean-next.mjs')], {
    stdio: 'inherit',
    cwd: root,
  })
}
