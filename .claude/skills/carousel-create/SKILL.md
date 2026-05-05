---
name: carousel-create
description: Generate a complete IG carousel HTML from a topic or outline. Triggers: "create carousel", "new carousel", "make carousel post".
disable-model-invocation: true
---

# Carousel Create

從主題、大綱、或筆記內容生成一篇完整的輪播貼文 HTML。

## 輸入

使用者會提供以下資訊（部分可選）：

| 參數 | 必要 | 說明 |
|------|------|------|
| 主題/標題 | ✅ | 輪播要講什麼 |
| 要點/大綱 | 選填 | 每頁要涵蓋的重點 |
| theme | 選填 | CSS 主題名稱，預設 `default` |
| 頁數 | 選填 | 預設 5-7 頁 |
| slug | 選填 | 資料夾名稱，預設從標題產生 |

## 執行步驟

### 1. 確認輪播系統已安裝

檢查專案中是否已有 `content-system/carousel/` 目錄。如果沒有，先用 `content-system-setup` skill 建立（指定類型為 `carousel`）。

### 2. 決定內容結構

根據主題和要點，規劃每頁內容：

- **P1（封面）**：吸引注意力的標題 + 副標 + 描述
- **P2-Pn（內容頁）**：每頁一個核心觀點，使用適合的 CSS class 排版
- **最後一頁（CTA）**：行動呼籲 + handle

每頁文字量控制在 50-120 字，確保 IG 閱讀體驗。

### 3. 選擇適合的 CSS class

根據內容性質選用 class（參考 `.claude/skills/content-system-setup/SKILL.md` 的 CSS Class 速查）：

- 步驟教學 → `.steps` / `.arrow-steps`
- 對比分析 → `.compare`
- 流程說明 → `.diagram` / `.flow-row`
- 引言重點 → `.callout` / `.quote-block`
- 對話展示 → `.chat` + `.bubble`
- 程式碼 → `.terminal`

### 4. 生成 HTML

1. 複製 `content-system/carousel/contents/_template/index.html` 到 `content-system/carousel/contents/<slug>/index.html`
2. 將 theme CSS `<link>` 改為指定主題
3. 填入實際內容，每個 `.page` 對應一頁
4. 確保所有 `contenteditable="true"` 屬性保留（方便瀏覽器微調）

### 5. 預覽

用 Playwright 開啟生成的 HTML 進行截圖預覽，確認排版正確。

## 可用主題

| Theme | 風格 | 適合 |
|-------|------|------|
| `default` | 灰底黑白 | 通用 |
| `dark` | 純黑底 | 科技、沉浸 |
| `editorial` | 全幅背景圖 + 遮罩 | 攝影、雜誌風 |
| `gradient` | 米白紫漸層 | 個人品牌 |
| `luxury` | 黑金配 | 高品質感 |
| `professional` | 白底藍調 | 商務、教學 |
| `glass-orange` | 深黑橘色毛玻璃 | AI/科技 |
