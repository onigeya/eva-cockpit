/**
 * EVA cockpt Client half.
 *
 * Three layers, all disposable with the plugin:
 *  1. Palette — every semantic `--dsw-*` token plus the static ramp is folded
 *     into a theme override layer, so the whole shell recolors in both
 *     color schemes (dark = cockpit, light = title-card paper).
 *  2. Typography — Bahnschrift (DIN) for text, Share Tech Mono for code,
 *     Michroma for brand/display, Noto Serif SC for headings.
 *  3. Chrome — a pointer-transparent HUD frame in `shell.overlay`, a
 *     NERV-style badge in the sidebar/hero brand slots, and a sync readout
 *     under the composer.
 */
window.__ModuleLoader__.load({
  id: '@local/eva-cockpit',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    // Optional baseline module: the boot splash portals to <body> so a
    // transformed overlay ancestor can never offset or clip it.
    let createPortal = null
    try {
      const reactDom = require('react-dom')
      if (reactDom && typeof reactDom.createPortal === 'function') createPortal = reactDom.createPortal
    } catch (error) {
      console.error('eva-cockpit: react-dom is unavailable; boot stays in the overlay layer', error)
    }

    const MICHROMA = 'data:font/woff2;base64,__MICHROMA_B64__'
    const SHARE_TECH_MONO = 'data:font/woff2;base64,__SHARE_TECH_MONO_B64__'
    // Official NERV emblem (fan-use asset; © Khara / Gainax). Transparent PNG.
    const NERV_LOGO = 'data:image/png;base64,__NERV_LOGO_B64__'

    const TEXT_FONT = '"Bahnschrift", "Segoe UI Variable Text", "Segoe UI", "Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", sans-serif'
    const CODE_FONT = '"Share Tech Mono", "Cascadia Mono", "Cascadia Code", Consolas, "Microsoft YaHei", monospace'
    const BRAND_FONT = '"Michroma", "Bahnschrift SemiCondensed", "Bahnschrift", "Segoe UI", sans-serif'

    const TOKENS = {}
    const add = (name, light, dark) => { TOKENS[name] = { light, dark } }

    /* ------------------------------------------------------------------ *
     * Palette. Dark is the EVA-01 LCL cockpit; light is Unit-02 daylight
     * (bright red/orange on a warm peach ground).
     * ------------------------------------------------------------------ */
    const D = {
      bg: '#06050A',
      panel1: '#0B0812',
      panel2: '#100C19',
      panel3: '#171021',
      sidebar: '#0A0712',
      overlay: '#0D0A15',
      text: '#F3EEFF',
      text2: '#BDB2D3',
      text3: '#8D80A6',
      caption: '#6F6388',
      dimmed: '#4A3D5E',
      line1: 'rgba(180,150,255,0.10)',
      line2: 'rgba(180,150,255,0.18)',
      line3: 'rgba(180,150,255,0.28)',
      line4: 'rgba(198,255,61,0.26)',
      green: '#C6FF3D',
      greenHover: '#DCFF7E',
      greenInk: '#08060D',
      orange: '#FF8A1E',
      red: '#FF4358',
      amber: '#FFC24B',
      cyan: '#7DF9FF',
      violet: '#B79CFF',
      bubble: '#241435',
      bubbleHi: '#3A2154',
    }
    const L = {
      bg: '#FFF3E9',
      panel1: '#FFF8F1',
      panel2: '#FFEDDE',
      panel3: '#FFE4D2',
      sidebar: '#FBE3D3',
      overlay: '#FFF8F1',
      text: '#24110B',
      text2: '#5C2A1A',
      text3: '#8A4A31',
      caption: '#A5644A',
      dimmed: '#D8B6A4',
      line1: 'rgba(140,45,15,0.12)',
      line2: 'rgba(140,45,15,0.20)',
      line3: 'rgba(140,45,15,0.30)',
      line4: 'rgba(230,60,0,0.35)',
      brand: '#E60012',
      brandHover: '#FF3B1F',
      orange: '#FF6A00',
      red: '#C81E12',
      green: '#3F6B2A',
      amber: '#B45309',
      cyan: '#B23A00',
      violet: '#8A3B12',
      bubble: '#FFDCC6',
      bubbleHi: '#FFC7A6',
    }

    /* Base surfaces and borders. */
    add('--dsw-alias-bg-base', L.bg, D.bg)
    add('--dsw-alias-bg-document-preview', L.panel1, '#0A0710')
    add('--dsw-alias-bg-document-selection', 'rgba(230,60,0,0.18)', 'rgba(198,255,61,0.26)')
    add('--dsw-alias-label-document-preview', L.text2, '#CBBEDD')
    add('--dsw-alias-bg-layer-1', L.panel1, D.panel1)
    add('--dsw-alias-bg-layer-2', L.panel2, D.panel2)
    add('--dsw-alias-bg-layer-3', L.panel3, D.panel3)
    add('--dsw-alias-bg-mask-1', 'rgba(80,25,10,0.35)', 'rgba(0,0,0,0.55)')
    add('--dsw-alias-bg-mask-2', 'rgba(80,25,10,0.12)', 'rgba(0,0,0,0.25)')
    add('--dsw-alias-bg-mask-3', 'rgba(80,25,10,0.45)', 'rgba(0,0,0,0.58)')
    add('--dsw-alias-bg-mask-photo', 'rgba(0,0,0,0.82)', 'rgba(0,0,0,0.90)')
    add('--dsw-alias-bg-mask-drop', 'rgba(255,248,241,0.82)', 'rgba(18,12,28,0.72)')
    add('--dsw-alias-bg-module-platform', L.panel1, '#191128')
    add('--dsw-alias-bg-multi-select', L.panel2, '#1A1229')
    add('--dsw-alias-bg-overlay', L.overlay, D.overlay)
    add('--dsw-alias-bg-skeleton', 'rgba(140,45,15,0.06)', 'rgba(198,255,61,0.06)')
    add('--dsw-alias-border-inverted', 'rgba(36,17,11,0.05)', 'rgba(255,255,255,0.05)')
    add('--dsw-alias-border-inverted2', 'rgba(36,17,11,0.10)', 'rgba(255,255,255,0.08)')
    add('--dsw-alias-border-l1', L.line1, D.line1)
    add('--dsw-alias-border-l2-darkmode-thin', L.line1, 'rgba(180,150,255,0.14)')
    add('--dsw-alias-border-l2', L.line2, D.line2)
    add('--dsw-alias-border-l3', L.line3, D.line3)
    add('--dsw-alias-border-l4', L.line4, D.line4)

    /* Brand and buttons. */
    add('--dsw-alias-brand-primary-invert', L.panel3, '#0A0812')
    add('--dsw-alias-brand-primary-new-colorprimary-new-color', L.brand, D.green)
    add('--dsw-alias-brand-primary', L.brand, D.green)
    add('--dsw-alias-brand-text', L.text, D.text)
    add('--dsw-alias-button-contrast-fill', L.text, '#E9E2FF')
    add('--dsw-alias-button-elevated-fill', L.panel1, D.panel1)
    add('--dsw-alias-button-floating-fill', L.panel3, '#120D1C')
    add('--dsw-alias-button-floating-hover', L.panel1, '#1B1429')
    add('--dsw-alias-button-ghost-active-border', L.line3, '#8A6FB8')
    add('--dsw-alias-button-ghost-active-fill', L.panel1, '#241733')
    add('--dsw-alias-button-ghost-active-hover', L.panel2, '#2E1D42')
    add('--dsw-alias-button-info-fill', L.cyan, D.cyan)
    add('--dsw-alias-button-info-hover', '#0E8A98', '#A6FBFF')
    add('--dsw-alias-button-primary-dimmed', '#F2C3B0', '#2E3A1C')
    add('--dsw-alias-button-primary-fill', L.brand, D.green)
    add('--dsw-alias-button-primary-hover', L.brandHover, D.greenHover)
    add('--dsw-alias-button-tool-bar-fill-invisible', 'rgba(36,17,11,0.06)', 'rgba(5,3,10,0.42)')
    add('--dsw-alias-button-tool-bar-fill', 'rgba(60,45,75,0.18)', 'rgba(60,42,88,0.60)')
    add('--dsw-alias-button-tool-bar-hover', 'rgba(60,45,75,0.28)', 'rgba(70,50,100,0.70)')

    /* Interaction and labels. */
    add('--dsw-alias-interactive-bg-active', 'rgba(230,60,0,0.16)', 'rgba(198,255,61,0.18)')
    add('--dsw-alias-interactive-bg-hover-accent', 'rgba(230,60,0,0.13)', 'rgba(198,255,61,0.14)')
    add('--dsw-alias-interactive-bg-hover-danger', 'rgba(200,30,18,0.10)', 'rgba(255,59,78,0.14)')
    add('--dsw-alias-interactive-bg-hover-solid', L.panel1, '#161020')
    add('--dsw-alias-interactive-bg-hover', 'rgba(230,60,0,0.07)', 'rgba(198,255,61,0.07)')
    add('--dsw-alias-label-caption', L.caption, D.caption)
    add('--dsw-alias-label-deep-diving', L.red, D.green)
    add('--dsw-alias-label-deep-diving-shimmer', 'rgba(230,60,0,0.22)', 'rgba(198,255,61,0.35)')
    add('--dsw-alias-label-dimmed', L.dimmed, D.dimmed)
    add('--dsw-alias-label-primary-bluish', '#5C1E0C', '#E7DAFF')
    add('--dsw-alias-label-primary-dimmed', L.text, '#CBB6FF')
    add('--dsw-alias-label-primary-foreground', '#FFFDF7', D.greenInk)
    add('--dsw-alias-label-primary-inverted', '#FFFDF7', '#0A0812')
    add('--dsw-alias-label-primary', L.text, D.text)
    add('--dsw-alias-label-secondary', L.text2, D.text2)
    add('--dsw-alias-label-shimmer', 'rgba(230,60,0,0.20)', 'rgba(198,255,61,0.32)')
    add('--dsw-alias-label-tertiary', L.text3, D.text3)
    add('--dsw-alias-link', L.cyan, '#7DF9FF')
    add('--dsw-alias-menu-icon', L.text2, '#A697C4')

    /* Markdown. */
    add('--dsw-alias-markdown-citation', L.panel1, '#171021')
    add('--dsw-alias-markdown-code-block-banner', L.panel1, '#0F0A18')
    add('--dsw-alias-markdown-code-block', L.panel1, '#080611')
    add('--dsw-alias-markdown-code-segment-selected', L.panel2, '#221735')
    add('--dsw-alias-markdown-code-segment-unselected', L.panel1, '#14101F')
    add('--dsw-alias-markdown-inline-code', L.panel2, '#180F24')
    add('--dsw-alias-markdown-placeholder', L.panel2, '#171021')
    add('--dsw-alias-markdown-tag', L.panel2, '#1A1229')

    /* Scrollbars. */
    add('--dsw-alias-scrollbar-bg-l1', '#D8A17F', '#5A4A74')
    add('--dsw-alias-scrollbar-bg-l2', '#C78E6B', '#463A5C')
    add('--dsw-alias-scrollbar-hover-l1', '#B97A55', '#8A6FB8')
    add('--dsw-alias-scrollbar-hover-l2', '#A96845', '#A98FE0')
    add('--dsh-scrollbar-width', '6px', '6px')

    /* States. */
    add('--dsw-alias-state-business-primary', L.brand, D.green)
    add('--dsw-alias-state-business-tertiary', '#FFE0D0', '#263312')
    add('--dsw-alias-code-diff-added', 'rgba(47,122,31,0.12)', 'rgba(107,255,143,0.12)')
    add('--dsw-alias-code-diff-deleted', 'rgba(179,18,31,0.10)', 'rgba(255,67,88,0.12)')
    add('--dsw-alias-file-diff-added-bg', '#E4F2DD', '#0E1A10')
    add('--dsw-alias-file-diff-added-gutter', '#D8EBCF', '#0A140C')
    add('--dsw-alias-file-diff-added-marker', '#2F7A1F', '#6BFF8F')
    add('--dsw-alias-file-diff-deleted-bg', '#F8DEDA', '#1E0C10')
    add('--dsw-alias-file-diff-deleted-gutter', '#F2CEC8', '#16080B')
    add('--dsw-alias-file-diff-deleted-marker', '#B3121F', '#FF4358')
    add('--dsw-alias-state-error-primary', L.red, D.red)
    add('--dsw-alias-state-error-secondary', '#E0441C', '#FF7C8A')
    add('--dsw-alias-state-idle-primary', '#B08A78', '#5C4E72')
    add('--dsw-alias-state-success-primary', L.green, '#6BFF8F')
    add('--dsw-alias-state-success-secondary', '#5A7A1F', '#3BDB6E')
    add('--dsw-alias-state-success-tertiary', '#EAF0D0', '#12240F')
    add('--dsw-alias-state-warn-label', '#8A4A00', '#FFB020')
    add('--dsw-alias-state-warn-primary', L.amber, D.amber)
    add('--dsw-alias-state-warn-secondary', '#D98A2B', '#FFD98A')
    add('--dsw-alias-state-warn-tertiary', '#F7E7CC', '#2A1E08')
    add('--dsw-alias-switch-thumb', '#FFFDF7', '#B9A8D6')
    add('--dsw-alias-toast-bg', '#3A160C', '#1B1130')
    add('--dsw-alias-toast-label', '#FFF9EF', '#F7F1FF')
    add('--dsw-alias-tooltip-bg', '#3A160C', '#151022')
    add('--dsw-alias-tooltip-key-bg', '#552414', '#2A2040')
    add('--dsw-alias-turn-trigger-bg', '#FFEEDF', '#121020')
    add('--dsw-alias-turn-trigger-bg-hover', '#FFE2CC', '#1C1730')

    /* Specific surfaces. */
    add('--dsw-specific-bubble-highlight', L.bubbleHi, D.bubbleHi)
    add('--dsw-specific-bubble', L.bubble, D.bubble)
    add('--dsw-specific-input-major', '#FFF9F3', '#100B18')
    add('--dsw-specific-login-input', '#FFF3E8', '#0C0913')
    add('--dsw-menu-surface-fill', 'rgba(255,248,240,0.92)', 'rgba(11,8,16,0.86)')
    add('--dsw-alias-menu-group-header-fill', 'rgba(255,243,232,0.95)', 'rgba(16,11,25,0.95)')
    add('--dsw-specific-menu', 'rgba(255,248,240,0.94)', 'rgba(11,8,16,0.90)')
    add('--dsw-specific-selector', '#FFE3CF', '#1A1229')
    add('--dsw-specific-sidebar-fill', L.sidebar, D.sidebar)
    add('--dsw-specific-sidebar-nav-item-active-accent', '#F2C6AC', '#2E2145')
    add('--dsw-specific-sidebar-nav-item-active', '#FFD9C2', '#1F1630')
    add('--dsw-specific-sidebar-nav-item-hover', '#FFE4D3', '#161022')
    add('--dsw-specific-tip', '#FFEDDD', '#171021')

    /* Onboarding, settings cards and hover cards. */
    add('--dsw-alias-onboarding-accent', L.brand, D.green)
    add('--dsw-alias-onboarding-card-fill', 'rgba(255,248,241,0.88)', 'rgba(23,16,33,0.82)')
    add('--dsw-alias-onboarding-checkbox-border', L.line2, D.line2)
    add('--dsw-alias-onboarding-secondary-fill', L.panel2, D.panel2)
    add('--dsw-alias-settings-card-fill', L.panel2, D.panel1)
    add('--dsw-alias-settings-card-stroke', L.line2, D.line2)
    add('--dsw-gradient-onboarding-violet-stops',
      '#B3121F 33.102%, #FF6A00 50.954%, #FFD1A8 85.326%, #B3121F',
      '#4B2E83 33.102%, #8A5CFF 50.954%, #C6FF3D 85.326%, #4B2E83')
    add('--dsw-gradient-onboarding-blue-stops',
      '#C2410C 18.75%, #FF8C42 51.78%, #FFE0C2 86.252%, #C2410C',
      '#146874 18.75%, #39D6E2 51.78%, #C6FF3D 86.252%, #146874')
    add('--dsw-gradient-onboarding-cyan-stops',
      '#8A3A00 21.154%, #E07A1A 50.954%, #FFF1D6 85.326%, #8A3A00',
      '#0C4A54 21.154%, #7DF9FF 50.954%, #D8FF86 85.326%, #0C4A54')
    add('--dsw-hovercard-bg', L.panel1, D.panel1)

    /* Type scale roots and families. */
    add('--dsw-font-family', TEXT_FONT, TEXT_FONT)
    add('--ds-font-family-code', CODE_FONT, CODE_FONT)
    add('--dsw-font-family-brand', BRAND_FONT, BRAND_FONT)
    add('--dsh-font-family-text-default', TEXT_FONT, TEXT_FONT)
    add('--dsh-font-family-code-default', CODE_FONT, CODE_FONT)
    add('--dsh-font-family-text', TEXT_FONT, TEXT_FONT)
    add('--dsh-font-family-code', CODE_FONT, CODE_FONT)
    add('--dsh-font-family-terminal', CODE_FONT, CODE_FONT)

    /* Radius: mostly square, like a control panel. */
    add('--dsw-radius-xs', '1px', '1px')
    add('--dsw-radius-sm', '2px', '2px')
    add('--dsw-radius-md', '3px', '3px')
    add('--dsw-radius-lg', '4px', '4px')
    add('--dsw-radius-xl', '6px', '6px')
    add('--dsw-radius-panel', '8px', '8px')

    /* Elevation: violet-black drop shadows with a faint acid rim in the dark. */
    add('--dsw-shadow-lv1', '0 2px 6px rgba(80,25,10,0.10)', '0 2px 8px rgba(0,0,0,0.55)')
    add('--dsw-shadow-lv1-blur', '0 4px 14px rgba(80,25,10,0.06)', '0 4px 16px rgba(0,0,0,0.45)')
    add('--dsw-shadow-lv2', '0 4px 14px rgba(80,25,10,0.08), 0 2px 6px rgba(80,25,10,0.06)', '0 6px 20px rgba(0,0,0,0.50), 0 0 0 0.5px rgba(198,255,61,0.10)')
    add('--dsw-shadow-lv3', '0 0 1px rgba(80,25,10,0.25), 0 12px 32px rgba(80,25,10,0.10)', '0 0 1px rgba(198,255,61,0.35), 0 14px 40px rgba(0,0,0,0.62)')
    add('--dsw-elevation-stroke-color', L.line4, D.line4)
    add('--dsw-elevation-stroke', '0 0 0 0.5px var(--dsw-elevation-stroke-color)', '0 0 0 0.5px var(--dsw-elevation-stroke-color)')
    add('--dsw-elevation-panel', '0 0 0 0.5px var(--dsw-elevation-stroke-color), 0 4px 16px rgba(80,25,10,0.10)', '0 0 0 0.5px var(--dsw-elevation-stroke-color), 0 5px 20px rgba(0,0,0,0.55), 0 0 22px rgba(138,92,255,0.08)')
    add('--dsw-elevation-prominent', '0 0 0 0.5px var(--dsw-elevation-stroke-color), 0 4px 18px rgba(80,25,10,0.12)', '0 0 0 0.5px var(--dsw-elevation-stroke-color), 0 7px 26px rgba(0,0,0,0.60), 0 0 28px rgba(138,92,255,0.10)')
    add('--dsw-elevation-soft', '0 0 0 0.5px var(--dsw-elevation-stroke-color), 0 4px 18px rgba(80,25,10,0.08)', '0 0 0 0.5px var(--dsw-elevation-stroke-color), 0 4px 18px rgba(0,0,0,0.40), 0 0 24px rgba(198,255,61,0.05)')
    add('--dsw-menu-backdrop-filter', 'blur(26px) saturate(140%)', 'blur(26px) saturate(150%)')
    add('--dsw-mask-blur', 'none', 'none')
    add('--dsw-linear-gradient-think', 'linear-gradient(180deg, #FFE9D8 20.19%, rgba(255,233,216,0) 100%)', 'linear-gradient(180deg, #D9C9F7 20.19%, rgba(217,201,247,0) 100%)')
    add('--dsw-linear-think-select', 'linear-gradient(180deg, #FFD8BE 20.19%, rgba(255,216,190,0) 100%)', 'linear-gradient(180deg, #B79CFF 20.19%, rgba(183,156,255,0) 100%)')
    add('--dsw-focus-ring-color', L.brand, D.green)
    add('--dsw-focus-ring-width', '2px', '2px')

    /* Static ramps keep components that bypass aliases inside the same world. */
    const neutralB = {
      '00': ['#FFFFFF', '#FFFFFF'],
      '50': ['#FFF9F2', '#F4EEFF'],
      '60': ['#FFF4EA', '#EDE6F7'],
      '75': ['#FFEDE0', '#E2D9F0'],
      '100': ['#FFE3D1', '#D5C9E6'],
      '150': ['#F7D3BF', '#C6B7DA'],
      '200': ['#EAC2AC', '#B4A3C9'],
      '300': ['#D6A98F', '#9A88B3'],
      '400': ['#C08D73', '#8B79A2'],
      '500': ['#A9745A', '#7A698F'],
      '600': ['#8E5C44', '#68597D'],
      '700': ['#744830', '#56486A'],
      '750': ['#643C28', '#493D5C'],
      '800': ['#543020', '#3B314C'],
      '850': ['#45261A', '#2F263D'],
      '875': ['#3A2015', '#261E33'],
      '900': ['#2E190F', '#1D1628'],
      '950': ['#21110A', '#120D1C'],
      '1000': ['#1A0C07', '#08050E'],
    }
    for (const [step, [light, dark]] of Object.entries(neutralB)) {
      add(`--dsw-static-neutral-bluish-${step}`, light, dark)
    }
    const neutral = {
      '00': ['#FFFFFF', '#FFFFFF'],
      '50': ['#FFF9F3', '#F7F3EA'],
      '100': ['#FFF4EC', '#EFEADF'],
      '150': ['#FFEDE2', '#E5DFD3'],
      '200': ['#FFE4D6', '#D8D1C4'],
      '250': ['#F7D8C9', '#CBC3B5'],
      '300': ['#EBC9B8', '#B9B0A2'],
      '400': ['#C79A84', '#9E9587'],
      '500': ['#AC7A64', '#867D70'],
      '550': ['#96654F', '#736B5F'],
      '600': ['#82563F', '#625B50'],
      '700': ['#6A4330', '#4E4840'],
      '800': ['#543022', '#38332D'],
      '850': ['#45261A', '#2C2823'],
      '900': ['#351C11', '#1F1C19'],
      '1000': ['#1A0C07', '#0A0908'],
    }
    for (const [step, [light, dark]] of Object.entries(neutral)) {
      add(`--dsw-static-neutral-${step}`, light, dark)
    }
    const deepseek = {
      '50': ['#FFF0EA', '#1B2410'],
      '100': ['#FFE0D2', '#2A3618'],
      '200': ['#FFC4AC', '#3A4A20'],
      '300': ['#FF9E7A', '#5C752B'],
      '400': ['#FF6A3D', '#D6FF75'],
      '450': ['#F23A12', '#C6FF3D'],
      '500': ['#E60012', '#C6FF3D'],
      '600': ['#B8000E', '#9FC532'],
      '700-delete': ['#96000B', '#7FA82A'],
      '800': ['#750008', '#5A7A20'],
      '900': ['#4A0005', '#3B5217'],
    }
    for (const [step, [light, dark]] of Object.entries(deepseek)) {
      add(`--dsw-static-deepseek-${step}`, light, dark)
    }
    const blue = {
      '50': ['#FFF4E8', '#EAFEFF'],
      '50p': ['#FFEFDE', '#DDFCFF'],
      '75': ['#FFE9D2', '#D8FCFF'],
      '100': ['#FFDDBF', '#C3F8FD'],
      '300': ['#FFB37A', '#9AF4FA'],
      '400': ['#FF8C42', '#7DF9FF'],
      '450': ['#F26A1B', '#5FEAF2'],
      '500': ['#C2410C', '#39D6E2'],
      '600': ['#A3360A', '#2AAAB7'],
      '800': ['#7A2808', '#146874'],
      '900': ['#5A1D06', '#0C4A54'],
      '950': ['#3D1304', '#072F36'],
    }
    for (const [step, [light, dark]] of Object.entries(blue)) {
      add(`--dsw-static-blue-${step}`, light, dark)
    }
    const green = {
      '100': ['#EAF0D0', '#E6FFD9'],
      '400': ['#6E8B2F', '#3BDB6E'],
      '500': ['#4F6B1F', '#6BFF8F'],
      '500-a08': ['rgba(79,107,31,0.08)', 'rgba(107,255,143,0.08)'],
      '500-a12': ['rgba(79,107,31,0.12)', 'rgba(107,255,143,0.12)'],
      '900': ['#22300C', '#12240F'],
    }
    for (const [step, [light, dark]] of Object.entries(green)) {
      add(`--dsw-static-green-${step}`, light, dark)
    }
    const red = {
      '50': ['#FFF0EA', '#3A0A12'],
      '100': ['#FFDCD0', '#FFD9DD'],
      '400': ['#E44A24', '#FF7C8A'],
      '400-a12': ['rgba(228,74,36,0.12)', 'rgba(255,124,138,0.12)'],
      '500': ['#D32F0E', '#FF4358'],
      '600': ['#B3121F', '#FF2E44'],
      '600-a08': ['rgba(179,18,31,0.08)', 'rgba(255,46,68,0.08)'],
      '900': ['#4A0A08', '#3A0A12'],
    }
    for (const [step, [light, dark]] of Object.entries(red)) {
      add(`--dsw-static-red-${step}`, light, dark)
    }
    const amber = {
      '100': ['#FFF1D6', '#FFF1D6'],
      '400': ['#E08A1A', '#FFD98A'],
      '500': ['#B45309', '#FFC24B'],
      '600': ['#8A3A00', '#E09A2B'],
      '900': ['#3A2608', '#2A1E08'],
    }
    for (const [step, [light, dark]] of Object.entries(amber)) {
      add(`--dsw-static-amber-${step}`, light, dark)
    }

    /* ------------------------------------------------------------------ *
     * Stylesheet.
     * ------------------------------------------------------------------ */
    const CSS = `
@font-face{font-family:'Michroma';src:url("${MICHROMA}") format('woff2');font-weight:400;font-style:normal;font-display:swap;}
@font-face{font-family:'Share Tech Mono';src:url("${SHARE_TECH_MONO}") format('woff2');font-weight:400;font-style:normal;font-display:swap;}

::selection{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 28%,transparent);color:var(--dsw-alias-label-primary);}
body{-webkit-font-smoothing:antialiased;background-color:var(--dsw-alias-bg-base);background-image:radial-gradient(1100px 520px at 50% -8%,color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent),transparent 72%),linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 3%,transparent),transparent 28%);}
h1,h2,h3,h4{font-family:"Noto Serif SC","Source Han Serif SC","Yu Mincho","MS Mincho",serif!important;letter-spacing:.025em;}
code,pre,kbd,samp{font-family:var(--ds-font-family-code);}
:focus-visible{outline-color:var(--dsw-focus-ring-color,#C6FF3D);}

/* ---------- EVA hero slogan (replaces “探索未至之境”) ---------- */
[class*="_headline"] [class*="_titleGroup"] > span:first-child{font-size:0;line-height:0;}
[class*="_headline"] [class*="_titleGroup"] > span:first-child::after{
  content:'同步率，突破极限';display:inline-block;
  font-family:"Noto Serif SC","Source Han Serif SC","Yu Mincho",serif;
  font-size:26px;line-height:32px;font-weight:700;letter-spacing:.06em;
  color:var(--dsw-alias-label-primary);
  text-shadow:0 0 18px color-mix(in srgb,var(--dsw-alias-brand-primary) 30%,transparent),0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary) 18%,transparent);
}
body:not([data-ds-dark-theme]) [class*="_headline"] [class*="_titleGroup"] > span:first-child::after{content:'第二号机，出击';}

/* ---------- frame HUD ---------- */
.eva-hud{position:absolute;inset:0;overflow:hidden;pointer-events:none!important;z-index:0;--eva-line:rgba(140,45,15,.30);--eva-ink:rgba(90,35,20,.62);--eva-scan:rgba(90,35,20,.018);--eva-vig:rgba(90,35,20,.20);--eva-accent:#E64A00;--eva-dot:#E64A00;}
body[data-ds-dark-theme] .eva-hud{--eva-line:rgba(198,255,61,.38);--eva-ink:rgba(233,224,255,.52);--eva-scan:rgba(255,255,255,.026);--eva-vig:rgba(0,0,0,.62);--eva-accent:#C6FF3D;--eva-dot:#6BFF8F;}
.eva-hud *{pointer-events:none!important;}
.eva-hud__scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,var(--eva-scan) 0 1px,transparent 1px 3px);opacity:.85;mix-blend-mode:soft-light;animation:eva-scan 9s linear infinite;}
.eva-hud__vignette{position:absolute;inset:0;background:radial-gradient(125% 92% at 50% 48%,transparent 56%,var(--eva-vig) 100%);}
.eva-hud__circuits{position:absolute;inset:0;width:100%;height:100%;opacity:.55;}
.eva-circuit{fill:none;stroke:var(--eva-line);stroke-width:1;}
.eva-circuit-node{fill:var(--eva-dot);opacity:.55;}
.eva-crosshair{fill:none;stroke:var(--eva-line);stroke-width:1;}
.eva-hud__sweep{position:absolute;left:0;right:0;top:-90px;height:90px;background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--eva-accent) 8%,transparent),transparent);animation:eva-sweep 12s linear infinite;}
.eva-hud__hazard{position:absolute;left:0;right:0;height:3px;background:repeating-linear-gradient(135deg,#FF8A1E 0 10px,#08060D 10px 20px);background-size:40px 3px;opacity:.78;animation:eva-hazard 18s linear infinite;}
.eva-hud__hazard--top{top:0;}
.eva-hud__hazard--bottom{bottom:0;height:2px;opacity:.45;}
.eva-hud__corner{position:absolute;width:26px;height:26px;border:0 solid var(--eva-line);animation:eva-corner 3.8s ease-in-out infinite;}
.eva-hud__corner--tl{top:10px;left:10px;border-top-width:1.5px;border-left-width:1.5px;}
.eva-hud__corner--tr{top:10px;right:10px;border-top-width:1.5px;border-right-width:1.5px;animation-delay:.9s;}
.eva-hud__corner--bl{bottom:10px;left:10px;border-bottom-width:1.5px;border-left-width:1.5px;animation-delay:1.8s;}
.eva-hud__corner--br{bottom:10px;right:10px;border-bottom-width:1.5px;border-right-width:1.5px;animation-delay:2.7s;}
.eva-hud__tag{position:absolute;font:400 9px/1 'Michroma','Bahnschrift',sans-serif;letter-spacing:.22em;color:var(--eva-ink);text-transform:uppercase;white-space:nowrap;text-shadow:0 0 10px rgba(0,0,0,.35);}
.eva-hud__tag--br{bottom:13px;right:42px;}
.eva-hud__beacon{display:inline-block;width:5px;height:5px;margin-right:7px;background:var(--eva-dot);box-shadow:0 0 7px var(--eva-dot);animation:eva-pulse 2.6s ease-in-out infinite;vertical-align:1px;}
.eva-hud__vertical{position:absolute;top:50%;right:7px;transform:translateY(-50%);writing-mode:vertical-rl;font:400 10px/1.2 "Yu Gothic","MS Gothic","Microsoft YaHei",sans-serif;letter-spacing:.46em;color:var(--eva-ink);opacity:.62;text-shadow:0 0 8px rgba(0,0,0,.4);animation:eva-flicker 11s steps(1) infinite;}
.eva-hud__midline{position:absolute;left:50%;top:0;bottom:0;width:1px;background:linear-gradient(180deg,transparent,var(--eva-line) 18%,var(--eva-line) 82%,transparent);opacity:.35;}

    /* MAGI tri-readout: kept out of the sidebar's bottom-left user card. */
    .eva-hud__magi-cluster{display:none;}
    .eva-unit-light{display:inline;}
    .eva-unit-dark{display:none;}
    body[data-ds-dark-theme] .eva-unit-light{display:none;}
    body[data-ds-dark-theme] .eva-unit-dark{display:inline;}
.eva-hud__magi{display:flex;gap:10px;align-items:flex-end;}
.eva-magi__col{display:flex;flex-direction:column;gap:3px;width:38px;}
.eva-magi__label{font:400 6.5px/1 'Michroma','Bahnschrift',sans-serif;letter-spacing:.08em;color:var(--eva-ink);opacity:.8;white-space:nowrap;}
.eva-magi__bar{display:block;height:3px;background:rgba(198,255,61,.12);overflow:hidden;}
.eva-magi__bar i{display:block;width:100%;height:100%;background:var(--eva-accent);transform-origin:left center;animation:eva-magi 2.6s ease-in-out infinite;}

/* ---------- sidebar / hero brand ---------- */
.eva-mark{display:block;filter:drop-shadow(0 0 8px rgba(255,138,30,.30));animation:eva-brand-glow 5s ease-in-out infinite;}
.eva-hero-mark{display:block;filter:drop-shadow(0 0 16px rgba(255,138,30,.34));animation:eva-brand-glow 5s ease-in-out infinite;}
.eva-brand{display:inline-flex;flex-direction:column;justify-content:center;gap:2px;line-height:1;transform:translateY(-1px);}
.eva-brand__name{font-family:'Michroma','Bahnschrift',sans-serif;font-size:11px;letter-spacing:.30em;color:var(--dsw-alias-label-primary);}
.eva-brand__sub{font-family:'Share Tech Mono','Cascadia Mono',monospace;font-size:7px;letter-spacing:.14em;color:var(--dsw-alias-label-caption);opacity:.9;white-space:nowrap;}

/* ---------- composer sync readout ---------- */
.eva-dock{display:flex;align-items:center;justify-content:center;gap:9px;height:18px;margin:3px auto 5px;max-width:min(720px,92vw);overflow:hidden;white-space:nowrap;pointer-events:none!important;user-select:none;font:400 9px/1 'Share Tech Mono','Cascadia Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:var(--dsw-alias-label-caption);--eva-dock-accent:#C2410C;}
body[data-ds-dark-theme] .eva-dock{--eva-dock-accent:#C6FF3D;}
.eva-dock *{pointer-events:none!important;}
.eva-dock__dot{width:5px;height:5px;flex:none;background:var(--eva-dock-accent);box-shadow:0 0 6px var(--eva-dock-accent);animation:eva-pulse 2.6s ease-in-out infinite;}
.eva-dock__sep{opacity:.35;}
.eva-dock__meter{width:74px;height:4px;flex:none;background:linear-gradient(90deg,var(--eva-dock-accent) 0 78%,color-mix(in srgb,var(--eva-dock-accent) 16%,transparent) 78% 100%);background-size:200% 100%;box-shadow:0 0 7px color-mix(in srgb,var(--eva-dock-accent) 40%,transparent);animation:eva-meter 3.6s linear infinite;}
.eva-dock__label{color:var(--dsw-alias-label-secondary);}
.eva-dock__wave{display:inline-flex;align-items:flex-end;gap:2px;height:8px;margin-left:2px;}
.eva-dock__wave i{display:block;width:2px;height:100%;background:var(--eva-dock-accent);transform-origin:bottom;animation:eva-eq 1.4s ease-in-out infinite;}
.eva-dock__wave i:nth-child(2){animation-delay:.16s}
.eva-dock__wave i:nth-child(3){animation-delay:.32s}
.eva-dock__wave i:nth-child(4){animation-delay:.48s}
.eva-dock__wave i:nth-child(5){animation-delay:.64s}

/* ---------- NERV boot sequence ---------- */
.eva-boot{position:fixed;inset:0;z-index:9000;display:block;overflow:hidden;cursor:pointer;color:#C6FF3D;font-family:'Share Tech Mono','Cascadia Mono',monospace;background:
 radial-gradient(900px 620px at 50% 44%,rgba(75,46,131,.30),transparent 66%),
 repeating-linear-gradient(60deg,rgba(198,255,61,.028) 0 1px,transparent 1px 44px),
 repeating-linear-gradient(-60deg,rgba(198,255,61,.022) 0 1px,transparent 1px 44px),
 #040307;animation:eva-boot-in .32s ease both;}
.eva-boot--exit{animation:eva-boot-out .62s ease forwards;pointer-events:none;}
.eva-boot__scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 3px);mix-blend-mode:soft-light;animation:eva-scan 7s linear infinite;}
.eva-boot__vignette{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 50%,transparent 55%,rgba(0,0,0,.72) 100%);}
/* neuron network + honeycomb wake-up */
.eva-boot__hexes,.eva-boot__neural{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;}
.eva-hex{fill:rgba(198,255,61,0);stroke:rgba(198,255,61,.10);stroke-width:1;opacity:0;animation:eva-hex 2.8s ease forwards;animation-delay:var(--d);}
.eva-hex--warm{stroke:rgba(255,138,30,.16);}
@keyframes eva-hex{0%{opacity:0;fill:rgba(198,255,61,0)}30%{opacity:.9;fill:rgba(198,255,61,.10)}100%{opacity:.28;fill:rgba(198,255,61,.02)}}
@keyframes eva-warn{0%,100%{opacity:.2}50%{opacity:.9}}

/* MAGI tri-panel + warning hexes */
.eva-boot__warnings{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;}
.eva-warn{animation:eva-warn 3.6s steps(1) infinite;}
.eva-warn__hex{fill:rgba(255,59,78,.05);stroke:#FF3B4E;stroke-width:1;}
.eva-warn--red .eva-warn__hex{fill:rgba(255,59,78,.16);}
.eva-warn__text{fill:#FF3B4E;font-family:'Share Tech Mono','Cascadia Mono',monospace;font-size:8px;letter-spacing:.12em;text-transform:uppercase;}
.eva-boot__magi-title{font-family:'Michroma','Bahnschrift',sans-serif;font-size:10px;letter-spacing:.28em;color:rgba(243,238,255,.62);text-transform:uppercase;}
.eva-magi-panel{width:min(420px,78vw);height:auto;overflow:visible;}
.eva-magi-link{stroke:rgba(255,138,30,.35);stroke-width:1;stroke-dasharray:4 4;}
.eva-magi-node__frame{fill:rgba(8,6,12,.72);stroke:#C6FF3D;stroke-width:1.6;}
.eva-magi-node--warm .eva-magi-node__frame{stroke:#FF8A1E;}
.eva-magi-node--green .eva-magi-node__frame{stroke:#C6FF3D;}
.eva-magi-node__label{fill:#F3EEFF;font-family:'Share Tech Mono','Cascadia Mono',monospace;font-size:10px;letter-spacing:.10em;}
.eva-magi-node__status{fill:#C6FF3D;font-family:'Share Tech Mono','Cascadia Mono',monospace;font-size:7px;letter-spacing:.22em;animation:eva-pulse 2.4s ease-in-out infinite;}
.eva-magi-core__frame{fill:none;stroke:rgba(255,138,30,.8);stroke-width:1.2;}
.eva-magi-core__text{fill:#FF8A1E;font-family:'Michroma','Bahnschrift',sans-serif;font-size:9px;letter-spacing:.18em;}
.eva-boot__hazard{position:absolute;left:0;right:0;height:4px;background:repeating-linear-gradient(135deg,#FF8A1E 0 12px,#050307 12px 24px);background-size:48px 4px;opacity:.9;animation:eva-hazard 12s linear infinite;}
.eva-boot__hazard--top{top:0;}
.eva-boot__hazard--bottom{bottom:0;}
.eva-boot__topline,.eva-boot__bottomline{position:absolute;left:24px;right:24px;display:flex;justify-content:space-between;font-size:9px;letter-spacing:.28em;color:rgba(198,255,61,.65);text-transform:uppercase;}
.eva-boot__topline{top:54px;}
.eva-boot__bottomline{bottom:18px;}
.eva-boot__emergency{color:#FF3B4E;animation:eva-blink 1s steps(1) infinite;}
.eva-boot__inner{position:absolute;left:50vw;top:50vh;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:9px;width:max-content;max-width:92vw;}
.eva-boot__emblem{width:150px;height:150px;padding:8px;border-radius:50%;background:radial-gradient(circle,#040307 54%,rgba(4,3,7,0) 72%);filter:drop-shadow(0 0 24px rgba(255,138,30,.38));animation:eva-emblem-in .9s cubic-bezier(.2,.9,.2,1) both;}
.eva-boot__ring{transform-origin:60px 60px;animation:eva-spin 9s linear infinite;}
.eva-boot__word{font-family:'Michroma','Bahnschrift',sans-serif;font-size:clamp(36px,5vw,56px);letter-spacing:.36em;margin-left:.36em;color:#F3EEFF;text-shadow:2px 0 rgba(255,59,78,.55),-2px 0 rgba(125,249,255,.45),0 0 26px rgba(198,255,61,.25);animation:eva-glitch 4.6s steps(1) infinite;}
.eva-boot__jp{font-family:"Yu Gothic","MS Gothic",sans-serif;font-size:10px;letter-spacing:.6em;color:#FF8A1E;text-transform:uppercase;}
.eva-boot__sub{font-size:9px;letter-spacing:.32em;color:rgba(243,238,255,.55);text-transform:uppercase;text-align:center;}
.eva-boot__bar{position:relative;width:min(360px,64vw);height:9px;border:1px solid rgba(198,255,61,.55);padding:2px;background:rgba(198,255,61,.05);box-shadow:0 0 18px rgba(198,255,61,.12);}
.eva-boot__fill{height:100%;background:linear-gradient(90deg,#C6FF3D,#7DF9FF);box-shadow:0 0 12px rgba(198,255,61,.65);transition:width .08s linear;}
.eva-boot__meta{display:flex;justify-content:space-between;align-items:center;width:min(360px,64vw);font-size:9px;letter-spacing:.18em;color:rgba(198,255,61,.7);}
.eva-boot__percent{font-family:'Michroma',sans-serif;font-size:18px;letter-spacing:.16em;color:#C6FF3D;text-shadow:0 0 14px rgba(198,255,61,.6);}
.eva-boot__log{display:flex;flex-direction:column;gap:2px;width:min(360px,64vw);font-size:9px;line-height:1.45;letter-spacing:.08em;color:rgba(198,255,61,.8);}
.eva-boot__log span{opacity:0;animation:eva-line-in .28s ease forwards;}
.eva-boot__diag{font-size:8px;letter-spacing:.18em;color:rgba(198,255,61,.45);text-transform:uppercase;}
.eva-boot__diag--top{position:absolute;top:76px;left:24px;right:24px;text-align:center;}

/* ---------- unit switch (sidebar, above the plugin row) ---------- */
nav[class*="_panelList"]{margin-top:36px;}
.eva-unit-switch{position:absolute;left:12px;top:calc(var(--dsh-windows-titlebar-height,0px) + 104px);width:calc(var(--dsh-windows-sidebar-width,280px) - 24px);box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:6px 8px;border:1px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:400 9px/1.2 'Share Tech Mono','Cascadia Mono',monospace;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;pointer-events:auto!important;z-index:40;}
.eva-unit-switch:hover{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 12px color-mix(in srgb,var(--dsw-alias-brand-primary) 30%,transparent);}
.eva-unit-switch:focus-visible{outline:2px solid var(--dsw-focus-ring-color,#C6FF3D);outline-offset:2px;}
.eva-unit-switch__track{position:relative;width:28px;height:14px;flex:none;border:1px solid var(--dsw-alias-border-l4);border-radius:999px;background:var(--dsw-alias-interactive-bg-hover-solid);}
.eva-unit-switch__thumb{position:absolute;top:2px;left:16px;width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-brand-primary);box-shadow:0 0 6px var(--dsw-alias-brand-primary);transition:left .2s ease;}
body[data-ds-dark-theme] .eva-unit-switch__thumb{left:2px;}
[data-sidebar-collapsed] nav[class*="_panelList"]{margin-top:0;}
html[data-platform='darwin'] .eva-unit-switch{top:calc(48px + 104px);}
.eva-unit-switch__copy{display:flex;flex-direction:column;gap:2px;min-width:0;}
.eva-unit-switch__title{font-size:7px;letter-spacing:.22em;color:var(--dsw-alias-label-caption);}
.eva-unit-switch__unit{font-family:'Michroma','Bahnschrift',sans-serif;font-size:9px;letter-spacing:.14em;color:var(--dsw-alias-label-primary);white-space:nowrap;}
[data-sidebar-collapsed] .eva-unit-switch{display:none;}

/* ---------- cyan neon tool calls ---------- */
[data-tool][data-state]{position:relative;margin:3px 0;padding:2px 8px;border:1px solid rgba(125,249,255,.30);border-left:2px solid #7DF9FF;border-radius:3px;background:linear-gradient(90deg,rgba(125,249,255,.055),rgba(125,249,255,.015) 60%,transparent);box-shadow:0 0 12px rgba(125,249,255,.14),inset 0 0 14px rgba(125,249,255,.035);color:#9FFBFF;font-family:'Share Tech Mono','Cascadia Mono',monospace;letter-spacing:.015em;}
[data-tool][data-state] [data-disclosure-header]{color:#9FFBFF;}
[data-tool][data-state] [data-disclosure-header] *{color:#9FFBFF!important;text-shadow:0 0 6px rgba(125,249,255,.45);}
[data-tool][data-state] [data-disclosure-header] svg{filter:drop-shadow(0 0 5px rgba(125,249,255,.55));}
[data-tool][data-state="running"]{animation:eva-tool-pulse 2.2s ease-in-out infinite;}
[data-tool][data-state="error"]{border-color:rgba(255,59,78,.45);border-left-color:#FF3B4E;box-shadow:0 0 12px rgba(255,59,78,.16),inset 0 0 14px rgba(255,59,78,.04);}
body:not([data-ds-dark-theme]) [data-tool][data-state]{border-color:rgba(14,116,144,.35);border-left-color:#0E7490;background:linear-gradient(90deg,rgba(14,116,144,.055),rgba(14,116,144,.012) 60%,transparent);box-shadow:0 0 10px rgba(14,116,144,.14),inset 0 0 12px rgba(14,116,144,.03);color:#0E7490;}
body:not([data-ds-dark-theme]) [data-tool][data-state] [data-disclosure-header] *{color:#0E7490!important;text-shadow:0 0 5px rgba(14,116,144,.25);}
body:not([data-ds-dark-theme]) [data-tool][data-state] [data-disclosure-header] svg{filter:drop-shadow(0 0 4px rgba(14,116,144,.35));}
body:not([data-ds-dark-theme]) [data-tool][data-state="error"]{border-color:rgba(179,18,31,.45);border-left-color:#B3121F;box-shadow:0 0 10px rgba(179,18,31,.14),inset 0 0 12px rgba(179,18,31,.03);}

/* Step-process group summary (the collapsed "已读取文件，已搜索代码…" row). */
[data-process-activity]{width:100%;box-sizing:border-box;margin:3px 0;padding:4px 10px;border:1px solid rgba(125,249,255,.30);border-left:2px solid #7DF9FF;border-radius:3px;background:linear-gradient(90deg,rgba(125,249,255,.055),rgba(125,249,255,.012) 60%,transparent);box-shadow:0 0 12px rgba(125,249,255,.14),inset 0 0 14px rgba(125,249,255,.035);color:#9FFBFF;font-family:'Share Tech Mono','Cascadia Mono',monospace;letter-spacing:.015em;text-align:left;}
[data-process-activity] *{color:#9FFBFF!important;text-shadow:0 0 6px rgba(125,249,255,.45);}
[data-process-activity] svg{filter:drop-shadow(0 0 5px rgba(125,249,255,.55));}
[data-process-activity]:hover{border-color:rgba(125,249,255,.6);box-shadow:0 0 20px rgba(125,249,255,.28),inset 0 0 16px rgba(125,249,255,.05);}
body:not([data-ds-dark-theme]) [data-process-activity]{border-color:rgba(14,116,144,.35);border-left-color:#0E7490;background:linear-gradient(90deg,rgba(14,116,144,.055),rgba(14,116,144,.012) 60%,transparent);box-shadow:0 0 10px rgba(14,116,144,.14),inset 0 0 12px rgba(14,116,144,.03);color:#0E7490;}
body:not([data-ds-dark-theme]) [data-process-activity] *{color:#0E7490!important;text-shadow:0 0 5px rgba(14,116,144,.25);}
body:not([data-ds-dark-theme]) [data-process-activity] svg{filter:drop-shadow(0 0 4px rgba(14,116,144,.35));}

/* Turn changed-files card. */
[data-changed-files]{border:1px solid rgba(125,249,255,.28);border-left:2px solid #7DF9FF;border-radius:4px;background:linear-gradient(90deg,rgba(125,249,255,.05),rgba(125,249,255,.012) 60%,transparent);box-shadow:0 0 12px rgba(125,249,255,.12),inset 0 0 12px rgba(125,249,255,.03);font-family:'Share Tech Mono','Cascadia Mono',monospace;}
[data-changed-files] [class*="_title"],[data-changed-files] [class*="_path"]{color:#9FFBFF!important;text-shadow:0 0 6px rgba(125,249,255,.4);}
body:not([data-ds-dark-theme]) [data-changed-files]{border-color:rgba(14,116,144,.32);border-left-color:#0E7490;background:linear-gradient(90deg,rgba(14,116,144,.05),rgba(14,116,144,.012) 60%,transparent);box-shadow:0 0 10px rgba(14,116,144,.12),inset 0 0 12px rgba(14,116,144,.03);}
body:not([data-ds-dark-theme]) [data-changed-files] [class*="_title"],body:not([data-ds-dark-theme]) [data-changed-files] [class*="_path"]{color:#0E7490!important;text-shadow:0 0 5px rgba(14,116,144,.25);}

/* Live running status: single real text layer; host shimmer ghost is suppressed. */
[data-chat-running] [data-shimmer]{color:#9FFBFF;font-family:'Share Tech Mono','Cascadia Mono',monospace;letter-spacing:.02em;}
[data-chat-running] [data-shimmer] [class*="_decoration"]{display:none!important;}
[data-chat-running] [data-shimmer] [data-shimmer-text]{color:inherit!important;}
[data-chat-running] [data-shimmer] [class*="_text"]:not([data-shimmer-text]){position:relative;display:inline-block;white-space:nowrap;color:#9FFBFF!important;text-shadow:0 0 7px rgba(125,249,255,.5);animation:eva-fragment 3.4s steps(1) infinite;will-change:clip-path,transform;}
[data-chat-running] [data-shimmer]::after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,transparent 48%,rgba(125,249,255,.38) 50%,transparent 52%);mix-blend-mode:screen;animation:eva-scan-shift 2.4s linear infinite;}
[data-chat-running] [class*="_runningDivider"]{background:#7DF9FF;box-shadow:0 0 6px #7DF9FF;}
[data-chat-running] svg{filter:drop-shadow(0 0 4px rgba(125,249,255,.55));}
@keyframes eva-scan-shift{from{transform:translateY(-110%)}to{transform:translateY(110%)}}
@keyframes eva-fragment{
  0%,72%,100%{clip-path:none;transform:none;text-shadow:0 0 7px rgba(125,249,255,.5)}
  73%{clip-path:inset(8% 0 62% 0);transform:translate(2px,-1px);text-shadow:-2px 0 #FF3B4E,2px 0 #7DF9FF}
  74%{clip-path:inset(46% 0 18% 0);transform:translate(-2px,1px);text-shadow:2px 0 #FF3B4E,-2px 0 #7DF9FF}
  75%{clip-path:none;transform:none;text-shadow:0 0 7px rgba(125,249,255,.5)}
  88%{clip-path:inset(20% 0 45% 0);transform:translate(1px,0)}
  89%{clip-path:inset(58% 0 6% 0);transform:translate(-1px,0)}
  90%{clip-path:none;transform:none}
}
body:not([data-ds-dark-theme]) [data-chat-running] [data-shimmer]{color:#0E7490;}
body:not([data-ds-dark-theme]) [data-chat-running] [data-shimmer] [class*="_text"]:not([data-shimmer-text]){color:#0E7490!important;text-shadow:0 0 5px rgba(14,116,144,.25);}
body:not([data-ds-dark-theme]) [data-chat-running] [data-shimmer]::after{background:linear-gradient(180deg,transparent 48%,rgba(14,116,144,.4) 50%,transparent 52%);}
body:not([data-ds-dark-theme]) [data-chat-running] [class*="_runningDivider"]{background:#0E7490;box-shadow:0 0 5px rgba(14,116,144,.4);}
@keyframes eva-tool-pulse{0%,100%{box-shadow:0 0 12px rgba(125,249,255,.14),inset 0 0 14px rgba(125,249,255,.035)}50%{box-shadow:0 0 22px rgba(125,249,255,.30),inset 0 0 18px rgba(125,249,255,.06)}}
.eva-boot__hint{position:absolute;bottom:36px;left:50%;transform:translateX(-50%);font-size:9px;letter-spacing:.28em;color:rgba(243,238,255,.4);text-transform:uppercase;animation:eva-pulse 2.4s ease-in-out infinite;}

@keyframes eva-scan{from{background-position:0 0}to{background-position:0 12px}}
@keyframes eva-sweep{0%{top:-100px}100%{top:108%}}
@keyframes eva-hazard{to{background-position:48px 0}}
@keyframes eva-pulse{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes eva-corner{0%,100%{opacity:.45}50%{opacity:.95}}
@keyframes eva-flicker{0%,90%,100%{opacity:.62}91%{opacity:.18}92%{opacity:.7}93%{opacity:.22}94%{opacity:.62}}
@keyframes eva-magi{0%,100%{transform:scaleX(.22)}50%{transform:scaleX(1)}}
@keyframes eva-meter{to{background-position:-200% 0}}
@keyframes eva-eq{0%,100%{transform:scaleY(.22)}50%{transform:scaleY(1)}}
@keyframes eva-brand-glow{0%,100%{filter:drop-shadow(0 0 6px rgba(255,138,30,.24))}50%{filter:drop-shadow(0 0 14px rgba(255,138,30,.55))}}
@keyframes eva-boot-in{from{opacity:0}to{opacity:1}}
@keyframes eva-boot-out{to{opacity:0;visibility:hidden}}
@keyframes eva-emblem-in{from{opacity:0;transform:scale(.82) rotate(-8deg)}to{opacity:1;transform:none}}
@keyframes eva-spin{to{transform:rotate(360deg)}}
@keyframes eva-glitch{0%,88%,100%{transform:translate(0);text-shadow:2px 0 rgba(255,59,78,.55),-2px 0 rgba(125,249,255,.45)}89%{transform:translate(-2px,1px);text-shadow:3px 0 rgba(255,59,78,.8),-3px 0 rgba(125,249,255,.8)}90%{transform:translate(2px,-1px);text-shadow:-2px 0 rgba(255,59,78,.8),2px 0 rgba(125,249,255,.8)}91%{transform:translate(0);text-shadow:2px 0 rgba(255,59,78,.55),-2px 0 rgba(125,249,255,.45)}}
@keyframes eva-line-in{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
@keyframes eva-blink{0%,49%{opacity:1}50%,100%{opacity:.15}}
@media (prefers-reduced-motion:reduce){
 .eva-hud__scan,.eva-hud__sweep,.eva-hud__hazard,.eva-hud__corner,.eva-hud__vertical,.eva-hud__beacon,.eva-dock__dot,.eva-dock__meter,.eva-dock__wave i,.eva-mark,.eva-hero-mark,.eva-magi__bar i,.eva-boot__ring,.eva-boot__word,.eva-boot__emergency,.eva-boot__hint,.eva-boot__log span,.eva-boot__emblem,.eva-boot,.eva-hex,.eva-warn,.eva-magi-node__status{animation:none!important}
 .eva-boot__log span{opacity:1}
 .eva-hud__scan{opacity:.5}
 .eva-hex{opacity:.24}
 .eva-warn{opacity:.6}
 [data-tool][data-state="running"]{animation:none!important}
 [data-chat-running] [data-shimmer] [class*="_text"], [data-chat-running] [data-shimmer]::after{animation:none!important}
}
`

    /* ------------------------------------------------------------------ *
     * Components.
     * ------------------------------------------------------------------ */
    function EvaMark(props) {
      const size = props && typeof props.size === 'number' ? props.size : 24
      return h('img', {
        src: NERV_LOGO, width: size, height: size, className: 'eva-mark', alt: '', draggable: 'false',
      })
    }

    function NervEmblem(props) {
      const size = props && typeof props.size === 'number' ? props.size : 130
      return h('img', {
        src: NERV_LOGO, width: size, height: size,
        className: props && props.className ? props.className : 'eva-boot__emblem', alt: '', draggable: 'false',
      })
    }

    function EvaHeroMark(props) {
      const size = props && typeof props.size === 'number' ? props.size : 34
      const base = EvaMark({ size })
      return h('span', { className: 'eva-hero-mark-wrap', 'aria-hidden': 'true' },
        React.cloneElement(base, { className: 'eva-hero-mark' }))
    }

    function EvaBrandName() {
      return h('span', { className: 'eva-brand' },
        h('span', { className: 'eva-brand__name' }, 'NERV'),
        h('span', { className: 'eva-brand__sub' }, 'DEEPSEEK // MAGI SYSTEM'))
    }

    function EvaDockStatus() {
      return h('div', { className: 'eva-dock', 'aria-hidden': 'true' },
        h('span', { className: 'eva-dock__dot' }),
        h('span', { className: 'eva-dock__label' }, 'SYNC 100.0%'),
        h('span', { className: 'eva-dock__sep' }, '/'),
        h('span', null, 'PATTERN: BLUE'),
        h('span', { className: 'eva-dock__sep' }, '/'),
        h('span', null, 'A.T. FIELD ACTIVE'),
        h('span', { className: 'eva-dock__sep' }, '/'),
        h('span', null, 'MAGI 3/3'),
        h('span', { className: 'eva-dock__meter' }),
        h('span', { className: 'eva-dock__wave' }, [0, 1, 2, 3, 4].map(index => h('i', { key: index }))))
    }

    const MAGI = [['MELCHIOR', 0], ['BALTHASAR', 1], ['CASPER', 2]]

    function EvaOverlay() {
      return h('div', { className: 'eva-hud', 'aria-hidden': 'true' },
        h(NervCircuits),
        h('div', { className: 'eva-hud__scan' }),
        h('div', { className: 'eva-hud__vignette' }),
        h('div', { className: 'eva-hud__sweep' }),
        h('div', { className: 'eva-hud__hazard eva-hud__hazard--top' }),
        h('div', { className: 'eva-hud__hazard eva-hud__hazard--bottom' }),
        h('div', { className: 'eva-hud__corner eva-hud__corner--tl' }),
        h('div', { className: 'eva-hud__corner eva-hud__corner--tr' }),
        h('div', { className: 'eva-hud__corner eva-hud__corner--bl' }),
        h('div', { className: 'eva-hud__corner eva-hud__corner--br' }),
        h('div', { className: 'eva-hud__tag eva-hud__tag--br' }, 'LCL NOMINAL'),
        h('div', { className: 'eva-hud__vertical' },
          h('span', { className: 'eva-unit-dark' }, '特務機関ネルフ 中央ドグマ'),
          h('span', { className: 'eva-unit-light' }, '第二号機 起動準備')))
    }

    const isDarkScheme = () => typeof document !== 'undefined' && document.body != null
      && document.body.hasAttribute('data-ds-dark-theme')

    /** Small corner switch between Unit-01 (dark) and Unit-02 (light). */
    function EvaUnitToggle() {
      const [dark, setDark] = React.useState(isDarkScheme)
      React.useEffect(() => {
        if (typeof document === 'undefined' || document.body == null) return
        const update = () => setDark(isDarkScheme())
        const observer = new MutationObserver(update)
        observer.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
        return () => observer.disconnect()
      }, [])
      return h('button', {
        type: 'button',
        className: 'eva-unit-switch',
        title: dark ? '切换到 EVA-02（浅色红橙）' : '切换到 EVA-01（深色紫绿）',
        'aria-label': dark ? '切换到 EVA-02 浅色主题' : '切换到 EVA-01 深色主题',
        onClick: () => { window.dispatchEvent(new CustomEvent('eva-cockpit:toggle-unit')) },
      },
      h('span', { className: 'eva-unit-switch__track' }, h('span', { className: 'eva-unit-switch__thumb' })),
      h('span', { className: 'eva-unit-switch__copy' },
        h('span', { className: 'eva-unit-switch__title' }, 'UNIT SWITCH'),
        h('span', { className: 'eva-unit-switch__unit' },
          h('span', { className: 'eva-unit-dark' }, 'UNIT-01 // 紫绿'),
          h('span', { className: 'eva-unit-light' }, 'UNIT-02 // 红橙'))))
    }

    const HEX_GRID = (() => {
      const R = 34
      const W = Math.sqrt(3) * R
      const H = R * 1.5
      const centerX = 600
      const centerY = 390
      const items = []
      let row = 0
      for (let y = -H; y < 800 + H; y += H) {
        const offset = row % 2 === 0 ? 0 : W / 2
        let col = 0
        for (let x = -W; x < 1220 + W; x += W) {
          const cx = x + offset
          const points = []
          for (let step = 0; step < 6; step++) {
            const angle = Math.PI / 6 + (Math.PI / 3) * step
            points.push(`${(cx + R * Math.cos(angle)).toFixed(1)},${(y + R * Math.sin(angle)).toFixed(1)}`)
          }
          const distance = Math.hypot(cx - centerX, y - centerY)
          items.push({
            points: points.join(' '),
            delay: (distance * 0.0022 + ((row + col) % 5) * 0.045).toFixed(2),
            warm: (row * 2 + col) % 9 === 0,
          })
          col++
        }
        row++
      }
      return items
    })()

    function hexPoints(cx, cy, r) {
      const points = []
      for (let index = 0; index < 6; index++) {
        const angle = Math.PI / 6 + (Math.PI / 3) * index
        points.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`)
      }
      return points.join(' ')
    }

    function MagiTriPanel() {
      const nodes = [
        { cx: 92, cy: 80, label: 'MELCHIOR-1', tone: 'warm' },
        { cx: 328, cy: 80, label: 'CASPER-3', tone: 'warm' },
        { cx: 210, cy: 196, label: 'BALTHASAR-2', tone: 'green' },
      ]
      return h('svg', { className: 'eva-magi-panel', viewBox: '0 0 420 270', 'aria-hidden': 'true' },
      nodes.map(node => h('line', {
        key: `link-${node.label}`, x1: 210, y1: 120, x2: node.cx, y2: node.cy, className: 'eva-magi-link',
      })),
      h('g', { className: 'eva-magi-core' },
        h('polygon', { points: hexPoints(210, 120, 32), className: 'eva-magi-core__frame' }),
        h('text', { x: 210, y: 124, textAnchor: 'middle', className: 'eva-magi-core__text' }, 'MAGI')),
      nodes.map(node => h('g', { key: node.label, className: `eva-magi-node eva-magi-node--${node.tone}` },
        h('polygon', { points: hexPoints(node.cx, node.cy, 52), className: 'eva-magi-node__frame' }),
        h('text', { x: node.cx, y: node.cy - 2, textAnchor: 'middle', className: 'eva-magi-node__label' }, node.label),
        h('text', { x: node.cx, y: node.cy + 16, textAnchor: 'middle', className: 'eva-magi-node__status' }, 'ONLINE'))))
    }

    function NervWarnings() {
      const warnings = [
        { x: 95, y: 150, label: 'EMERGENCY', red: true },
        { x: 205, y: 108, label: 'WARNING', red: false },
        { x: 1105, y: 150, label: 'EMERGENCY', red: true },
        { x: 995, y: 108, label: 'WARNING', red: false },
      ]
      return h('svg', {
        className: 'eva-boot__warnings', viewBox: '0 0 1200 780', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true',
      },
      warnings.map((warning, index) => h('g', {
        key: warning.label + index,
        className: `eva-warn${warning.red ? ' eva-warn--red' : ''}`,
        style: { animationDelay: `${(index * 0.45).toFixed(2)}s` },
      },
      h('polygon', { points: hexPoints(warning.x, warning.y, 40), className: 'eva-warn__hex' }),
      h('text', { x: warning.x, y: warning.y + 3, textAnchor: 'middle', className: 'eva-warn__text' }, warning.label))))
    }

    function NervHexes() {
      return h('svg', {
        className: 'eva-boot__hexes', viewBox: '0 0 1200 780', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true',
      },
      HEX_GRID.map((hex, index) => h('polygon', {
        key: index, points: hex.points,
        className: hex.warm ? 'eva-hex eva-hex--warm' : 'eva-hex',
        style: { '--d': `${hex.delay}s` },
      })))
    }

    function NervCircuits() {
      return h('svg', {
        className: 'eva-hud__circuits', viewBox: '0 0 1200 780', preserveAspectRatio: 'none', 'aria-hidden': 'true',
      },
      h('path', { d: 'M18 80V150H34V320H18V540H42V710', className: 'eva-circuit' }),
      h('path', { d: 'M1182 80V170H1166V350H1182V560H1158V710', className: 'eva-circuit' }),
      h('path', {
        d: 'M18 150H60M34 320H72M42 540H78M1182 170H1140M1166 350H1128M1158 560H1120',
        className: 'eva-circuit',
      }),
      [[18, 150], [34, 320], [42, 540], [1182, 170], [1166, 350], [1158, 560]].map(([cx, cy], index) => h('circle', {
        key: index, cx, cy, r: 2.2, className: 'eva-circuit-node',
      })),
      h('path', {
        d: 'M600 16V30M592 23H608M600 750V764M592 757H608M16 390H30M23 382V398M1170 390H1184M1177 382V398',
        className: 'eva-crosshair',
      }))
    }

    const BOOT_LINES = [
      '[00] MAGI SYSTEM v3.0 ........ ONLINE',
      '[01] CENTRAL DOGMA LINK ...... ESTABLISHED',
      '[02] A.T. FIELD .............. NOMINAL',
      '[03] SYNC RATIO .............. 100.0%',
      '[04] PATTERN ................. BLUE',
    ]

    /**
     * NERV / MAGI boot sequence. Mounts with the shell on every page load,
     * counts the sync ratio up, then fades out; click or any key skips it.
     */
    function EvaBoot() {
      const [progress, setProgress] = React.useState(0)
      const [exiting, setExiting] = React.useState(false)
      const [done, setDone] = React.useState(false)
      const [diag, setDiag] = React.useState('')
      const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

      React.useEffect(() => {
        if (typeof window === 'undefined') return
        setDiag(`DISPLAY ${window.innerWidth}×${window.innerHeight} // DPR ${window.devicePixelRatio.toFixed(2)}`)
      }, [])

      React.useEffect(() => {
        if (reduced) {
          setProgress(100)
          const timer = setTimeout(() => setExiting(true), 1100)
          return () => clearTimeout(timer)
        }
        let value = 0
        let finish = 0
        const tick = setInterval(() => {
          value = Math.min(100, value + 2)
          setProgress(value)
          if (value >= 100) {
            clearInterval(tick)
            finish = setTimeout(() => setExiting(true), 600)
          }
        }, 26)
        return () => { clearInterval(tick); clearTimeout(finish) }
      }, [reduced])

      React.useEffect(() => {
        if (!exiting) return
        const timer = setTimeout(() => setDone(true), 900)
        return () => clearTimeout(timer)
      }, [exiting])

      React.useEffect(() => {
        if (done || exiting) return
        // Never prevent or stop the key: a lingering capture listener must
        // never be able to eat composer input. Any key only dismisses the splash.
        const onKey = () => setExiting(true)
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [done, exiting])

      if (done) return null
      const boot = h('div', {
        className: `eva-boot${exiting ? ' eva-boot--exit' : ''}`,
        role: 'status', 'aria-label': 'NERV MAGI 启动序列', onClick: () => setExiting(true),
      },
      h('div', { className: 'eva-boot__scan' }),
      h('div', { className: 'eva-boot__vignette' }),
      h(NervHexes),
      h(NervWarnings),
      h('div', { className: 'eva-boot__hazard eva-boot__hazard--top' }),
      h('div', { className: 'eva-boot__hazard eva-boot__hazard--bottom' }),
      h('div', { className: 'eva-boot__topline' },
        h('span', { className: 'eva-boot__emergency' }, 'EMERGENCY'),
        h('span', null, 'NERV // MAGI SYSTEM'),
        h('span', null, 'PATTERN: BLUE')),
      h('div', { className: 'eva-boot__diag eva-boot__diag--top' }, diag),
      h('div', { className: 'eva-boot__bottomline' },
        h('span', null, 'CENTRAL DOGMA'),
        h('span', null, 'LCL PRESSURE NOMINAL'),
        h('span', null, 'SYNC 100.0%')),
      h('div', { className: 'eva-boot__inner' },
        h(NervEmblem, { className: 'eva-boot__emblem' }),
        h('div', { className: 'eva-boot__magi-title' }, 'MAGI SYSTEM // TOKYO-3'),
        h(MagiTriPanel),
        h('div', { className: 'eva-boot__jp' }, '特務機関ネルフ'),
        h('div', { className: 'eva-boot__sub' }, 'AUTHORIZATION SEQUENCE // DEEPSEEK OS'),
        h('div', { className: 'eva-boot__bar' },
          h('div', { className: 'eva-boot__fill', style: { width: `${progress}%` } })),
        h('div', { className: 'eva-boot__meta' },
          h('span', null, 'SYNC RATIO'),
          h('span', { className: 'eva-boot__percent' }, `${Math.round(progress)}%`),
          h('span', null, 'A.T. FIELD')),
        h('div', { className: 'eva-boot__log' }, BOOT_LINES.map((line, index) =>
          h('span', { key: line, style: { animationDelay: `${0.25 + index * 0.2}s` } }, line)))),
      h('div', { className: 'eva-boot__hint' }, 'CLICK OR PRESS ANY KEY TO SKIP'))
      if (createPortal !== null && typeof document !== 'undefined' && document.body != null) {
        return createPortal(boot, document.body)
      }
      return boot
    }

    /* ------------------------------------------------------------------ *
     * Plugin body.
     * ------------------------------------------------------------------ */
    return {
      inject: ['theme', 'slots'],
      apply(ctx) {
        // First activation seeds the cockpit scheme; later user choices win.
        ctx.effect(() => {
          try {
            const key = 'eva-cockpit:scheme-seeded'
            if (localStorage.getItem(key) === '1') return
            localStorage.setItem(key, '1')
            if (ctx.theme.getTheme().active.colorScheme !== 'dark') ctx.theme.setTheme('dark')
          } catch (error) {
            console.error('eva-cockpit: could not seed the color scheme', error)
          }
        }, 'eva-cockpit: scheme seed')

        ctx.effect(() => ctx.theme.overrideTokens('@local/eva-cockpit', TOKENS), 'eva-cockpit: palette')

        ctx.effect(() => {
          const toggle = () => {
            const scheme = ctx.theme.getTheme().active.colorScheme
            ctx.theme.setTheme(scheme === 'dark' ? 'light' : 'dark')
          }
          window.addEventListener('eva-cockpit:toggle-unit', toggle)
          return () => window.removeEventListener('eva-cockpit:toggle-unit', toggle)
        }, 'eva-cockpit: unit switch')

        ctx.effect(() => {
          if (typeof MutationObserver === 'undefined' || typeof document === 'undefined' || document.body == null) return
          const REWRITE = [
            ['深度求索中，用时 ', 'MAGI 解析中，用时 '],
            ['深度求索中', 'MAGI 解析中'],
            ['Deep diving for ', 'MAGI analyzing for '],
            ['Deep diving', 'MAGI analyzing'],
          ]
          const convert = (text) => {
            for (const [from, to] of REWRITE) {
              if (text.startsWith(from)) return `${to}${text.slice(from.length)}`
            }
            return text
          }
          const rewrite = (root) => {
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
            let node = walker.nextNode()
            while (node !== null) {
              const current = node.nodeValue ?? ''
              const next = convert(current)
              if (next !== current) { node.nodeValue = next; break }
              node = walker.nextNode()
            }
            for (const element of root.querySelectorAll('[data-shimmer-text]')) {
              const current = element.getAttribute('data-shimmer-text') ?? ''
              const next = convert(current)
              if (next !== current) element.setAttribute('data-shimmer-text', next)
            }
          }
          let target = null
          let elementObserver = null
          const attach = () => {
            const next = document.querySelector('[data-chat-running] [data-shimmer]')
            if (next === target) return
            elementObserver?.disconnect()
            target = next
            if (target === null) return
            rewrite(target)
            elementObserver = new MutationObserver(() => rewrite(target))
            elementObserver.observe(target, { characterData: true, childList: true, subtree: true })
          }
          const bodyObserver = new MutationObserver(attach)
          bodyObserver.observe(document.body, { childList: true, subtree: true })
          attach()
          return () => { bodyObserver.disconnect(); elementObserver?.disconnect() }
        }, 'eva-cockpit: running copy')

        ctx.effect(() => {
          const tag = document.createElement('style')
          tag.dataset.plugin = '@local/eva-cockpit'
          tag.dataset.pluginCss = '@local/eva-cockpit/eva.css'
          tag.textContent = CSS
          document.head.appendChild(tag)
          return () => { tag.remove() }
        }, 'eva-cockpit: stylesheet')

        ctx.slots.inject('shell.overlay', () => ctx.slots.register(
          { name: 'shell.overlay', id: 'eva-cockpit-hud', order: 100 }, EvaOverlay))
        ctx.slots.inject('shell.overlay', () => ctx.slots.register(
          { name: 'shell.overlay', id: 'eva-cockpit-unit-toggle', order: 150 }, EvaUnitToggle))
        ctx.slots.inject('shell.overlay', () => ctx.slots.register(
          { name: 'shell.overlay', id: 'eva-cockpit-boot', order: 200 }, EvaBoot))
        ctx.slots.inject('sidebar.brand.mark', () => ctx.slots.register(
          { name: 'sidebar.brand.mark', priority: -10 }, EvaMark))
        ctx.slots.inject('sidebar.brand.name', () => ctx.slots.register(
          { name: 'sidebar.brand.name', priority: -10 }, EvaBrandName))
        ctx.slots.inject('conversation.hero.brand.mark', () => ctx.slots.register(
          { name: 'conversation.hero.brand.mark', priority: -10 }, EvaHeroMark))
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register(
          { name: 'conversation.composer.dock', id: 'eva-cockpit-sync', order: 60 }, EvaDockStatus))
      },
    }
  },
})
