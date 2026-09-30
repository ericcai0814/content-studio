# 第三版（40 秒）素材與授權清單

每一項素材都記錄來源、授權與條款重點。查核日期 2026-09-30。音檔不進 git（`audio/music/`、`audio/sfx-v3/` 已列入 `.gitignore`），本檔是授權紀錄的正本；檔案可由下列直連網址重新下載，並用 SHA-256 核對。

## 平台與授權

### Mixkit（Envato 旗下）

全部配樂與音效都取自 Mixkit，不需登入即可下載。

| 授權 | 條款頁 | 重點 |
|---|---|---|
| Mixkit Stock Music Free License | https://mixkit.co/license/#musicFree | 可用於商業與非商業專案，免費；允許下載、複製、修改、散布，並在網路與社群平台（含隨選影音、廣告）公開播放。禁止：CD／DVD、電視與廣播播出、電子遊戲；禁止重新混音（remix）或放進純音樂作品、宣稱為自己的作品、登記到任何版權管理服務（如 Content ID）。 |
| Mixkit Sound Effects Free License | https://mixkit.co/license/#sfxFree | 可用於商業與非商業專案，含 YouTube、社群、廣告、電影、電視與廣播；禁止單獨轉散布（當作素材、工具或模板再發佈）、宣稱為自己的作品、登記到版權管理服務。 |
| Mixkit User Terms（2025-10-02 版） | https://mixkit.co/terms/ | 素材以現狀提供；若素材含第三方元件，使用者自行判斷是否需另取授權（第 13 條）。 |

- **免標註**：音樂與音效頁的 FAQ 都寫明「Attribution is appreciated but not required」（https://mixkit.co/free-stock-music/ 、https://mixkit.co/free-sound-effects/）。
- **對本片的意義**：Eric 以 LINE 私下傳給 Johnson 看，屬於網路傳播，在允許範圍內。剪成 40 秒並淡入淡出屬於「修改」，允許；不做 remix。若之後要在電視或實體光碟播出，配樂授權不涵蓋，需換曲。

### Pixabay Music（沒有採用）

交接指定 Pixabay 優先。2026-09-30 實測：搜尋頁可進入，但曲目音檔（`cdn.pixabay.com/audio/...mp3`，含網站自己的播放與「Free download」）對自動化瀏覽器一律回 404；不繞過它的防機器人機制，也不登入。另外，看到的曲目頁多標有「Content ID Registered」，放上 YouTube 可能被認領。改用下一順位的免費、可商用、免標註來源。原列為 CC0 來源的 FreePD（https://freepd.com/）已關站。

## 配樂候選（3 首）

曲目沒有獨立頁面；「列表頁」是可以找到該曲的 Mixkit 頁面，「直連」是 Mixkit 下載按鈕實際下載的檔案（2026-09-30 用瀏覽器網路紀錄確認）。

| 本地檔 | 曲名／作者 | 列表頁 | 直連 | 長度 | 授權 | SHA-256 |
|---|---|---|---|---|---|---|
| `audio/music/mixkit-634-your-breath.mp3`（推薦） | Your Breath／Eugenio Mininni | https://mixkit.co/free-stock-music/tag/corporate/ | https://assets.mixkit.co/music/634/634.mp3 | 3:56 | Mixkit Stock Music Free License | `8b837348a9c5b61f359fa458af832bfe957f3da461039af3ba0ba6c6f467ed0e` |
| `audio/music/mixkit-623-deep-urban.mp3` | Deep Urban／Eugenio Mininni | https://mixkit.co/free-stock-music/?q=deep+urban | https://assets.mixkit.co/music/623/623.mp3 | 4:49 | Mixkit Stock Music Free License | `ac7e28f0cdd6c607df199c759f34ca66cfebd881ea61c26473fb4cecebe64fa8` |
| `audio/music/mixkit-720-new-bass-01.mp3` | New Bass 01／Lily J | https://mixkit.co/free-stock-music/tag/technology/ | https://assets.mixkit.co/music/720/720.mp3 | 1:36 | Mixkit Stock Music Free License | `6389a142c19ca427a32517a815f06eeaa2b6be0512edb5137c502bf840ac0f63` |

Mixkit 標籤：634 是 Corporate Music／Electronica／Positive／Futuristic；623 是 House／Tech House／Hypnotic／Driving；720 是 Underscore／Positive／Futuristic／Industry。三首都是器樂（依 Mixkit 分類與標籤；人聲有無需試聽確認）。

試聽檔（取各曲分析出的 20 小節，尾端 1.5 秒淡出）：`audio/music/preview-mixkit-634-20bars.m4a`、`preview-mixkit-623-20bars.m4a`、`preview-mixkit-720-20bars.m4a`。

## 音效（5 種，Mixkit Sound Effects Free License）

直連是下載按鈕給的 WAV（不是頁面上的 `-preview.mp3` 試聽檔）。

| 本地檔 | 名稱 | 列表頁 | 直連 | 用在（`docs/STORYBOARD-v3.md`） | SHA-256 |
|---|---|---|---|---|---|
| `audio/sfx-v3/mixkit-1530.wav` | Paper slide | https://mixkit.co/free-sound-effects/paper/ | https://assets.mixkit.co/active_storage/sfx/1530/1530.wav | 第 2 小節，匹配剪接到公文紙 | `2e945267f56208884153867d062838888e6bddc92b512e130aa9566255ad36bb` |
| `audio/sfx-v3/mixkit-166.wav` | Fast small sweep transition | https://mixkit.co/free-sound-effects/?q=whoosh | https://assets.mixkit.co/active_storage/sfx/166/166.wav | 第 4 小節，藍圖遮罩顯現 | `ca5a0206a7e6b12893a5727cb98a9d43ab02893153465eb21d43fb7b9e6616c3` |
| `audio/sfx-v3/mixkit-1489.wav` | Air woosh | https://mixkit.co/free-sound-effects/whoosh/ | https://assets.mixkit.co/active_storage/sfx/1489/1489.wav | 第 5 小節，峰值對齊 drop | `fdc4f87eb2c6d29ec3567b299fdc3b2aeea2432afe27801db80c496bda084499` |
| `audio/sfx-v3/mixkit-1125.wav` | Typewriter soft click | https://mixkit.co/free-sound-effects/click/ | https://assets.mixkit.co/active_storage/sfx/1125/1125.wav | 第 12、14 小節，W0 與 W8 蓋印 | `04837e10d65b23aede5626d833e4e46001e90e908817200da1dcf21a51d36205` |
| `audio/sfx-v3/mixkit-3109.wav` | Relaxing bell chime | https://mixkit.co/free-sound-effects/chime/ | https://assets.mixkit.co/active_storage/sfx/3109/3109.wav | 第 19 小節，光點落定 | `73ae1f6f85bd82729132429799df781d738a95d69165ab89d567cd70569d418d` |

每個音效的起音與峰值偏移由 `scripts/analyze-music.py` 量出，記在 `data/music-analysis.json` 的 `sfx`。第三版不再使用 `audio/sfx.sh` 的合成音效。

## 字型（沿用 105 秒版，已在 git）

| 檔案 | 字族 | 授權 | 授權檔 | 上游專案 |
|---|---|---|---|---|
| `app/public/fonts/NotoSansTC.woff2` | Noto Sans TC（可變字重） | SIL Open Font License 1.1 | `app/public/fonts/OFL-NotoSansTC.txt`（Copyright 2014-2021 Adobe，保留字型名稱 'Source'） | https://github.com/notofonts/noto-cjk |
| `app/public/fonts/IBMPlexMono-{Regular,Medium,SemiBold}.woff2` | IBM Plex Mono | SIL Open Font License 1.1 | `app/public/fonts/OFL-IBMPlexMono.txt`（Copyright © 2017 IBM Corp.，保留字型名稱 "Plex"） | https://github.com/IBM/plex |

OFL 允許商業使用、嵌入與隨作品散布，不需在片中標註；限制是不得單獨販售字型檔，改作版不得沿用保留字型名稱。兩個 woff2 的實際下載網址在加入時（commit `77e8427`）沒有記錄：未確認，授權以隨附的 OFL 檔為準。

## 其他

- 畫面全部由本片程式算繪（`app/`，引擎取自 pdoom-video，MIT，聲明在 `LICENSE-pdoom`），不用圖庫影像或影片。
- 片中文字全部取自 `data/cues.json`，事實正本是 dept-brain.md（`bun scripts/check-storyboard.ts`、`bun scripts/check-facts.ts`）。
