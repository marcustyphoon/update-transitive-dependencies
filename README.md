## Update Transitive Dependencies

Quick and dirty utility to update lockfile-only dependencies to the latest that fulfill package dependency versions.

This ignores ^ and ~ semver specifiers, installing exact versions of your package.json deps, so only use this if your dependency update method bumps package.json versions (dependabot, renovate, `pnpm up -i`, and `npx ncu -i` should all default to this afaik).

**Not currently supported:** monorepos.

Install by checking out and running

> `npm i -g .`

Run in an npm project with

> `utd`
