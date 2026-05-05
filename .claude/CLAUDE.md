# Content Studio

多格式內容產出工作區。可輸出輪播貼文、報告、文章等各類內容，搭配不同視覺主題。

## 專案結構

```
.claude/
├── skills/
│   ├── content-system-setup/   ← 內容系統 skill（模板 + themes 原始碼）
│   ├── carousel-create/        ← 從主題/大綱生成輪播
│   └── carousel-export/        ← 批次截圖匯出 PNG
├── agents/
│   ├── content-reviewer.md     ← 內容品質審查
│   └── visual-qa-carousel.md   ← 視覺 QA
└── settings.json               ← 項目級 hooks

content-system/                 ← 安裝後的工作目錄（傘狀命名空間）
└── carousel/                   ← 輪播專用（未來可新增 report/ article/）
    ├── base.css
    ├── themes/*.css
    ├── contents/_template/
    ├── contents/<slug>/        ← 各篇內容
    └── contents/<slug>/output/ ← 匯出檔案
```

## 通用規則

- 模板檔（`_template/`、`base.css`）是唯讀骨架，複製後再編輯
- 新增內容：複製對應類型的 template 到 `contents/<slug>/`
- 匯出：Playwright 或 Puppeteer 截圖

## 內容類型

### Carousel（輪播貼文）
- 尺寸：1080 x 1350 px（IG 直式 4:5）
- 切換主題：改 `<link>` 的 CSS 路徑
- 8 個主題：default / dark / editorial / gradient / luxury / professional / glass-orange / claude

### 其他類型
隨專案演進擴充。新內容類型應遵循相同的 `base + themes + template` 架構。

## CSS Theme Token 規範

所有 theme CSS 必須在 `:root` 定義以下 design token：

```
--bg --primary --secondary --muted --border
--card-dark --card-light --green --red
--font-display --font-heading --font-body
--logo --w --h --pad
```
