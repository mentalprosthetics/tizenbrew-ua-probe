# tizenbrew-ua-probe

Temporary TizenBrew **app** module for RV LR UA spoof proof.

- **Canonical GitHub:** `mentalprosthetics/tizenbrew-ua-probe`
- **Do not use:** `niteowl099/tizenbrew-ua-probe` (old personal-root copy; Demeter remotes moved to org `mentalprosthetics`; same human user `niteowl099`)
- Shows `navigator.userAgent` on-screen, beacons webhook via `Image`/`fetch`, then soft-navigates (Tizen 3 often fails instant `location.replace`).

## Add in TizenBrew Module Manager

Repo / module id: `mentalprosthetics/tizenbrew-ua-probe`

Host for on-TV TB service: **`127.0.0.1`** (then manual hard restart). Demeter sdb fails while Host is 127 — expected.

Webhook token (this build): `eeec2629-de1c-4f9f-b34e-6708a77c5c03`  
Inspect: `https://webhook.site/#!/eeec2629-de1c-4f9f-b34e-6708a77c5c03`  
API: `https://webhook.site/token/eeec2629-de1c-4f9f-b34e-6708a77c5c03/requests`

**Pass:** webhook `User-Agent` (or on-screen string) contains `UE50MU7000` if spoof applied.  
**Fail / baseline-like:** Smart-TV / SamsungBrowser / Chrome/47 without that model token.
