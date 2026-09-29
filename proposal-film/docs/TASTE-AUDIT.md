# Taste 審查紀錄（design-taste-frontend §14 Pre-Flight）

審查日期：2026-09-30。對象：提案短片 final（105 秒）與 `app/src/`、`data/cues.json`。
標準：`~/.claude/skills/design-taste-frontend/SKILL.md`。這支是影片，不是網頁，所以每條規則先判斷「適用」或「不適用」，適用的再換成畫面上的等價物來檢查。
時間點以片中秒數表示；「plate」即 `data/cues.json` 的 `plates[]`（8 張，視為 8 個 section）。

判定用語：

- **合格**：適用，而且目前符合。
- **例外**：適用，規則本身留有例外路徑（brief 明訂、品牌色等），並寫明理由。
- **已修**：適用，原本不合格，本輪修正（前後對照見文末）。
- **不適用**：網頁專屬項目，寫明理由。
- **需 Eric 決定**：修正必須改文字。本輪沒有這類項目。

## 設計定位與參數

- **Design Read（§0.B）**：Reading this as: 內部提案短片 for 老闆 Johnson（手機直式自己看、無旁白、無配樂）, with a 冷靜工程報告 language, leaning toward 程式渲染的 plate 引擎（pdoom-video 做法）加瑞士網格與克制動態。
- **Dials（§1）**：`DESIGN_VARIANCE 6 / MOTION_INTENSITY 5 / VISUAL_DENSITY 3`。
  - VARIANCE 6：「calm / editorial」一列是 5-6。版面非對稱、左對齊，但每個 plate 的文字區固定在左下，方便手機上找字。
  - MOTION 5：同一列是 3-4。影片本身就是動態媒介，所以加 1；每個動作都有敘事理由（見下方「動態理由」）。
  - DENSITY 3：每張 plate 只講一件事，大量負空間。

## §14 逐條

| # | 規則 | 判定 | 證據 | 處置 |
|---|---|---|---|---|
| 1 | Brief inference 一行宣告 | 合格 | 本檔「設計定位」 | 無 |
| 2 | Dial 明確且有理由 | 合格 | 本檔「設計定位」 | 無 |
| 3 | Design system 選擇或誠實標示美學 | 合格 | 影片不適用網頁 design system；美學誠實標示為 pdoom-video 的 plate 引擎（`docs/ENGINE.md:3`，MIT 聲明 `LICENSE-pdoom`）。converge 的玻璃是近似做法，已在程式註解說明（`app/src/scenes/converge.ts:14`），符合 §2.B「標明 approximation」 | 無 |
| 4 | Redesign 模式與稽核 | 不適用 | 原創影片，不是改版既有網站 | 無 |
| 5 | 零 em-dash／en-dash | 已修 | 可見文字（59 段 `text`）原本就是 0。`cues.json` 的 `source` 欄有 4 個 en-dash（dept-brain 原文日期區間，`schedule.s1`-`s4`） | 改成不含日期區間 dash 的原文子字串，仍可在 dept-brain.md 找到（`data/cues.json:79-85`）；check-facts 0 失敗。預覽 UI（`app/src/main.ts:116,160`）只在瀏覽器預覽的除錯列出現，不進成片，不改 |
| 6 | Page Theme Lock | 例外 | ink 底為主；copies（10-25 秒）、schedule（75-90 秒）是 bone 紙（`data/cues.json` plates 的 `paper: true`） | 見下方「Theme Lock 說明」 |
| 7 | Color Consistency Lock（單一強調色） | 例外 | 強調色只有 signal 青綠 `#00979C`（`app/src/engine/palette.ts:12`），全片用在線、光點、亮起的欄位、印章框、DOGFOODING。redline `#B0382B` 只在 copies（`palette.ts:13`） | redline 不是第二個強調色，而是計畫明訂的「紅批註」（計畫 Plates 表第 2 列）：紙本校正的慣例色，只出現在一個 plate、不發光、不跨 plate。amber 0 處 |
| 8 | Shape Consistency Lock | 合格 | 全片直角：所有容器是 `fillRect`/`strokeRect`，roundRect 0 處。圓形只有專案節點（`converge.ts:127`、`dogfood.ts:60`）與光點，都是圖上的「點」，不是有圓角的容器 | 無 |
| 9 | Button Contrast Check → 畫面文字對比 | 已修 | WCAG 計算：signal 字在 bone 上 2.94:1，低於大字門檻 3:1（schedule 印章字，77.5-90 秒）。其餘：ink/bone 16.4、ash/ink 6.8、graphite/bone 5.6、signal/ink 5.6、redline/bone 5.0 | 印章字改為 ink（16.4:1），印章框維持青綠（`app/src/scenes/schedule.ts:68`） |
| 10 | CTA Button Wrap | 不適用 | 片中沒有按鈕 | 無 |
| 11 | Form Contrast Check | 不適用 | 片中沒有表單 | 無 |
| 12 | Serif discipline | 合格 | 只用 Noto Sans TC 與 IBM Plex Mono（`app/src/scenes/_motifs.ts:48-54`），0 個襯線字 | 無 |
| 13 | Premium-consumer palette | 不適用 | brief 不是 premium-consumer。附記：bone `#EEE9DF` 接近該禁用清單的 `#efeae0`，但這裡是工程圖紙的紙色，搭配冷色 ink 與青綠，不是米色加黃銅加濃縮咖啡的組合 | 無 |
| 14 | Italic descender clearance | 不適用 | 全片沒有斜體 | 無 |
| 15 | Hero fits viewport → 開場標題卡 | 合格 | 標題 1 行（84px）加 1 行標籤，左對齊，在 title-safe 內（layout warnings 0） | 無 |
| 16 | Hero top padding | 不適用 | 影片畫格沒有捲動與 padding；標題位置由構圖決定（`open.ts:8`，y=544） | 無 |
| 17 | Hero stack discipline（≤ 4 個文字元素） | 合格 | 開場只有 2 個文字元素：標題與「部門共享大腦提案｜軟體部」 | 無 |
| 18 | Eyebrow count（機械計數） | 合格 | 全大寫等寬小標共 2 個：`halfway.tsmc`「TSMC」（`data/cues.json:48`）、`dogfood.tag`「DOGFOODING」（`data/cues.json:94`）；上限 ceil(8/3) = 3 | 無；計數方式見下方「Eyebrow 計數」 |
| 19 | Split-Header Ban | 合格 | 沒有「左大字、右小段說明」的版式；每張 plate 的大字與註解上下疊放 | 無 |
| 20 | Zigzag Alternation Cap | 不適用 | 沒有圖文左右交替的 section | 無 |
| 21 | No Duplicate CTA Intent | 不適用 | 片中沒有 CTA；也刻意不放請 Johnson 決定的內容（計畫 plate 8） | 無 |
| 22 | Logo wall = logo only | 不適用 | 沒有 logo wall | 無 |
| 23 | Bento Background Diversity | 不適用 | 沒有 bento | 無 |
| 24 | Logo wall 位置與真 logo | 不適用 | 沒有 logo wall | 無 |
| 25 | Copy Self-Audit | 合格 | 59 段逐段重讀（清單見下方「文案重讀」）：無語病、無指涉不明、無 AI 腔；全部可追溯到 dept-brain.md（check-facts：verbatim 41、anchored 18、failed 0） | 無；不改文字 |
| 26 | Motion motivated | 合格 | 逐項理由見下方「動態理由」 | 無 |
| 27 | Marquee max one | 不適用 | 沒有跑馬燈 | 無 |
| 28 | Navigation 一行 | 不適用 | 沒有導覽列 | 無 |
| 29 | Section-Layout-Repetition | 合格 | 8 張 plate 各用不同視覺語彙：光線、公文紙、藍圖、3D 線框、玻璃平板、路線圖、線稿圖、光點（TREATMENT Plates 表）。文字區固定左下是刻意的閱讀位置，不是版式重複 | 無 |
| 30 | Bento rhythm 與 cell 數 | 不適用 | 沒有 bento | 無 |
| 31 | Long lists 用對元件 | 合格 | 最長的清單是 schedule 的 4 個里程碑，已用路線圖加印章，不是逐行清單 | 無 |
| 32 | Real images／不做假截圖／不手繪裝飾 SVG | 不適用 | 計畫指定全片程式渲染（計畫「參考作品帶來的做法」），畫面本身就是繪製的圖。copies 的灰條代表文件內文，是示意圖，不是冒充產品截圖 | 無 |
| 33 | 圖上不疊 pill／標籤 | 合格 | 沒有疊在圖上的 `PLATE · 02` 類標籤；plate 編號只存在程式註解 | 無 |
| 34 | 不放裝飾性圖片出處 | 不適用 | 沒有照片 | 無 |
| 35 | 不放版本 footer | 合格 | 沒有版本字串（`v1.0.0` 只在 source 摘錄，不上畫面） | 無 |
| 36 | 不放 micro-meta 句 | 合格 | 大字下方沒有「這些都是…」式的後設說明 | 無 |
| 37 | Hero 底部不放裝飾文字列 | 合格 | 開場只有品牌列，內容是真實的提案名與部門 | 無 |
| 38 | 不放浮在右上的小字 | 合格 | 右側文字（copies 計數、halfway 的 TSMC 數字）與主體同一網格，垂直對齊主要物件，不是角落浮字 | 無 |
| 39 | 不用有底軌的進度條做比較 | 合格 | schedule 的灰線是路線本身（W0-W8 刻度），青綠是光點走過的路；不是「X / Y」比較圖 | 無 |
| 40 | 不放地點／時間／天氣列 | 合格 | 無 | 無 |
| 41 | 不放捲動提示 | 不適用 | 影片不捲動 | 無 |
| 42 | Hero 不放版本標籤 | 合格 | 無 BETA、V0.x | 無 |
| 43 | 不用 section 編號 eyebrow | 合格 | 畫面上沒有 `01 / 08` 類編號；crop marks 預設關閉（`app/src/engine/post.ts:50`）。W0-W8 是時程內容本身 | 無 |
| 44 | 不放裝飾點 | 已修 | copies 每條紅批註前有一條紅色短條（原 `copies.ts:96-97`），和引線重複，屬於「每列前的裝飾記號」。其餘圓點都有語意：光點（母題）、專案節點、例外標籤 | 拿掉紅短條，批註左緣對齊 X0（`app/src/scenes/copies.ts:17`） |
| 45 | 不在每列加上下框線 | 合格 | 沒有逐列框線的表 | 無 |
| 46 | Content density／不造假精確數字 | 已修 | 所有數字都出自 dept-brain.md（check-facts 數字警告 0）。meanings 的尺寸線沒有數值，是假的工程精確感（原 `meanings.ts:45-55`） | 刪除尺寸線（見「交接指定的額外項目」crosshair 列） |
| 47 | Quotes ≤ 3 行 | 不適用 | 沒有引言 | 無 |
| 48 | Motion claimed = motion shown | 合格 | MOTION 5，影片全程有動態 | 無 |
| 49 | GSAP sticky-stack／horizontal-pan | 不適用 | 沒有捲動 | 無 |
| 50 | 不用 scroll listener | 不適用 | 沒有捲動 | 無 |
| 51 | Reduced motion | 不適用 | 影片檔沒有使用者偏好設定 | 無 |
| 52 | Dark mode 雙模式 | 不適用 | 影片畫格是固定的；明暗見 #6 | 無 |
| 53 | Mobile collapse → 手機可讀性 | 合格 | 等價檢查：title-safe 96px、最小字級 30px，由 `drawCue()` 檢查（`_motifs.ts:28-29`），layout warnings 0；母題線 2 倍寬（`_motifs.ts:143`） | 無 |
| 54 | Viewport stability | 不適用 | 網頁專屬 | 無 |
| 55 | useEffect cleanup | 不適用 | 不是 React | 無 |
| 56 | Empty／loading／error 狀態 | 不適用 | 影片沒有互動狀態 | 無 |
| 57 | Cards omitted | 合格 | 只有 dept-brain 核心是實心框，代表「唯一版本」這個實體；其餘用線與負空間分組 | 無 |
| 58 | Icons 只用允許的圖示庫 | 不適用 | 片中沒有圖示；dogfood 的產品輪廓是圖解的一部分 | 無 |
| 59 | Motion 隔離在 client leaf | 不適用 | 不是 React | 無 |
| 60 | No AI Tells（§9，含等價物） | 已修 | 見下方「§9 AI Tells」 | 見該節 |
| 61 | Core Web Vitals | 不適用 | 影片 | 無 |
| 62 | One design system | 合格 | 一套 plate 引擎、一份 palette、一組字體、一套緩動 | 無 |

## 交接指定的額外項目

| 規則 | 判定 | 證據 | 處置 |
|---|---|---|---|
| LILA（無紫藍霓虹） | 合格 | 強調色是青綠 `#00979C`，沒有紫、藍漸層 | 無 |
| 強調色飽和度 < 80%（§4.2） | 例外 | `#00979C` 的 HSL 飽和度是 100%。這是 ewill 品牌色，§8.B「Brand fidelity：不要把品牌色降飽和」優先 | 無 |
| 無 neon／外發光（§9.A） | 例外 | 只有青綠線 bloom（`post.ts` bloom 門檻 1.0，只有 HDR 青綠超過）。計畫明訂「只有它會發光」，這是全片母題 | 無 |
| 無純黑 | 已修 | 修前：片尾淡出乘到 0，104.95 秒有 63% 像素是 `#000000` | fade 改成混到 ink（`app/src/engine/post.ts:146`）；修後 104.95 秒純黑像素 0%，中位數 (10,10,11) |
| 無純白 | 合格 | 抽 5、23、103、104.95 秒，`#FFFFFF` 像素皆 0 | 無 |
| 同字族強調 | 合格 | 強調只用 Noto Sans TC 的字重（700 display、600 headline、500 body），沒有混入他族字 | 無 |
| 無無限循環與粒子 | 合格 | scenes 內無 `Math.random`／`Date.now`；`sin`／`cos` 只用於相機球座標與旋轉（`halfway.ts:70,100`），不是週期動畫。顆粒是後製膠片顆粒，不是粒子系統 | 無 |
| crosshair／hairline 裝飾線（§9.F） | 已修 | meanings 原本有定位十字 15 個、雙層圖框、無數值尺寸線，都不組織內容 | 刪除（`app/src/scenes/meanings.ts:16-24`）。網格保留，見下方說明 |

### Theme Lock 說明（#6）

§4.11 的例外是：brief 明訂「Color Block Story」，而且是刻意的構圖。這兩點都成立：

1. **brief 明訂**：計畫配色段寫「部分 plate 反轉成 bone 紙配 ink 線，全片形成明暗交替的節奏」，Eric 在 2026-09-30 定稿。
2. **有一條規則，不是隨機交替**：bone 紙只給「紙上的東西」。copies 是被複製的公文，schedule 是寫在紙上的承諾。ink 是系統與光線的世界。
3. **轉場是剪接點**：兩次都在小節線上硬切，觀眾知道換了一張 plate。網頁規則擔心的是「捲到一半像走進別的網站」，影片的換場本來就是明確的段落切換。

與規則字面的差距：§4.11 寫「allowed once per page」，本片有兩段 bone（兩進兩出）。因為兩段套用同一條語意規則，判為例外成立，不改。

### Eyebrow 計數（#18）

- 規則的對象是「大字上方、全大寫、字距加寬的小標」。上限是 ceil(8/3) = 3，開場算 1。
- 本片符合形狀的只有 2 個：
  - `halfway.tsmc`「TSMC」：數字欄的欄名，說明下面 3 個數字屬於哪個專案。
  - `dogfood.tag`「DOGFOODING」：計畫明訂的字（計畫 Plates 表第 7 列）。
- 開場與結尾的「部門共享大腦提案｜軟體部」是中文品牌列，§4.7 允許 hero 用 brand strip。算進去是 4 個，但結尾不是 section 標題上的 eyebrow，而是片尾署名，所以不計。
- label 樣式字距只有 1px（`_motifs.ts:54`），不是 eyebrow 典型的 0.18em 以上。
- 結論：2 個，≤ 3，合格。

### 網格保留的理由（meanings）

- 計畫指定 meanings 的視覺語彙是「藍圖線稿」。網格是藍圖紙的材質，地位等同 copies 的 bone 紙色。
- 刪掉的是疊在材質上、又不組織內容的東西：定位十字、雙層圖框、沒有數值的尺寸線。
- 已知風險（沿用上一輪回報）：細網格在 LINE 再壓縮後可能變糊，需要 Eric 用手機確認。

### §9 AI Tells：畫面上的等價物

| 項目 | 判定 | 證據 |
|---|---|---|
| decorative dots | 已修 | 紅批註前的紅短條拿掉（#44）。光點、專案節點、例外標籤都有語意 |
| section-number eyebrows | 合格 | 無（#43） |
| micro-labels | 合格 | 等寬 label 共 30 段，都是資料標籤：專案名、週次、欄名、核心名（`cues.json` role=label） |
| 假精確數字 | 已修 | 數字全部有出處；刪掉沒有數值的尺寸線（#46） |
| decoration strips | 合格 | 無 |
| crosshair／grid 裝飾 | 已修 | 見上表 |
| generic names／Acme | 合格 | 專案名 TSMC、TII、PMOS、OAC、TOPS 都是真的 |
| filler verbs | 合格 | 無 elevate／seamless 類用詞 |
| emoji | 合格 | 可見文字 0 個 |
| middle-dot 過量 | 合格 | 無 `·`；分隔用全形「｜」，每行最多 1 個 |
| vertical rotated text | 合格 | 印章只斜 −0.03 到 +0.006 rad，模擬蓋印，不是直排裝飾 |

### 動態理由（#26）

每個動作一句話：

- open：光點點燃，把視線拉到起點；線拉過去時把標題寫出來（敘事：一條經驗開始）。
- copies：逐拍蓋印 5 份，表示同一份規範被複製；複本各自漂移，表示版本逐漸分岔（計畫「各自漂移」）；批註與引線依序出現，逐條指出問題。
- meanings：欄位亮起，線從欄位分成 4 條，表示一個欄位裂成 4 種意思。
- halfway：5 份線框滑進同一位置，表示骨架已經重合；相機一次緩慢移動，讓觀眾看出重合是立體的，不是剛好投影重疊。
- converge：平板原本角度各異（各自的版本），轉正後沿線收攏成一個核心（部門唯一版本）；結案線繞回核心一次（寫回經驗）。
- schedule：光點沿路線前進，經過時蓋章，表示時程依序兌現。
- dogfood：線從核心繞部門一圈回來（先用在自己身上）；節點重新亮起（解決自己的痛點）；最後才亮起產品（驗證過才產品化）。
- outro：線收回成光點，與開場首尾呼應。

### 文案重讀（#25）

59 段全部重讀一次，結論是不改：

- 句子都完整，沒有語病。
- 指涉都清楚。「只剩規則還沒有」緊接在「骨架已經共用」之後，意思完整。
- 沒有 AI 腔。沒有「悄悄地」「不只是…更是…」這類句型。
- 語域：大字是中文陳述句，等寬字是資料標籤，這是計畫定的「大字旁邊配小的等寬註解」，不算混用語域。

附記（不是規則違反，供 Eric 參考）：W0-W8、MD5、PoC 對 Johnson 可能是行話。這三個都是計畫原文，改字要由 Eric 決定，本輪不動。

## 本輪修正（前後對照）

| # | 檔案 | 修前 | 修後 |
|---|---|---|---|
| F1 | `data/cues.json` | schedule 4 段的 `source` 含 en-dash 日期區間 | 改成不含 dash 的原文子字串，仍逐字存在於 dept-brain.md |
| F2 | `app/src/engine/post.ts` | 片尾淡出到純黑 `#000000` | 淡出到 ink `#0A0A0B` |
| F3 | `app/src/scenes/schedule.ts` | 印章字是青綠，在 bone 上 2.94:1 | 印章字 ink（16.4:1），框仍是青綠 |
| F4 | `app/src/scenes/copies.ts` | 每條紅批註前有紅色短條 | 拿掉，批註左緣對齊版心 X0 |
| F5 | `app/src/scenes/meanings.ts` | 藍圖有定位十字、雙圖框、無數值尺寸線 | 只留網格 |

「適用且不合格」剩 0；「需 Eric 決定」0。
