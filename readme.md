# OrbitConnect — Unified Developer Profile Aggregator

Enter a GitHub username and get back a "passport" — a single stamped
profile that pulls together your GitHub repository footprint and your npm
package history, so a recruiter or collaborator can see your public
open-source presence in one place instead of hopping between sites.

**Live demo:** _add your GitHub Pages link here_

## Why this project

Developers publish across several platforms, but no single profile shows
all of it. OrbitConnect answers one question — "what has this person
actually shipped, publicly?" — by combining GitHub repo/star counts with
npm packages maintained, presented as a passport with a stamp per
platform found.

## Features

- Look up any public GitHub account
- Auto-checks npm for packages under the same (or a supplied) username
- Passport-style UI with a "stamp" per platform — filled if found, dashed
  if not
- Aggregate ledger: total repos, total stars, followers, npm package count
- Zero backend — reads only public GitHub and npm registry APIs, stores
  nothing

## Tech stack

- Vanilla JavaScript (ES2020+)
- [GitHub REST API](https://docs.github.com/en/rest) — unauthenticated
- [npm registry search API](https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md) — public, no key required

## Running locally

```bash
git clone https://github.com/arjayb/OrbitConnect.git
cd OrbitConnect
npx serve .
```

## Known limitations

- Unauthenticated GitHub requests are capped at 60/hour per IP
- npm's maintainer search only finds packages where the given username is
  listed as a maintainer — packages published under an org scope may not
  surface
- GitLab support was scoped out for v1 due to inconsistent CORS behavior
  on GitLab's public API from the browser

## Possible next steps

- Add GitLab via a small serverless proxy to sidestep CORS
- Shareable passport image export (PNG/SVG)
- Optional PyPI and Docker Hub checks

## License

MIT
