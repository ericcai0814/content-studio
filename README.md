# content-studio

多格式內容產出工作區。透過 HTML + CSS 模板與 Playwright 截圖，產出輪播貼文、Landing Page、簡報等視覺內容。

設計理念：**一套 base.css 骨架 + 共用 themes + 各內容類型獨立模板**。換主題只要改 `<link>` 的 CSS 路徑，不動 HTML 結構。

---

## 目錄結構

```
content-studio/
├── .claude/                        ← Claude Code 配置
│   ├── skills/                     ← 自動化 skills
│   ├── agents/                     ← 審查用 subagents
│   └── settings.json
├── content-system/                 ← 內容工作目錄
│   ├── themes/                     ← 跨類型共用主題
│   │   ├── default.css
│   │   ├── claude.css
│   │   ├── editorial.css
│   │   └── warm-dark.css
│   ├── carousel/                   ← 輪播貼文（IG 1080×1350）
│   │   ├── base.css
│   │   └── contents/
│   │       ├── _template/          ← 唯讀骨架
│   │       ├── _reference/         ← 設計參考
│   │       └── <slug>/             ← 各篇內容
│   ├── landing-page/               ← Landing Page
│   │   ├── base.css
│   │   └── contents/<slug>/
│   └── presentation/               ← 簡報
│       ├── base.css
│       ├── deck-stage.js
│       └── contents/<slug>/
└── pk-cowork/                      ← 歷史對比專案（見內附 REPORT.md）
```

---

## 內容類型

### Carousel（IG 輪播貼文）

| 項目 | 規格 |
|---|---|
| 尺寸 | 1080 × 1350 px（4:5 直式） |
| 主要字型 | Outfit、Noto Sans TC、Noto Serif TC |
| 編輯方式 | `contenteditable` 直接在瀏覽器微調 |
| 匯出 | Playwright 逐頁截圖為 PNG |

### Landing Page

單頁式產品 / 活動頁面。範例：`arova-handoff`（含 dist 編譯產物）。

### Presentation

投影片，由 `deck-stage.js` 控制翻頁與播放。範例：`ai-flow-sprint-briefing`。

---

## Themes

所有主題共用一組 design token，定義在每個 theme 的 `:root`：

```css
--bg --primary --secondary --muted --border
--card-dark --card-light --green --red
--font-display --font-heading --font-body
--logo --w --h --pad
```

切換主題只要改 HTML `<head>` 裡的這一行：

```html
<link rel="stylesheet" href="../../../themes/default.css">
<!-- 換成 claude.css / editorial.css / warm-dark.css -->
```

---

## 工作流程

### 新增一篇 carousel

```bash
# 1. 複製模板
cp -r content-system/carousel/contents/_template \
      content-system/carousel/contents/<slug>

# 2. 編輯 index.html，替換 {{TITLE}} 等佔位符

# 3. 瀏覽器開啟預覽，contenteditable 微調

# 4. Playwright 截圖匯出（透過 carousel-export skill）
```

### Skills 與 Agents

`.claude/` 下提供以下自動化：

| Skill | 用途 |
|---|---|
| `content-system-setup` | 初始化 / 同步內容系統骨架 |
| `carousel-create` | 從主題 / 大綱生成輪播草稿 |
| `carousel-export` | 批次截圖匯出 PNG |
| `carousel-pdf-export` | 匯出 PDF 版本 |
| `presentation-create` | 簡報草稿生成 |
| `eric-writing-style` | 套用 Eric 個人寫作風格 |

| Agent | 用途 |
|---|---|
| `content-reviewer` | 內容品質審查（密度、邏輯、CTA） |
| `visual-qa-carousel` | 視覺 QA（截圖檢查溢出 / 字型 / 主題一致性） |

---

## 模板規範

- `_template/` 與 `base.css` 是**唯讀骨架** —— 複製後再編輯，不要直接動原檔。
- 新增內容類型應沿用 `base + themes + template` 三層架構。
- 所有 theme CSS 必須完整定義上述 design token，否則 `base.css` 樣式會塌掉。

---

## pk-cowork

`pk-cowork/` 是一次性的設計對比實驗：用同一份文案，比較 content-studio 模板版 vs. 從零手寫版的設計取捨。詳見 [`pk-cowork/REPORT.md`](pk-cowork/REPORT.md)。

匯出截圖（`exports*/`）已透過 `.gitignore` 排除，不入版控。
