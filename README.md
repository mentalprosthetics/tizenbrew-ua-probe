# tizenbrew-ua-probe

Temporary TizenBrew module for RV LR UA spoof proof.

- **Canonical GitHub:** [`mentalprosthetics/tizenbrew-ua-probe`](https://github.com/mentalprosthetics/tizenbrew-ua-probe)
- **Do not use:** `niteowl099/tizenbrew-ua-probe` (MOVED stub only)

## Why `mods` + `websiteURL` (not `app` + local HTML)

From [TizenBrew MODULES.md](https://github.com/reisxd/TizenBrew/blob/main/docs/MODULES.md) and UI source:

- **`app` modules** navigate to `http://127.0.0.1:8081/module/<id>/<appPath>` (on-TV service). If that hop fails, the UI **flashes back** to TizenBrew — our HTML never runs (observed on LR).
- **`mods` modules** (same pattern as [TizenTube](https://github.com/reisxd/TizenTube)) set `websiteURL` to a remote HTTPS page. Opening the module loads that URL in the TB webview (UA Settings apply). Changing the remote page does **not** require re-adding if `websiteURL` is stable.

This build uses `packageType: "mods"` and `websiteURL` → webhook.site. The **HTTP request to open webhook is the UA evidence**.

## Add once in TizenBrew Module Manager

Module id: `mentalprosthetics/tizenbrew-ua-probe`

Host for on-TV TB service: **`127.0.0.1`** + manual hard restart (Demeter sdb fails — expected).

Webhook: `eeec2629-de1c-4f9f-b34e-6708a77c5c03`  
Inspect: https://webhook.site/#!/eeec2629-de1c-4f9f-b34e-6708a77c5c03  
API: https://webhook.site/token/eeec2629-de1c-4f9f-b34e-6708a77c5c03/requests

**Pass:** `User-Agent` contains `UE50MU7000`.  
**Fail:** Smart-TV / SamsungBrowser / Chrome/47 without that token (same class as Internet baseline).
