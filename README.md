# tizenbrew-ua-probe

Multi-method UA lab for RV LR. Canonical: [`mentalprosthetics/tizenbrew-ua-probe`](https://github.com/mentalprosthetics/tizenbrew-ua-probe)  
**Never:** `niteowl099/tizenbrew-ua-probe`

## One-time add (then reopen forever)

TizenBrew → **Add GitHub** → enter exactly:

```text
mentalprosthetics/tizenbrew-ua-probe@master
```

Why `@master`: TB loads `cdn.jsdelivr.net/gh/.../package.json`. Unpinned path can stay on stale `1.0.0`/`app` for a long time (verified 2026-08-15) → flash via `127.0.0.1:8081`. Pinned `@master` gets current `mods` metadata.

**After this one add:** agents update `app/ua-lab.html` on GitHub, purge jsDelivr, you **re-open** the module (no re-type). Content URL is also pinned:

`https://cdn.jsdelivr.net/gh/mentalprosthetics/tizenbrew-ua-probe@master/app/ua-lab.html`

Host for TB service: **`127.0.0.1`** + hard restart.

## What ua-lab does (many methods at once)

- Large on-screen `navigator.userAgent` + PASS/FAIL vs `UE50MU7000` / Cobalt9
- Parallel: webhook.site Image + XHR + fetch + iframe
- Parallel: `https://httpbin.org/user-agent` XHR (echo JSON on screen if CORS allows)
- **No redirect away** — you can read the TV; agent reads webhook/httpbin if they fire

Webhook: `eeec2629-de1c-4f9f-b34e-6708a77c5c03`  
API: https://webhook.site/token/eeec2629-de1c-4f9f-b34e-6708a77c5c03/requests

## Other tools researched

| Tool | Role |
|---|---|
| TizenBrew UA Settings + `setUserAgentString` | Applies spoof; needs relaunch ([main.jsx](https://github.com/reisxd/TizenBrew/blob/main/tizenbrew-app/TizenBrew/tizenbrew-ui/src/main.jsx)) |
| httpbin.org/user-agent | Public UA echo JSON |
| webhook.site | Agent-pullable request log |
| TB CDP (`debugger.js`) | Can `Runtime.evaluate` UA when debug port up — needs Host=Demeter, not 127 |
| Samsung Internet | Baseline only — **not** TB module UA |
| TizenTube / Nuvio | Existing modules; not UA loggers |

See workspace note: `UA-PROBE-NOTE-2026-08-15.md`.
