/**
 * AROVA-AI Onboarding Handoff — 表單回覆收集後端
 *
 * ── Google Sheet 建立步驟 ──────────────────────────────────
 *  1. 開啟 Google Sheets (sheets.new) 建新試算表
 *  2. 分頁名稱改為「answers」（底部分頁標籤雙擊重命名）
 *  3. 在 A1:G1 依序填入欄位標題：
 *       timestamp | questionId | respondentRole | respondentName | questionType | answerValue | note
 *  4. 從網址列複製 Sheet ID（/d/<ID>/edit 中間那段）→ 填入 SHEET_ID
 *
 * ── Apps Script 部署步驟 ──────────────────────────────────
 *  1. script.google.com → New project → 貼上本檔
 *  2. 填入 SHEET_ID 常數
 *  3. Deploy → New deployment → Web app
 *       Execute as: Me
 *       Who has access: Anyone
 *  4. 取得 Web app URL →
 *       填進 ../app.js 的 APPS_SCRIPT_URL（doPost，問題送出用）
 *       填進 ../responses.js 的 APPS_SCRIPT_URL（doGet，回覆瀏覽用）
 *
 * ── Sheet 欄位（由 doPost append、doGet 讀取）──────────────
 *   timestamp | questionId | respondentRole | respondentName | questionType | answerValue | note
 */

const SHEET_ID = "1N41IMl7Vq-dpWBiNUr4GSzzMb31YePtc8X63GysgCXI";

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("answers");
    if (!sheet) throw new Error("sheet 'answers' not found");
    const vals = sheet.getDataRange().getValues();
    if (vals.length < 2) return jsonResponse_({ ok: true, rows: [] });
    const headers = vals[0];
    const rows = vals.slice(1).map(function(row) {
      const obj = {};
      headers.forEach(function(h, i) {
        obj[h] = row[i] instanceof Date ? row[i].toISOString() : row[i];
      });
      return obj;
    });
    return jsonResponse_({ ok: true, rows: rows });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);

    appendToSheet_(d);
    return jsonResponse_({ ok: true });
  } catch (err) {
    console.error(err);
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function appendToSheet_(d) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("answers");
  if (!sheet) {
    throw new Error("sheet 'answers' not found in target spreadsheet");
  }
  sheet.appendRow([
    new Date(d.timestamp || Date.now()),
    d.questionId || "",
    d.respondentRole || "",
    d.respondentName || "",
    d.questionType || "",
    d.answerValue || "",
    d.note || "",
  ]);
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** 手動測試 doPost：在編輯器選 testPost 然後 Run。 */
function testPost() {
  const fake = {
    postData: {
      contents: JSON.stringify({
        timestamp: Date.now(),
        questionId: "Q1",
        questionType: "stance",
        answerValue: "部分同意",
        note: "測試回覆",
        respondentRole: "PM",
        respondentName: "test",
      }),
    },
  };
  console.log(doPost(fake).getContent());
}

/** 手動測試 doGet：在編輯器選 testGet 然後 Run。 */
function testGet() {
  console.log(doGet({}).getContent());
}
