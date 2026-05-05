# Carousel System — CSS Reference

## CSS Class Quick Reference

### Basic

| Class | Purpose |
|-------|---------|
| `.cover-title` | Cover main title (96px bold) |
| `.cover-sub` | Cover subtitle |
| `.cover-desc` | Cover description |
| `.deco` | Decorative divider |
| `.page-title` | Page title (64px) |
| `.body` | Body text (36px) |
| `.small` | Small text (28px) |
| `.callout` | Highlight / quote box |
| `.highlight-card` | Dark emphasis card (with `.h-text` `.h-sub`) |
| `.illust` | Illustration container (wraps `<img>`) |
| `.mt-auto` | Push to bottom |

### Structural Blocks

| Class | Purpose |
|-------|---------|
| `.steps` + `.step` | Numbered step list (`.step-num` `.step-t` `.step-d`) |
| `.arrow-steps` + `.arrow-step` | Arrow steps (`.arrow-t` `.arrow-d`) |
| `.flow-row` + `.flow-chip` | Flow chips + arrow (`.flow-arrow`) |
| `.compare` + `.compare-col` | Two-column comparison (`.compare-head` `.compare-row`) |
| `.diagram` | Flowchart container |
| `.diagram-row` + `.diagram-node` | Flowchart nodes (`.node-t` `.node-d`) |
| `.diagram-arrow` | Flowchart arrow |
| `.diagram-node.wide` | Full-width node |
| `.diagram-node.light` | Light-colored node |
| `.cycle` + `.cycle-node` | Cycle diagram (`.cycle-arrow`) |
| `.chat` + `.bubble` | Chat bubbles (`.bubble.user` / `.bubble.ai`, with `.label`) |
| `.quote-block` | Quote block (`.quote-mark` `.quote-text`) |
| `.prompt-card` | Prompt card (`.prompt-label` `.prompt-text`) |
| `.terminal` | Terminal window (`.terminal-bar` `.terminal-body`) |
| `.task-demo` | Task demo (`.task-command` `.task-result`) |
| `.eq-row` + `.eq-box` | Equation comparison (`.eq-sign`) |
| `.feature-grid` + `.feature-item` | Feature grid (`.feature-label` `.feature-detail`) |
| `.illust-row` | Illustration + text side by side |

### Custom Layouts

For layouts not covered by CSS classes, use inline styles. Follow the theme's design tokens (colors, fonts, border-radius, spacing) for visual consistency.

## Design Token Reference

All themes must define these 16 tokens in `:root`:

| Token | default.css | editorial.css |
|-------|-------------|---------------|
| `--bg` | `#ebebeb` | `#000` |
| `--primary` | `#111827` | `#fff` |
| `--secondary` | `#4b5563` | `rgba(255,255,255,0.85)` |
| `--muted` | `#6b7280` | `rgba(255,255,255,0.6)` |
| `--border` | *(see CSS)* | *(see CSS)* |
| `--card-dark` | *(see CSS)* | *(see CSS)* |
| `--card-light` | *(see CSS)* | *(see CSS)* |
| `--green` | *(see CSS)* | *(see CSS)* |
| `--red` | *(see CSS)* | *(see CSS)* |
| `--font-display` | Outfit | Outfit |
| `--font-heading` | *(see CSS)* | *(see CSS)* |
| `--font-body` | Outfit + Noto Sans TC | Outfit + Noto Sans TC |
| `--logo` | *(project logo path)* | *(project logo path)* |
| `--w` | `1080px` | `1080px` |
| `--h` | `1350px` | `1350px` |
| `--pad` | `80px` | `80px` |

## Editorial Theme — Special Usage

The editorial theme requires a background image per page:

```html
<div class="page" style="background:url(bg-01.jpg) center/cover;">
```

CSS automatically adds a dark gradient overlay — darker at the bottom for cover pages, uniformly dark for content pages.
