import { execSync } from 'node:child_process'

const port = Number(process.argv[2] || 3000)

function killOnWindows() {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] })
    const pids = new Set()
    for (const line of out.split(/\r?\n/)) {
      if (!line.includes('LISTENING')) continue
      const parts = line.trim().split(/\s+/)
      const pid = parts[parts.length - 1]
      if (pid && /^\d+$/.test(pid) && pid !== '0') pids.add(pid)
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' })
        console.log(`Stopped process ${pid} on port ${port}`)
      } catch {
        /* already exited */
      }
    }
  } catch {
    /* nothing listening */
  }
}

function killOnUnix() {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, { stdio: 'ignore', shell: true })
  } catch {
    /* nothing listening */
  }
}

if (process.platform === 'win32') killOnWindows()
else killOnUnix()
