---
name: carousel-export
description: Batch-screenshot carousel HTML pages and export as individual PNGs. Triggers: "export carousel", "screenshot carousel", "export slides".
disable-model-invocation: true
argument-hint: "[html-path-or-slug]"
---

# Carousel Export

將輪播 HTML 的每一頁截圖匯出為獨立的 2x PNG 檔案。

## 輸入

| 參數 | 必要 | 說明 |
|------|------|------|
| HTML 路徑或 slug | ✅ | index.html 路徑，或 `contents/` 下的資料夾名稱 |
| 輸出目錄 | 選填 | 預設 `<html所在目錄>/output/` |

## 輸出規格

- 尺寸：2160 × 2700 px（1080×1350 的 2x retina）
- 格式：PNG
- 命名：`slide-01.png`, `slide-02.png`, ...
- 內容應填滿整張圖，無灰色邊框、無 scrollbar

## 執行步驟

### 1. 確認檔案存在

解析路徑 — 如果給的是 slug，展開為 `content-system/carousel/contents/<slug>/index.html`。

### 2. 啟動本地 HTTP Server

Playwright MCP 不支援 `file://` 協定，需要起本地 server：

```bash
cd content-system/carousel && python3 -m http.server 8765 &
```

### 3. 設定 Viewport

```
viewport: 1080 × 1350, deviceScaleFactor: 2
```

用 Playwright MCP `browser_resize` 設為 1080×1350。

### 4. 導覽到頁面

用 Playwright MCP `browser_navigate` 開啟：

```
http://localhost:8765/contents/<slug>/index.html
```

### 5. 逐頁截圖

用 Playwright MCP `browser_run_code` 執行：

```javascript
async (page) => {
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(2000);

  const pages = await page.$$('.page');
  const outDir = '<ABSOLUTE_OUTPUT_DIR>';

  for (let i = 0; i < pages.length; i++) {
    await page.evaluate((idx) => {
      // 清除 body 的 padding/background/scrollbar
      document.body.style.padding = '0';
      document.body.style.margin = '0';
      document.body.style.gap = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.background = 'transparent';
      document.querySelectorAll('.page').forEach((p, j) => {
        p.style.display = j === idx ? 'flex' : 'none';
        p.style.boxShadow = 'none';
        p.style.margin = '0';
      });
    }, i);
    await page.waitForTimeout(500);

    const el = (await page.$$('.page'))[i];
    const num = String(i + 1).padStart(2, '0');
    await el.screenshot({
      path: `${outDir}/slide-${num}.png`,
      type: 'png'
    });
  }

  return `Done: ${pages.length} slides`;
}
```

**關鍵：body 樣式清理**

base.css 的 body 有 `padding: 40px; background: #e5e7eb; overflow-x: auto`。
截圖前必須全部歸零，否則灰色邊框和 scrollbar 會被截進 PNG。

### 6. 停止 HTTP Server

```bash
kill <SERVER_PID>
```

### 7. 回報結果

告知使用者：
- 匯出了幾張圖
- 輸出路徑
- 每張圖的尺寸（應為 2160×2700）

## 驗證

匯出後可用 sips 確認尺寸：

```bash
sips -g pixelWidth -g pixelHeight output/slide-01.png
# 預期：pixelWidth: 2160, pixelHeight: 2700
```

角落像素應為內容色（如 cream ~244,243,236），不應出現灰色 (229,231,235) 或 scrollbar 灰 (193,193,193)。
