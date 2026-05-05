# AROVA-AI Handoff Dossier — v2

把 `/Users/ericcai/project/arova-ai/.claude/doc/handoff-prep.md` 轉成可互動的 editorial landing page。Vol.01 含 6 道待確認問題（Q1 / Q3 / Q4 / Q7 / Q8 / Q9，其中 Q9 含 9 子題）+ 9 條深掃發現的技術問題（Part 4 純 FYI）。回覆同步寫入 Google Sheet 並發到指定 Slack thread。

進入頁面前需先選身分（PM / Kyle / 其他），名字在身分為「其他」時必填；身分存於 localStorage，可從側欄 [switch] 切換。

## 檔案結構

```
arova-handoff/
├── index.html                # source（link 跨層 ../../base.css；Google Fonts 走 CDN）
├── app.css                   # editorial design system（含 base.css 需要的所有 token alias）
├── app.js                    # identity gate、tabs、表單送出、progress
├── build.py                  # 產生 dist/（uv run python 驅動，4 檔）
├── apps-script/Code.gs       # Google Apps Script 後端
├── doc/landing-page-plan.md  # 設計文件
├── dist/                     # build 產物：index.html / base.css / app.css / app.js（可直接部署）
└── README.md
```

v2 起 app.css 自帶完整 design tokens，不再依賴 `themes/claude.css`，dist/ 從 5 檔減為 4 檔。

## 一次性準備

### 1. Google Sheet
新建一張 Google Sheet，新增一個分頁名 **`answers`**，第一列填入欄位標題：

```
timestamp | questionId | respondentRole | respondentName | questionType | answerValue | note
```

複製 Sheet 的 ID（網址 `/d/<這段>/edit`）→ `SHEET_ID`。

### 2. Slack parent thread
1. 進入要收集回覆的 Slack channel
2. 手動發一則 parent 訊息（例：「AROVA-AI Handoff 回覆收集中，所有回覆會接在此 thread」）
3. 滑鼠移到該訊息 → 右鍵 → **Copy link**
4. 複製到的網址形如：`https://xxx.slack.com/archives/C01ABC/p1729750000123456`
5. 末段 `p1729750000123456` 轉成 `1729750000.123456`（去掉開頭 `p`，倒數第 7 位前插小數點）→ 這就是 `SLACK_PARENT_TS`

### 3. Slack incoming webhook
在同一個 channel 建立 incoming webhook，記下 URL → `SLACK_WEBHOOK_URL`。

### 4. Google Apps Script
1. 開 [script.google.com](https://script.google.com) → New project
2. 把 `apps-script/Code.gs` 內容貼上去
3. 填入三個常數：`SHEET_ID`、`SLACK_WEBHOOK_URL`、`SLACK_PARENT_TS`
4. （可選）執行 `testPost` 函式手動驗證 Sheet append + Slack 都會動
5. **Deploy → New deployment → Web app**
   - Description：隨意（例 v1）
   - Execute as：**Me**
   - Who has access：**Anyone**
6. 取得 Web app URL → `APPS_SCRIPT_URL`

### 5. 寫進 app.js
打開 `app.js`，把頂部 `APPS_SCRIPT_URL` 換成上一步取得的 URL：

```js
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfyc.../exec";
```

## Build + 部署

```bash
cd content-system/landing-page/contents/arova-handoff
uv run python build.py
```

完成後 `dist/` 包含四個檔：`index.html base.css app.css app.js`。整個資料夾可直接部署：

| 平台 | 步驟 |
|---|---|
| **本機驗證** | `cd dist && uv run python -m http.server 8000`，瀏覽器開 `http://localhost:8000` |
| **Vercel** | `npx vercel dist/` 或拖放 dist/ 到 Vercel 後台 |
| **Cloudflare Pages** | 後台選 Direct Upload，把 dist/ 內容拖上去 |
| **GitHub Pages** | 把 dist/ 內容 push 到 `gh-pages` 分支根目錄 |

## 驗證 checklist

### Build / 資產
- [ ] dist/ 四個檔都存在（index.html / base.css / app.css / app.js）
- [ ] 開頁面後 console 無 error
- [ ] Network panel：本地 CSS / JS 走 `./*` 相對路徑且 200；Google Fonts 三個 family（Instrument Serif / Schibsted Grotesk / JetBrains Mono）載入完成

### Identity gate
- [ ] 清掉 localStorage 後重整 → modal 強制顯示，背景不可滾動
- [ ] 不選身分按進入 → 阻擋，gate 顯示「請選擇身分」
- [ ] 選「其他」+ 名字空白 → 阻擋，欄位 label 出現紅 `*`
- [ ] 選「其他」+ 填名字「Tom」+ 進入 → modal 消失，sidebar 出現「AS 其他 · Tom」
- [ ] 點 sidebar [switch] → modal 重開、pre-fill「其他」+「Tom」

### 內容
- [ ] TOC 4 個錨點點擊後平滑捲動到對應 section（01 BG / 02 INV / 03 Q / 04 ISS）
- [ ] 策略判斷 (4) / 工作交接 (2) / 全部 (6) 三個 tab 切換正常，URL hash 同步（hash key：`strategic` / `operational` / `all`）
- [ ] Q1 / Q7 / Q8 推論 blockquote 顯示正常（左 rust border、推論依據條列）
- [ ] Q9 9 個子題分組顯示（A 本機資產 / B mastra-learn / C sales-kit / D 開發環境 / E 後續追問）
- [ ] 依賴圖 SVG 顯示，ghost 節點 (ewai-omni / EWAI FLOW) 為虛線框
- [ ] Part 4 priority chips：P0 solid rust-deep、P1 rust outlined、P2 ink outlined、P3 dotted muted
- [ ] Part 4 各 details 展開/收合 OK

### 表單送出（後端鏈路）
- [ ] 任意題以 PM 身分送出 → Sheet `answers` append 一列、Slack thread 收到 reply（不是 channel 新訊息）、按鈕變綠色「已送出 ✓」、sidebar progress 計數+1
- [ ] Q9 填 3 個子題 + 全部送出 → Sheet 一列、`answerValue` 欄是 JSON 字串 `{"9.1":"...","9.2":"","9.3":"..."}`、其他子題為空字串
- [ ] 切到「全部」tab、以 Kyle 身分送出 Q1 → Sheet 出現一列 `respondentRole=Kyle, questionId=Q1`（題目本身不分受眾，但送出時的 `respondentRole` 仍以 identity gate 選定的身分為準）

### 視覺 QA
- [ ] 1440 寬：三欄 layout 正常（sidebar 240px sticky）
- [ ] 1024 寬：sidebar 收合成 top bar，TOC 並排
- [ ] 768 / 375 寬（手機）：所有元件可閱讀，tabs 可水平捲動
- [ ] 字型成功載入（Masthead h1 是 Instrument Serif 而非 fallback serif）
- [ ] `prefers-reduced-motion` 啟用時，page-load fade-up 與 tab-slide 動畫停用

## 修改題目

題目內容直接寫在 `index.html` 裡（沒有獨立 data 檔）。要新增 / 修改題目時：

1. 編輯對應 `<article class="question" data-qid="...">` 區塊
2. 若新增題號，記得到 `app.js` 的 `TAB_TARGETS`（strategic / operational / all 三組）把 qid 加進對應 tab，並更新 `TOTAL_QUESTIONS` 常數與頁面 progress 區塊「/ 6」字面值；題目卡片的 `q-target` chip 改用 `q-target--strategic` 或 `q-target--operational` 對應分組
3. 題型支援四種：`stance`（同意/不同意/部分同意）、`abc`（三選一）、`open`（純 textarea）、`subtopics`（多 textarea，name 用子題編號如 `9.1`）
4. 重跑 `uv run python build.py`、重新部署 dist/

## 維護注意

- `app.js` 的 `APPS_SCRIPT_URL` 與 `Code.gs` 的三個常數**不要 commit 公開** repo（含 webhook URL、Sheet ID 等）。如要分享原始碼，先把這些值換成 `<FILL_ME_IN>` 占位
- Apps Script 用 `Anyone` access 是為了讓未登入瀏覽器也能 POST。Sheet 本身不對外公開，只是 webhook 接收口開放
- 身分（identity）存在每個瀏覽器的 localStorage（key: `arova-identity`），切換瀏覽器 / 裝置 / 隱身分頁需各自選一次。已答進度（progress）存在 sessionStorage（重整保留、關分頁清掉），純前端顯示用，與 Sheet 後端記錄獨立
- `<FILL_ME_IN>` 仍存在於 `app.js` 時，前端送出會跳「APPS_SCRIPT_URL 尚未設定」的錯誤，方便辨識未配置狀態
