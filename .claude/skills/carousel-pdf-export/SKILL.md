---
name: carousel-pdf-export
description: Export carousel slides as a single merged PDF. Triggers: "export pdf", "匯出 pdf", "輸出 pdf", "carousel pdf".
disable-model-invocation: true
argument-hint: "[html-path-or-slug]"
allowed-tools: Read Bash(uv run *) Bash(sips *) Bash(ls *) Bash(kill *)
---

# Carousel PDF Export

將輪播 HTML 匯出為單一合併 PDF。

> **執行環境**：Python 套件透過 `uv run --with` 臨時引入，不需預先安裝。

## 輸入

| 參數 | 必要 | 說明 |
|------|------|------|
| HTML 路徑或 slug | ✅ | 要匯出的輪播內容路徑 |
| 輸出檔名 | 選填 | 預設 `<slug>.pdf` |

## 完整流程

```
HTML → Playwright 截圖 → 2x PNG → img2pdf → 合併 PDF
```

### 1. 匯出 PNG

依照 `carousel-export` skill 的步驟截圖。如果 `output/` 已有 PNG 且內容未變更，可跳過。

**驗證 PNG 品質**（必做）：

```bash
sips -g pixelWidth -g pixelHeight output/slide-01.png
```

- 預期尺寸：`2160 × 2700`（1080×1350 的 2x）
- 角落像素應為內容色，不應有灰色邊框 (229,231,235) 或 scrollbar (193,193,193)

若不符，用 `carousel-export` 重新截圖。

### 2. PNG → PDF

```bash
cd content-system/carousel/contents/<slug>/output

uv run --with img2pdf python3 -c "
import img2pdf, glob, os

png_files = sorted(glob.glob('slide-*.png'))
layout = img2pdf.get_layout_fun(
    pagesize=(img2pdf.mm_to_pt(381), img2pdf.mm_to_pt(476.25)),
    fit=img2pdf.FitMode.into
)
with open('<slug>.pdf', 'wb') as f:
    f.write(img2pdf.convert(png_files, layout_fun=layout))

size_mb = os.path.getsize('<slug>.pdf') / 1024 / 1024
print(f'Done → <slug>.pdf ({size_mb:.1f} MB, {len(png_files)} pages)')
"
```

頁面尺寸：381mm × 476.25mm = 1080 × 1350 pt（15 × 18.75 inch）。

### 3. 回報結果

告知使用者：
- PDF 路徑
- 總頁數
- 檔案大小

## 踩過的坑

| 方式 | 問題 | 結論 |
|------|------|------|
| Playwright `page.pdf()` | CSS px ≠ PDF pt（0.75 倍），1080px 輸出 810pt | 不可用 |
| `sips` → Automator `join` | join 在 Pages 根節點注入 Letter MediaBox (612×792)，造成留白 | 不可用 |
| `sips` → PyObjC Quartz 合併 | 可行但 sips 產生的單頁 PDF 結構有多餘 MediaBox | 不推薦 |
| **img2pdf**（推薦） | 一步完成，頁面結構乾淨，每頁獨立 MediaBox | ✅ 使用此方案 |
| Quartz 直接從 PNG 繪製 | 可行但無壓縮，21MB vs 16MB | 備選 |
