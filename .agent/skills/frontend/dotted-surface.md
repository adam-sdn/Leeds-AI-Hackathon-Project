---
name: dotted-surface
description: Reusable dotted surface background pattern for Kashf.ai light and dark themes.
---

# Dotted Surface

Use a layered CSS background instead of image assets:

```css
.app-shell {
  background:
    radial-gradient(circle at top left, var(--surface-glow), transparent 32rem),
    radial-gradient(circle, var(--surface-dot) 1px, transparent 1.4px),
    var(--bg);
  background-size: auto, 22px 22px, auto;
}
```

Theme tokens:

```css
[data-theme="dark"] {
  --bg: #020617;
  --surface-dot: rgba(147, 197, 253, 0.18);
  --surface-glow: rgba(96, 165, 250, 0.13);
}

[data-theme="light"] {
  --bg: #F3F7FC;
  --surface-dot: rgba(47, 111, 237, 0.18);
  --surface-glow: rgba(47, 111, 237, 0.10);
}
```

Guidance:
- Keep dot size subtle enough that clinical text remains readable.
- Pair with translucent cards or solid cards depending on information density.
- Avoid decorative orbs; use only the dot field and one broad ambient radial glow.
