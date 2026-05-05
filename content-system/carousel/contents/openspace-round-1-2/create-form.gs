/**
 * OpenSpace Part 1 會後回饋表單 — 一次性建立腳本
 *
 * 使用方式：
 * 1. 打開 https://script.google.com → 新增專案
 * 2. 把整份檔案貼進 Code.gs
 * 3. 選 createOpenSpaceFeedbackForm 函式 → 按執行
 * 4. 首次執行會要求授權（Google Drive / Forms）
 * 5. 執行完成後，Logger 會印出 Form 的編輯網址與填寫網址
 *
 * 可重跑：每跑一次會在你的 Google Drive 根目錄新建一份 Form。
 * 若要改題目，直接改這個檔案再重跑即可。
 */

function createOpenSpaceFeedbackForm() {
  const form = FormApp.create('OpenSpace Part 1 會後回饋')
    .setDescription(
      '3 分鐘填完。你們的回答是 Part 2 的原料 —\n' +
      '寫得越具體，Part 2 就越對準你們的真實痛點。'
    )
    .setCollectEmail(true)
    .setConfirmationMessage('收到，謝謝。Part 2 會根據你們填的內容調整。')
    .setAllowResponseEdits(true)
    .setLimitOneResponsePerUser(false)
    .setProgressBar(true);

  // Q1 — 姓名
  form.addTextItem()
    .setTitle('你是？')
    .setRequired(true);

  // Q2 — Round 1 共鳴
  form.addParagraphTextItem()
    .setTitle('Round 1「AI 說改好但沒改好」— 你最有共鳴的是？')
    .setHelpText('可以是別人講的故事、你自己想到的經驗、或一個具體痛點。')
    .setRequired(true);

  // Q3 — Round 2 共鳴
  form.addParagraphTextItem()
    .setTitle('Round 2「Context 爆炸怎麼察覺處理」— 你最有共鳴的是?')
    .setHelpText('同上。')
    .setRequired(true);

  // Q4 — Round 3 印象
  form.addParagraphTextItem()
    .setTitle('Round 3(現場投票選的那題) — 印象深刻的是？')
    .setHelpText('先寫一下今天 Round 3 選到的題目是哪題,再寫你印象深刻的點。')
    .setRequired(true);

  // Q5 — 平常卡點
  form.addParagraphTextItem()
    .setTitle('你平常用 Claude Code，最常卡在哪？')
    .setHelpText(
      '不一定是今天三題涵蓋到的。越具體越好\n' +
      '(「當我做 X 的時候,Claude 會 Y，我通常只能 Z」)。'
    )
    .setRequired(true);

  // Q6 — 自建配置
  form.addCheckboxItem()
    .setTitle('你目前自己寫過／配置過哪些？')
    .setHelpText('勾到哪就到哪,沒有壓力。')
    .setChoiceValues([
      '專案的 CLAUDE.md 規則',
      '自建 Hook（PreToolUse / PostToolUse / Stop…）',
      '自建 Skill',
      '自建 Subagent',
      '自建 Slash Command',
      'MCP Server 接入',
      'Worktree / Subagent 並行工作流',
      '其他（下一題寫）',
      '目前都還沒，主要就是對話式使用',
    ])
    .setRequired(false);

  // Q7 — 其他（選填）
  form.addTextItem()
    .setTitle('其他自建配置(上題勾「其他」才填)')
    .setRequired(false);

  // Q8 — Part 2 主題投票
  form.addCheckboxItem()
    .setTitle('Part 2 你最想先深入哪些？(最多選 3 個)')
    .setHelpText('用來排 Part 2 各段的時間配比。')
    .setChoiceValues([
      '① 破除迷思：AI 能 / 不能什麼',
      '② 單次 Completion 的原理',
      '③ Prompt / Context + CLAUDE.md walkthrough',
      '④ Function Calling 怎麼運作',
      '⑤ Agent Loop + Subagent 架構',
      '⑥ 三大挑戰（幻覺 / Verification / Context）',
      '⑦ Hook 攔截機制 Live Demo',
      '⑧ Claude Code 剖析（使用者 vs 模型視角）',
      '⑨ 落地優先級：Rules → Hooks → Agents',
    ])
    .setRequired(true);

  // Q9 — 主講意願
  form.addMultipleChoiceItem()
    .setTitle('Part 2 想聽你分享某一段嗎？')
    .setHelpText('若勾前兩個，下一題寫你想講的主題。')
    .setChoiceValues([
      '有題目、有意願講',
      '有題目，但還不想當主講',
      '還沒想好',
      '目前沒興趣',
    ])
    .setRequired(true);

  // Q10 — 想講主題
  form.addTextItem()
    .setTitle('你想講的主題是？(Q9 勾前兩個才填)')
    .setRequired(false);

  // Q11 — 帶回去試
  form.addTextItem()
    .setTitle('今天最想帶回去試的一件事？')
    .setHelpText('一句話就好。下週你打算動手試什麼？')
    .setRequired(true);

  // Q12 — 其他回饋
  form.addParagraphTextItem()
    .setTitle('其他回饋 / 今天沒聊到但想討論的題目')
    .setRequired(false);

  // 自動建立 linked Google Sheet 收集回應
  const sheet = SpreadsheetApp.create('OpenSpace Part 1 回應 - ' + new Date().toISOString().slice(0, 10));
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  // 輸出網址
  const editUrl = form.getEditUrl();
  const publishedUrl = form.getPublishedUrl();
  const shortUrl = form.shortenFormUrl(publishedUrl);
  const sheetUrl = sheet.getUrl();

  Logger.log('Form 建立完成 ✅');
  Logger.log('編輯網址:   ' + editUrl);
  Logger.log('填寫網址:   ' + publishedUrl);
  Logger.log('短網址:     ' + shortUrl);
  Logger.log('回應試算表: ' + sheetUrl);

  return { editUrl, publishedUrl, shortUrl, sheetUrl };
}

/**
 * 補綁 Sheet 到「已存在」的 Form
 *
 * 使用方式：
 * 1. 取得現有 Form ID — 編輯網址的 /forms/d/<FORM_ID>/edit 這段
 * 2. 把 FORM_ID 填進下方常數
 * 3. 執行 attachSheetToExistingForm
 */
function attachSheetToExistingForm() {
  const FORM_ID = 'PASTE_FORM_ID_HERE';  // ← 改這裡

  const form = FormApp.openById(FORM_ID);
  const sheet = SpreadsheetApp.create('OpenSpace Part 1 回應 - ' + new Date().toISOString().slice(0, 10));
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  Logger.log('Sheet 綁定完成 ✅');
  Logger.log('試算表網址: ' + sheet.getUrl());

  return { sheetUrl: sheet.getUrl() };
}
