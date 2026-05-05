---
name: content-system-setup
description: Scaffold a content production system (carousel, etc.) into a project. Triggers: "setup content system", "init content system", "setup carousel". Copies base.css, themes, and HTML template for the chosen content type.
disable-model-invocation: true
argument-hint: "[content-type] [target-directory]"
allowed-tools: Read Write Bash(cp *) Bash(mkdir *)
---

# Content System Setup

Set up a content production system in the user's project. `content-system/` is a傘狀命名空間，每種內容類型（carousel / report / article）有獨立的骨架。

目前支援的類型：

| Type | Status | 說明 |
|------|--------|------|
| `carousel` | ✅ | IG 輪播貼文（1080×1350） |
| `report` | 🚧 | 未來支援 |
| `article` | 🚧 | 未來支援 |

## System Architecture

```
content-system/
└── carousel/
    ├── base.css              ← Structural layout (shared by all themes)
    ├── themes/
    │   ├── default.css
    │   ├── editorial.css
    │   └── ...
    └── contents/
        └── _template/
            └── index.html    ← HTML skeleton
```

## Steps

### 1. Confirm Content Type

Ask which content type to install. Default: `carousel`（目前唯一支援類型）。

### 2. Confirm Target Directory

Ask the user where to install. Default: `./content-system/<type>/`.

### 3. Copy Files

```bash
cp -r ${CLAUDE_SKILL_DIR}/src/<type>/* <TARGET_DIR>/
```

File mapping (for `carousel`):

- `${CLAUDE_SKILL_DIR}/src/carousel/base.css` → `<TARGET>/base.css`
- `${CLAUDE_SKILL_DIR}/src/carousel/themes/*.css` → `<TARGET>/themes/`
- `${CLAUDE_SKILL_DIR}/src/carousel/_template/index.html` → `<TARGET>/contents/_template/index.html`

### 4. Update Logo Reference

Each theme CSS has a `--logo` variable in `:root`:

```css
--logo: url("../made by pan_black.png");
```

Ask if the user has their own logo. If not, change to:

```css
--logo: none;
```

### 5. Confirm Completion

Tell the user the system is ready and how to use it.

## Usage

1. Create a new folder under `contents/`, e.g. `contents/my-post/`
2. Copy `contents/_template/index.html` into it
3. Edit the HTML content
4. Switch theme by changing the `<link>` CSS path:
   ```html
   <link rel="stylesheet" href="../../../themes/editorial.css">
   ```
5. Export to PNG using `/carousel-export`

## Page Size

- **IG carousel**: 1080 x 1350 px (portrait 4:5) — default

## Available Themes

| Theme | Style | Best for |
|-------|-------|----------|
| `default.css` | Grey background, B&W | General purpose |
| `editorial.css` | Full-bleed image + overlay | Photography, magazine |

## HTML Skeleton

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Noto+Serif+TC:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../base.css">
    <link rel="stylesheet" href="../../../themes/default.css">
</head>
<body>

<div class="page">
    <div class="inner" style="justify-content:center;">
        <!-- Content here -->
    </div>
</div>

</body>
</html>
```

## Reference

For CSS class quick reference and design token tables, see `reference.md` in this skill directory.
