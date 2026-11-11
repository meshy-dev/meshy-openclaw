# Meshy for OpenClaw

The [Meshy](https://www.meshy.ai) skill for OpenClaw: 3D generation and
3D printing in one skill, driven by the [Meshy CLI](https://github.com/meshy-dev/meshy-cli). It is
published on ClawHub as [Meshy 3D Agent](https://clawhub.ai/arlieeee/skills/meshy-3d-agent):

```bash
openclaw skills install @arlieeee/meshy-3d-agent
```

The skill signs in through the browser; an existing `MESHY_API_KEY` is honoured but not required.
It needs Node.js 22.12+ and offers to install the CLI with npm.

On any other agent (Claude Code, Codex, Cursor, Hermes Agent and others), use the separate
generation and printing skills in [meshy-3d-agent](https://github.com/meshy-dev/meshy-3d-agent)
instead.

## Layout

- `skills/meshy-openclaw/SKILL.md` is written here: the OpenClaw sign-in, the security manifest
  and the routing between digital assets and prints.
- `skills/meshy-openclaw/references/` is vendored from meshy-3d-agent's generation and printing
  skills, pinned by `package.json` `meshy.skills`. Change the references there, release
  meshy-3d-agent, then move the pin here and run `npm run sync`. CI fails when they drift.

```bash
npm run sync                                          # copy from the pinned release
node scripts/sync-references.mjs --from ../meshy-3d-agent   # copy from a local checkout
npm run check                                         # references match the pin, SKILL.md is valid
```

## Releasing

Bump `version` in `package.json` and `CHANGELOG.md`, tag `vX.Y.Z`, then publish the tagged commit
to ClawHub:

```bash
npx clawhub publish skills/meshy-openclaw --slug meshy-3d-agent --name "Meshy 3D Agent" \
  --version X.Y.Z --source-repo meshy-dev/meshy-openclaw \
  --source-commit "$(git rev-parse vX.Y.Z^{commit})" --source-ref vX.Y.Z \
  --source-path skills/meshy-openclaw --changelog "…"
```

The new version stays hidden until ClawHub's scan passes; `npx clawhub inspect meshy-3d-agent`
then shows it as clean.

## License

[MIT-0](LICENSE)
