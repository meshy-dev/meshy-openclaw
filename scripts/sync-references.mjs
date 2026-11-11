#!/usr/bin/env node
/**
 * Vendors the skill's references from meshy-3d-agent, which owns them: change them there,
 * release it, then move the pin here.
 *
 *   node scripts/sync-references.mjs                     copy from the release pinned in package.json
 *   node scripts/sync-references.mjs --from <checkout>   copy from a local meshy-3d-agent checkout
 *   node scripts/sync-references.mjs --check             fail when references/ differs from the pin
 *
 * package.json "meshy.skills" pins the source as "<owner>/<repo>#<tag>".
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

// reference → the meshy-3d-agent skill that owns it
const REFERENCES = {
  'setup.md': 'meshy-3d-generation',
  'delivery.md': 'meshy-3d-generation',
  'troubleshooting.md': 'meshy-3d-generation',
  'pipelines.md': 'meshy-3d-generation',
  'animation.md': 'meshy-3d-generation',
  'printing.md': 'meshy-3d-printing',
  'creative-lab.md': 'meshy-3d-printing',
}
const root = fileURLToPath(new URL('..', import.meta.url))
const target = join(root, 'skills', 'meshy-openclaw', 'references')
const { values } = parseArgs({ options: { from: { type: 'string' }, check: { type: 'boolean' } } })
const pin = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).meshy.skills
const label = values.from ?? pin

async function download(spec) {
  const [repo, tag] = spec.split('#')
  const res = await fetch(`https://codeload.github.com/${repo}/tar.gz/refs/tags/${tag}`)
  if (!res.ok) throw new Error(`cannot download ${spec}: HTTP ${res.status}`)
  const dir = mkdtempSync(join(tmpdir(), 'meshy-references-'))
  writeFileSync(join(dir, 'source.tar.gz'), Buffer.from(await res.arrayBuffer()))
  execFileSync('tar', ['-xzf', join(dir, 'source.tar.gz'), '-C', dir, '--strip-components=1'])
  return dir
}

const source = values.from ?? (await download(pin))
const want = new Map(
  Object.entries(REFERENCES).map(([name, owner]) => {
    const path = join(source, 'skills', owner, 'references', name)
    if (!existsSync(path)) throw new Error(`${label} has no skills/${owner}/references/${name}`)
    return [name, readFileSync(path)]
  }),
)

if (values.check) {
  const have = existsSync(target) ? readdirSync(target).filter((name) => !name.startsWith('.')) : []
  const stale = [...new Set([...want.keys(), ...have])].filter((name) => {
    const path = join(target, name)
    return !want.has(name) || !existsSync(path) || !readFileSync(path).equals(want.get(name))
  })
  if (stale.length) {
    console.error(`references differ from ${label}:\n  ${stale.join('\n  ')}\nRun: node scripts/sync-references.mjs`)
    process.exit(1)
  }
  console.log(`references match ${label}`)
} else {
  rmSync(target, { recursive: true, force: true })
  mkdirSync(target, { recursive: true })
  for (const [name, bytes] of want) writeFileSync(join(target, name), bytes)
  console.log(`Copied ${want.size} references from ${label}`)
}
