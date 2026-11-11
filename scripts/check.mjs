#!/usr/bin/env node
/**
 * Checks what this repository writes itself: SKILL.md. The references are vendored from
 * meshy-3d-agent and validated there; sync-references.mjs --check keeps them identical.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const entry = join(root, 'skills', 'meshy-openclaw', 'SKILL.md')
const text = readFileSync(entry, 'utf8')
const problems = []
const require = (ok, message) => ok || problems.push(message)

const front = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? ''
require(/^name: meshy-openclaw$/m.test(front), 'frontmatter: name must be meshy-openclaw')
require(/^description: \S/m.test(front), 'frontmatter: missing description')
require(/^ {4}homepage: https:\/\/github\.com\/meshy-dev\/meshy-openclaw$/m.test(front), 'frontmatter: homepage must be this repository')
// The install hint and the documented runner follow the CLI range the references are written for.
require(new RegExp(`^ {8}package: meshy-cli@${pkg.meshy.cli.replace('.', '\\.')}$`, 'm').test(front), `frontmatter: the install hint must be meshy-cli@${pkg.meshy.cli}`)
require(text.includes(pkg.meshy.minCli), `SKILL.md does not name the minimum CLI ${pkg.meshy.minCli}`)
// An env gate hides the skill from users who sign in through the browser.
require(!/^ {6}env:/m.test(front), 'frontmatter: no env gate under requires')

for (const [, target] of text.matchAll(/\[[^\]]*\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
  if (/^[a-z]+:\/\//.test(target)) continue
  require(existsSync(join(dirname(entry), target)), `broken link: ${target}`)
}
for (const [, body] of text.matchAll(/```(?:bash|sh|shell)\n([\s\S]*?)```/g)) {
  for (const line of body.replace(/\\\n/g, ' ').split('\n')) {
    if (!/^meshy\s/.test(line) || /--(help|version)\b/.test(line)) continue
    require(/--format json/.test(line) && /--no-update-check/.test(line), `command without --format json --no-update-check: ${line}`)
  }
}

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log('SKILL.md is valid')
