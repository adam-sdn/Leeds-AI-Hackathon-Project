---
name: browserpod
description: Use for BrowserPod integration and local compute architecture.
---

BrowserPod is used for:
- privacy-first positioning
- local computation
- sandboxed execution

Rules:
- do not rely on BrowserPod for core UI
- app must work without it
- camera handled by browser API

Setup:
- API key via VITE_BP_APIKEY
- COOP + COEP headers required

Focus:
- keep integration simple
- fail gracefully