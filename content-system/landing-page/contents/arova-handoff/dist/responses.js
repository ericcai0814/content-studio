// arova-handoff responses viewer — fetch Sheet data via Apps Script GET, render by question

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzV858Veu-XWGn2BUBQ_hqaABN_pSgQRMp04rBDtK8p2TPs7U_KaCr5Z8yajFSkQDpi/exec";

const QUESTIONS = [
  { id: "Q1", type: "stance",    title: "OMNI 和 Arova Nexus 是同一個產品的兩個版本，還是兩條獨立產品線？" },
  { id: "Q2", type: "abc",       title: "EWAI FLOW 是未來規劃、已取消、還是只是文案殘留？" },
  { id: "Q3", type: "stance",    title: "nexus-demo 到底是 demo，還是客戶的實際環境？" },
  { id: "Q4", type: "stance",    title: "OMNI v1 到底由哪幾個 repo 組成？" },
  { id: "Q5", type: "open",      title: "ewai-omni 這個 v1 前端 repo 的實體在哪？" },
  { id: "Q6", type: "subtopics", title: "Handoff 盤點：Kyle 本機還有哪些不在 repo 裡的產品資產？" },
];

const Q6_SUB_LABELS = {
  "6.1": "本機 /arova/ 底下不在 arova-ai/ 的 repo / 資料夾 / 未 commit 文件",
  "6.2": "這些資產 handoff 前是否會同步到共享位置？預計時程？",
  "6.3": "graylog-agent / librenms-agent / mastra-dev 三個 workspace 的完成度",
  "6.4": "nexus-docs 的 openspec 實作是否直接依賴這三個 workspace？",
  "6.5": "arova-ai-core/sales-kit/ 的內容是什麼？跟客戶泰國廠有關嗎？",
  "6.6": "現行 Claude 環境哪些設定是運作所需、需保留？",
  "6.7": "除了 nexus-docs 之外，還有哪些 repo 改過名？",
  "6.8": "mastra-learn 是否納入 handoff？軟體部接手後是否接續開發？",
  "6.9": "sales-kit handoff 後該由軟體部接，還是業務 / PM 接？",
};

function init() {
  document.getElementById("refresh-btn").addEventListener("click", load);
  load();
}

// ── Data Loading ─────────────────────────────────────────────────

async function load() {
  showState("loading");
  try {
    const rows = await fetchResponses();
    render(rows);
    document.getElementById("last-updated").textContent =
      "最後更新：" + new Date().toLocaleTimeString("zh-TW");
  } catch (err) {
    showError(err.message);
  }
}

async function fetchResponses() {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.startsWith("<")) {
    throw new Error("APPS_SCRIPT_URL 尚未設定，請在 responses.js 頂部填入 Apps Script URL");
  }
  const res = await fetch(APPS_SCRIPT_URL);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  if (data.ok === false) throw new Error(data.error || "無法取得資料");
  return data.rows || [];
}

// ── Data Grouping ────────────────────────────────────────────────

function respondentKey(row) {
  return (row.respondentRole || "") + "::" + (row.respondentName || "");
}

// Returns Map<qid, Map<respondentKey, latestRow>> — keeps only the most recent
// submission per (question, respondent) pair.
function groupByQuestion(rows) {
  const byQ = new Map();
  for (const q of QUESTIONS) byQ.set(q.id, new Map());

  for (const row of rows) {
    const qid = (row.questionId || "").toString();
    if (!byQ.has(qid)) continue;
    const key = respondentKey(row);
    const existing = byQ.get(qid).get(key);
    const ts = row.timestamp ? new Date(row.timestamp).getTime() : 0;
    const existingTs = existing && existing.timestamp
      ? new Date(existing.timestamp).getTime() : -1;
    if (!existing || ts > existingTs) {
      byQ.get(qid).set(key, row);
    }
  }
  return byQ;
}

// ── Rendering ────────────────────────────────────────────────────

function render(rows) {
  const byQ = groupByQuestion(rows);
  const content = document.getElementById("responses-content");
  while (content.firstChild) content.removeChild(content.firstChild);

  for (const q of QUESTIONS) {
    const respondentMap = byQ.get(q.id) || new Map();
    content.appendChild(renderQuestion(q, respondentMap));
  }
  showState("content");
}

function renderQuestion(q, respondentMap) {
  const section = document.createElement("section");
  section.className = "rg-section";
  section.id = "rg-" + q.id.toLowerCase();

  const header = document.createElement("div");
  header.className = "rg-header";

  const qid = document.createElement("span");
  qid.className = "rg-qid mono";
  qid.textContent = q.id;

  const title = document.createElement("h2");
  title.className = "rg-title";
  title.textContent = q.title;

  header.appendChild(qid);
  header.appendChild(title);
  section.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "rg-grid";

  if (respondentMap.size === 0) {
    grid.appendChild(renderEmptyCard());
  } else {
    for (const row of respondentMap.values()) {
      grid.appendChild(renderRespondentCard(row, q.type));
    }
  }

  section.appendChild(grid);
  return section;
}

function renderRespondentCard(row, qtype) {
  const card = document.createElement("div");
  card.className = "rc-card";

  const roleEl = document.createElement("div");
  roleEl.className = "rc-role mono";
  roleEl.textContent = row.respondentName
    ? row.respondentRole + " · " + row.respondentName
    : row.respondentRole || "未知";
  card.appendChild(roleEl);

  const answer = (row.answerValue || "").toString().trim();

  if (qtype === "stance") {
    card.appendChild(renderStance(answer));
  } else if (qtype === "abc") {
    card.appendChild(renderChoice(answer));
  } else if (qtype === "subtopics") {
    card.appendChild(renderSubtopics(answer));
  } else {
    if (answer) {
      const block = document.createElement("div");
      block.className = "rc-open-text";
      block.textContent = answer;
      card.appendChild(block);
    }
  }

  const note = (row.note || "").toString().trim();
  if (note && qtype !== "subtopics" && qtype !== "open") {
    const noteEl = document.createElement("div");
    noteEl.className = "rc-note";
    noteEl.textContent = note;
    card.appendChild(noteEl);
  }

  return card;
}

function renderStance(answer) {
  const wrap = document.createElement("div");
  wrap.className = "rc-stance";

  const dot = document.createElement("span");
  dot.className = "stance-dot";

  const label = document.createElement("span");
  label.textContent = answer || "—";

  if (answer === "同意") {
    dot.classList.add("stance-dot--agree");
    dot.textContent = "●";
  } else if (answer === "不同意") {
    dot.classList.add("stance-dot--disagree");
    dot.textContent = "●";
  } else if (answer === "部分同意") {
    dot.classList.add("stance-dot--partial");
    dot.textContent = "◑";
  } else {
    dot.classList.add("stance-dot--none");
    dot.textContent = "○";
  }

  wrap.appendChild(dot);
  wrap.appendChild(label);
  return wrap;
}

function renderChoice(answer) {
  const wrap = document.createElement("div");
  wrap.className = "rc-choice";

  const badge = document.createElement("span");
  badge.className = "choice-badge";
  badge.textContent = answer ? answer.charAt(0).toUpperCase() : "—";

  const label = document.createElement("span");
  label.textContent = answer || "—";

  wrap.appendChild(badge);
  wrap.appendChild(label);
  return wrap;
}

function renderSubtopics(rawValue) {
  const list = document.createElement("ul");
  list.className = "rc-subtopics";

  let parsed = {};
  try { parsed = JSON.parse(rawValue); } catch {}

  const entries = Object.entries(parsed).filter(([, v]) => v && v.toString().trim());
  if (entries.length === 0) {
    const empty = document.createElement("li");
    empty.className = "rc-sub-item";
    const val = document.createElement("span");
    val.className = "rc-sub-val";
    val.textContent = "(無填寫)";
    empty.appendChild(val);
    list.appendChild(empty);
    return list;
  }

  for (const [k, v] of entries) {
    const li = document.createElement("li");
    li.className = "rc-sub-item";

    const key = document.createElement("span");
    key.className = "rc-sub-key";
    key.textContent = k;

    const val = document.createElement("span");
    val.className = "rc-sub-val";
    val.textContent = v.toString().trim();

    li.appendChild(key);
    li.appendChild(val);
    list.appendChild(li);
  }

  return list;
}

function renderEmptyCard() {
  const card = document.createElement("div");
  card.className = "rc-card rc-card--empty";
  card.textContent = "尚無回覆";
  return card;
}

// ── State ────────────────────────────────────────────────────────

function showState(state) {
  document.getElementById("state-loading").hidden = state !== "loading";
  document.getElementById("state-error").hidden   = state !== "error";
  document.getElementById("responses-content").hidden = state !== "content";
}

function showError(msg) {
  document.getElementById("error-msg").textContent = "載入失敗：" + msg;
  document.getElementById("retry-btn").onclick = load;
  showState("error");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
