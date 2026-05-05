# Handoff: Obsidian Publish 體系建立

## 背景

Eric 提出用 Slack 圖卡進行團隊知識滲透的策略：
- 日常發圖卡（碎片知識）→ 定期 meetup/workshop 串連知識體系
- 圖卡也可作為 meetup/workshop 的 follow-up
- 內容來源從 Obsidian vault 篩選，用 content-studio 產出圖卡，發佈到 Slack

## 目標

將 Obsidian vault 的 `40-blog/` 擴展為 `40-publish/` 體系，涵蓋 blog 和 cards 兩種發佈類型。

## 當前 Vault 結構（PARA-based）

```
00-inbox/
10-projects/
20-areas/
30-resources/
40-blog/              ← 目前只有 blog
  ├── blog-index.md
  └── ideas/
sources/
_templates/
```

### 40-blog/blog-index.md 現有內容

- Published: 4 篇（由 `obs run --blog` 自動同步）
- Drafts: 2 篇

## 執行計畫

### Step 1: 資料夾重組

```
40-publish/                    ← 改名自 40-blog
  ├── blog/                    ← 現有 blog 內容搬入
  │   ├── blog-index.md
  │   └── ideas/
  ├── cards/                   ← 新增：圖卡素材
  │   ├── cards-index.md       ← 新增：追蹤看板
  │   ├── queue/               ← 待製作
  │   └── published/           ← 已發佈
  └── publish-index.md         ← 新增：總索引
```

### Step 2: 建立 cards-index.md

仿照 blog-index.md 格式：

```markdown
---
title: "Cards"
date: 2026-04-16
tags: [cards, index]
up: ["[[publish-index]]"]
---

# Cards

> 圖卡追蹤看板。素材從 vault 筆記篩選，用 content-studio 產出。

## Queue
（待製作的圖卡主題）

## Published
- ai-dev-pitfalls — AI 輔助開發的 3 個真實踩坑故事（2026-04-16）
```

### Step 3: 建立 publish-index.md

```markdown
---
title: "Publish"
date: 2026-04-16
tags: [publish, index]
up: ["[[Home]]"]
---

# Publish

> 所有對外發佈內容的總索引。

## 類型
- [[blog-index|Blog]] — 長文、技術文章
- [[cards-index|Cards]] — Slack 圖卡、社群碎片知識
```

### Step 4: 更新相關引用

- `blog-index.md` 的 frontmatter `up` 改為 `["[[publish-index]]"]`
- CLAUDE.md 結構說明中 `40-blog/` → `40-publish/`
- 檢查 `obs run --blog` 路徑是否需要更新（scripts/inbox_processor.py 或相關腳本）

### Step 5: 建立 card-draft template

在 `_templates/` 新增 `card-draft.md`：

```markdown
---
title: "{{title}}"
date: {{date}}
tags: [card, draft]
up: ["[[cards-index]]"]
source: ""
target: "slack"
---

## 主題

## 核心觀點（1-3 句）

## 大綱（5-12 頁）

## 來源筆記
- [[]]
```

## 注意事項

- 移動檔案用 filesystem（pathlib / mv），不用 Obsidian MCP
- Obsidian wikilink 會自動追蹤檔名，但 `up` frontmatter 裡的路徑需手動更新
- `obs run --blog` 腳本路徑如果 hardcode 了 `40-blog/`，需要一併改
- 已發佈的 ai-dev-pitfalls 應加入 cards-index.md 的 Published 區塊
