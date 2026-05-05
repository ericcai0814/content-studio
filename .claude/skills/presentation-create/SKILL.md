---
name: presentation-create
description: Generate a complete HTML presentation deck (using the deck-stage web component) from a topic or outline. Triggers: "create presentation", "new presentation", "make slides", "簡報", "做簡報".
disable-model-invocation: true
---

# Presentation Create

從主題、大綱、或筆記內容生成一份完整的 HTML 簡報（單檔 `index.html`，用 `<deck-stage>` web component）。

> **不用 Slidev**。本專案走 HTML + deck-stage.js 路線：單檔可攜、原生網頁、支援鍵盤導航/列印 PDF/講者筆記/localStorage 狀態。

## 輸入

| 參數 | 必要 | 說明 |
|------|------|------|
| 主題/標題 | ✅ | 簡報要講什麼 |
| 要點/大綱 | 選填 | 每張投影片要涵蓋的重點 |
| 張數 | 選填 | 預設 10-15 張 |
| slug | 選填 | 資料夾名稱，預設從標題產生 |
| 場合/觀眾 | 選填 | 影響語氣、字數、範例密度 |

## 執行步驟

### 1. 確認 presentation 系統已安裝

檢查 `content-system/presentation/` 是否已存在（要有 `base.css`、`deck-stage.js`、`contents/_template/`）。如果沒有，先用 `content-system-setup` skill 建立（指定類型 `presentation`）。

### 2. 決定投影片結構

**本 skill 預設用於技術分享、教學**。節奏範本（30 分鐘）：

```
Cover (dark)
  → Agenda
  → Section(Part 1) → content×3~4 + 對比/數據/金句
  → Section(Part 2) → content×3~4 + 完整 code / 架構圖
  → Section(Recap) → takeaway×3
  → CTA (dark)
```

**每張文字量**：
- Cover/CTA：`.display` 或 `.title-xl` 大字標題 ≤10 字
- Section 分隔：`.title-l` section title ≤15 字
- 內容頁 bullet：每點 ≤15 字，單頁 ≤5 點
- 程式碼：≤20 行，超過要拆頁

### 3. 選擇適合的版型組合

**slide chrome**（每張都要，保持資訊密度）：
```html
<div class="chrome">
  <div class="tl">{{主題}}</div>
  <div class="bl">{{NN}} / {{TOTAL}}</div>
  <div class="br">{{品牌}}</div>
</div>
```

**版型組件**（`base.css` 內建，比例建議見下）：

| 組件 | class | 用途 | 典型場景 |
|------|-------|------|---------|
| 封面/結尾 | `.slide.dark` + `.display` + `.eyebrow` | 強視覺開場收尾 | Cover、CTA |
| 章節分隔 | `.section-head` + `.num` + `.rule` | 切換主題區塊 | Part 1 → Part 2 |
| 條列重點 | `.numbered-item` + `.n` | 有序 1-5 項 | Agenda、Recap |
| 圖文說明 | `.card` | 帶框內容盒 | 概念說明、API 介紹 |
| 大數據 | `.stat` + `.num` + `.label` + `.accent` | 強調一個數字 | Benchmark、成長率 |
| 金句 | `.quote-card` + `.q-text` + `.q-attr` | 引言、使用者回饋 | 轉折強調、社會證明 |
| 重點引述 | `.callout` | 左邊線 + 縮排 | 短重點 inline |
| 流程時間軸 | `.timeline` + `.session-node` + `.timeline-arrow` | 步驟流程 | 工作流、演化史 |
| 程度條 | `.effort-bar` + `.on`/`.new` | 顯示強度/階段 | 成熟度、涵蓋度 |
| 程式碼 | `<pre><code>` 放在 `.card` 內 | 程式範例 | API、設定 |

**比例建議**：
- `.slide` 一般 60%（含 chrome + section-head + body）
- `.slide.dark` 20%（開場、Section 分隔、結尾）
- `.card` / `.quote-card` / `.stat` / `.numbered-item` 穿插其間
- 一份簡報建議 2-3 種「強調元件」循環使用，避免太雜

**Typography scale**（`.display` 148px → `.small` 18px）：

| Class | 尺寸 | 用途 |
|-------|------|------|
| `.display` | 148px 900w | 封面主標、CTA 頭條 |
| `.title-xl` | 92px 800w | 大章節頭條 |
| `.title-l` | 64px 700w | Section 標題 |
| `.title-m` | 40px 700w | 子段落標題、numbered-item 主文 |
| `.subtitle` | 28px 400w | 副標、補充 |
| `.body` | 22px 400w | 內文（預設）|
| `.small` | 18px | 註解、後設資訊 |
| `.mono` | JetBrains Mono | 程式、metrics label |
| `.eyebrow` | 13px 500w uppercase | 小標、分類 |

### 4. 生成 index.html

1. 複製 `content-system/presentation/contents/_template/index.html` 到 `content-system/presentation/contents/<slug>/index.html`
2. 不需修改 `<link>` 或 `<script src>` —— 相對路徑已對。
3. 依大綱新增/修改 `<section class="slide">` 子元素（放在 `<deck-stage>` 內）。每張 slide 必備：
   - `class="slide"` 或 `class="slide dark"`
   - `data-label="..."`（顯示在卡片與列印中）
   - `.chrome` 四角標
4. **Speaker notes**（選填）：在 `<head>` 內加入
   ```html
   <script type="application/json" id="speaker-notes">
   ["Slide 1 notes...", "Slide 2 notes..."]
   </script>
   ```
   陣列索引對應 slide 順序（0-based）。

### 5. 預覽

`<deck-stage>` 不支援 `file://`（`<script src>` 會被 CORS 擋），需要本地 server：

```bash
cd content-system/presentation && python3 -m http.server 8765
```

開啟 `http://localhost:8765/contents/<slug>/index.html`，用 ←/→/Space/PgUp/PgDn 導航，R 重置。

## 設計原則

- **視覺一致性靠 `base.css`、內容變化靠組件組合**。`base.css` 提供單一設計系統（coral/cream/ink）；不同 slide 用不同組件（card / quote / stat）製造節奏。
- **chrome 是識別記號**。每張 slide 四角的小字（主題 / 頁碼 / 品牌）讓觀眾隨時知道「身在何處」，尤其在截圖分享時。別省略。
- **dark slide 用在轉折**（開場、章節分隔、結尾），讓節奏有呼吸。連續太多 dark 會單調。
- **不要自己寫 `:root` CSS variables**。用 base.css 已定義的 tokens（`var(--coral)`、`var(--cream)`、`var(--ink)`、`var(--gray-1/2/3)`）。

## 參考

完整範例可參考 `content-system/presentation/contents/_reference/index.html`（Claude Opus 4.7 介紹簡報），展示了 15 張 slides 的真實用法，包含封面、議程、能力介紹、benchmark、pricing strip、遷移步驟、早期回饋、CTA。

## 相關 skill

- `content-system-setup`：建立 `content-system/presentation/` 骨架
- `carousel-create`：IG 輪播（4:5 直式，不同尺寸與目的）
