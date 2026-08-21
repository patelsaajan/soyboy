// Guard for commands that touch PRODUCTION (deploy, prod migrations).
// Usage: node scripts/confirm.mjs <action>
//
// Passes without prompting when:
//   - CI=true                (CI pipelines confirm by configuration, not typing)
//   - CONFIRM=<action>       (lets a parent script that already confirmed chain
//                             into child scripts without double-prompting)
// Otherwise requires the exact action word typed at a real terminal.
// No TTY and no bypass → fails closed, so nothing prod-touching can run by accident.
import readline from 'node:readline/promises'

// What the prompt names, so it is obvious which environment is about to be hit.
const TARGET = process.env.PROD_TARGET ?? 'soyboy-payload / production Neon'

const action = process.argv[2] ?? 'proceed'

if (process.env.CI === 'true' || process.env.CONFIRM === action) {
  process.exit(0)
}

if (!process.stdin.isTTY) {
  console.error(
    `✋ Refusing to ${action} without confirmation (no interactive terminal).\n` +
      `   Run this from a terminal, or set CONFIRM=${action} / CI=true if you really mean it.`,
  )
  process.exit(1)
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const answer = await rl.question(
  `⚠️  This will ${action} against PRODUCTION (${TARGET}). Type "${action}" to continue: `,
)
rl.close()

if (answer.trim() !== action) {
  console.error('Aborted.')
  process.exit(1)
}
