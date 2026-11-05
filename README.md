# EVA Cockpit — DeepSeek Harness UI theme

A persistent Web-UI theme that turns the DeepSeek Harness desktop client into a
retro-futurist Evangelion / NERV cockpit.

- **Dark scheme — EVA-01 LCL cockpit:** near-black violet base, NERV-purple
  surfaces, acid-green (`#C6FF3D`) accents, hazard-orange details, scans and a
  frame HUD.
- **Light scheme — EVA-02 daylight:** warm peach ground, vivid Unit-02 red
  (`#E60012`) and orange (`#FF6A00`), dark ink text, `EVA-02 // MAGI 02` HUD
  labels and a 第二号機 annotation.
- **Typography:** Bahnschrift (DIN) for interface text, Share Tech Mono for code
  and readouts, Michroma for brand/display, Noto Serif SC for headings.
- **NERV identity:** the official NERV emblem (fan-use asset, see
  `THIRD_PARTY_LICENSES.md`), the `NERV` wordmark, MAGI labels and a full MAGI
  boot sequence.
- **Unit switch:** a `UNIT SWITCH` row in the sidebar above the Plugins item
  toggles between EVA-01 (dark purple/green) and EVA-02 (light red/orange).
- **Hero slogan:** the blank-session headline is replaced by `同步率，突破极限`
  in the dark cockpit and `第二号机，出击` in the light Unit-02 theme.
- **Chrome:** pointer-transparent scanlines, drifting hazard stripes, sweep,
  vignette, pulsing corner brackets, a vertical 特務機関ネルフ label, an
  animated sync meter/waveform and a SYNC/PATTERN readout under the composer.
- **Boot sequence:** on every full page load a NERV/MAGI splash draws a
  honeycomb grid that wakes cell by cell, a MAGI tri-panel (MELCHIOR-1 /
  BALTHASAR-2 / CASPER-3, ONLINE) with orange link lines, warning hexes, the
  sync-ratio counter and boot log, then fades out after ~2.5 s. Click or press
  any key to skip; `prefers-reduced-motion` turns it into a short static card.
- **Cyan neon tool calls:** every Tool call row carries a cyan hairline border,
  left glow bar, mono type and soft neon text — the `承認` style from the MAGI
  screens. Running rows pulse; error rows switch to a red edge.

The first activation seeds the dark cockpit scheme once per browser; later
Appearance choices are respected. Everything is disposed with the plugin.


## Build

`client.src.js` holds the source with font placeholders. Rebuild the shipped
`client.js` after editing:

```powershell
node build.mjs
```

## Uninstall

Disable or remove the `@local/eva-cockpit` bundle in Settings → Plugins; the
token layer, stylesheet and every slot entry are disposed together.

## Fonts

Michroma and Share Tech Mono are bundled as WOFF2 (Latin subset) under the SIL
Open Font License. See `fonts/OFL-*.txt` and `THIRD_PARTY_LICENSES.md`.
