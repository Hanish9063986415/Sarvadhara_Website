import { spawn } from 'node:child_process'
import { join } from 'node:path'
import {
  cleanNext,
  killDevPort,
  shouldCleanBeforeDev,
} from './ensure-dev-environment.mjs'

const root = process.cwd()

// Stop any server still holding 3000 (avoids dev + start fighting over .next)
killDevPort(3000)

if (shouldCleanBeforeDev()) {
  console.log('Clearing .next before dev (set SKIP_NEXT_CLEAN=1 to skip when no production BUILD_ID)…')
  cleanNext()
}

const ip = spawn(process.execPath, [join(root, 'scripts', 'get-ip.js')], {
  stdio: 'inherit',
  cwd: root,
})
ip.on('close', (code) => {
  if (code !== 0) process.exit(code ?? 1)

  const next = spawn('npx', ['next', 'dev', '-H', '0.0.0.0'], {
    stdio: 'inherit',
    cwd: root,
    shell: true,
  })
  next.on('close', (c) => process.exit(c ?? 0))
})
