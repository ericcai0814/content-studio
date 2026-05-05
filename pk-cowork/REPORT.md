# PK Report · ai-dev-pitfalls

**題目**：同一份 12 頁輪播文案（AI 開發踩坑 3 故事）。兩邊各設計並匯出一次，條件盡量拉平。

**左（原版）**：Claude Code 裡跑 content-studio / `default.css` 主題，HTML 模板 + `base.css` 語彙塊 + Playwright 截圖。
**右（PK 版）**：Cowork 從零自己寫一份單檔 HTML，重新設計整套視覺語彙，同樣的 Playwright 腳本匯出。

---

## 一、公平起見：條件拉平

- 同一份文案（逐字照搬）
- 同一個輸出尺寸（1080×1350，2×）
- 同一套截圖工具（Playwright chromium headless）
- 都是純 HTML + Google Fonts，都可以 contenteditable 微調

差異純粹在「設計決策」與「CSS 寫法」。

---

## 二、視覺層面的取捨

| 維度 | 原版 default.css | Cowork 版 |
|---|---|---|
| 底色 | 冷灰白 `#ebebeb` | 暖黑 `#0E0D0B` |
| 主字 | Outfit（無襯線、幾何） | Fraunces（可變軸襯線）+ Inter |
| 強調色 | 沒有，純黑白灰 | 琥珀 `#F5A623`（單一 accent，警示感） |
| Mono 使用 | terminal 塊內才用 | 全域：story label、step 號、log role 都走 mono |
| 氣氛 | 中性、編輯風 | 深色開發者語境、帶「故障記錄」感 |
| 頁面資訊 | 無頁碼 | 固定右上琥珀點 + 左下 mono 頁碼 |

**我下這個設計決定的邏輯**：這組內容講的是 `.dockerignore` / mock data / 遷移事故 — 本質是「production 故障拆解」。原版的冷灰白編輯風不壞，但跟題目的氛圍有一點錯位；讀者是開發者，他們的日常是 terminal、log、error 訊息，用深底 + 單一警示色更能把「這是一篇夜半 on-call 的 postmortem」這個 tone 做出來。

不過要強調：這是**設計方向**的選擇，不是原版做錯。你的 default 主題如果用在談 OpenSpace、設計 sprint 那種內容上，會比我這個暖黑配色更合適。

---

## 三、值得看的幾個具體改動

**P7 · 對話重建現場**
原版用 chat bubble（IG 常見對話格式）。我換成仿 macOS 終端機視窗 + session log 樣式，`USER / CLAUDE` 當 role label（mono 字），內容塊不再是氣泡而是 log 行。主題是 debug session，用 log 呈現比聊天框更吻合讀者每天看到的東西。

**P5 · 對照 bad/good**
原版的 compare 兩欄是「下方灰底、head 粗黑線」。我加了卡片容器、用 `accent-2` 紅 / `accent-3` 綠分別鎖定 bad/good 的頂線，每欄內補 dashed divider 分隔條目，視覺層次更清楚。

**P11 · 解法流程圖**
原版 diagram-row 是三個等寬 dark card。我改成 `node → arrow → node → arrow → active-node`，把「再執行」那個步驟用琥珀高亮 + 漸層底當成流程終點，視覺上告訴讀者「這才是你要抵達的地方」。

**P12 · CTA**
原版用 callout block 收尾，是整頁裡相對平的結構。我用 italic 琥珀色的 Fraunces 襯線處理「AI 就精準地做錯」形成字重對比，再加一個仿 shell prompt 的 `$ spec > code` 塊當 tagline 容器，讓標語有 ceremony。

---

## 四、流程 / 工具層面的比較

這是誠實話：**如果只看「從文案到 PNG 的產出流程」，原版那一套幾乎沒什麼好改的**。你已經有：

- `carousel-create` skill 把 outline 變 HTML
- `carousel-export` skill 用 Playwright 批次截圖
- PreToolUse hook 擋模板亂改
- PostToolUse hook 驗 design token
- `content-reviewer` / `visual-qa-carousel` 兩個 QA agent

這個 pipeline 對 Claude Code 跟 Cowork 是一樣能跑的——skill 格式相同。我只是沒有用你的 skill，而是直接手刻了一份 `index.html` + `export.py`。

**Cowork 真正能為這個專案加值的地方**（而不是取代）：

1. **`create_artifact`**：把單一輪播做成 live artifact，每次打開自動從 connector 抓最新文案（例如你 Notion 裡的草稿題材）。今天這個是靜態 HTML，之後可以把題材來源 wire 進去。
2. **computer use + Chrome MCP**：可以打開你手邊的 Chrome 直接在瀏覽器裡檢查微調結果，或真的幫你發 IG 排程（Creator Studio / Meta Business Suite）。
3. **`canvas-design` skill**：如果你想做的是封面海報、單圖，它會比手刻 HTML 合適。
4. **connector 整合**：例如「從 Notion 的 idea 資料庫抓下一個題材，自動產出 carousel 草稿」— Cowork 這邊直接可以一條線接起來。

---

## 五、誠實計分板

| 評估點 | 勝出 | 說明 |
|---|---|---|
| 視覺與題目的吻合度 | **Cowork 版** | 暖黑 + 琥珀警示色跟「踩坑」題目更搭 |
| 版面層級清楚度 | **Cowork 版** | 頁碼、右上紅點、mono kicker 讓 12 頁像一本期刊 |
| 設計系統成熟度 | **原版** | 我的 CSS 是單檔手刻；你的 `base.css` + `themes/*.css` 是經過抽象、可複用的系統 |
| 主題可切換性 | **原版** | 你換一個 `<link>` 就換 theme；我這版主題硬編在單檔內 |
| 生產線自動化 | **打平** | 都是 Playwright 截圖，流程等價 |
| QA 保險 | **原版** | hooks + agent review 是 Cowork 這邊這次沒有做的 |
| 從 idea 到成品 | **Cowork 有潛力** | connector 接資料源、artifact 持久化，這是你現在 Claude Code 那套沒在做的延伸 |

### 結論

單看一張張 slide 的設計，我這版比原版更有針對性——但這是「**一次性設計**」贏過「**通用主題**」，不是一個公平的比較。把我這版的設計語彙回寫成一個 `warm-dark.css` 主題，加進你的 `themes/` 資料夾，你的系統立刻就能複用它。

所以真正的結論是：**你那套 content-studio 架構是對的，該做的是持續加主題、加 skill、加 QA**。Cowork 對你的幫助不在取代這個系統，而在後段的「自動從你的內容庫產出題材 → 餵進這個系統 → 做成 live artifact 供自己追蹤」，這是你現在 pipeline 的前後延伸。

---

## 檔案位置

- `pk-cowork/index.html` — Cowork 版 HTML 原始檔
- `pk-cowork/exports/` — Cowork 版 12 張 PNG
- `pk-cowork/exports-original/` — 原版 12 張 PNG（用相同腳本匯出，條件一致）
- `pk-cowork/compare.html` — 並排對照 gallery，雙擊打開滾動瀏覽
- `pk-cowork/export.py` / `export-original.py` — 匯出腳本
