// arova-handoff dossier v2 — identity gate / tabs / forms / progress

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzV858Veu-XWGn2BUBQ_hqaABN_pSgQRMp04rBDtK8p2TPs7U_KaCr5Z8yajFSkQDpi/exec";
const IDENTITY_KEY = "arova-identity";
const PROGRESS_KEY = "arova-progress";

const TAB_TARGETS = {
  strategic: ["Q1", "Q2", "Q3", "Q4"],
  operational: ["Q5", "Q6"],
  all: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"],
};

const TOTAL_QUESTIONS = 6;

function init() {
  setupIdentityGate();
  setupTabs();
  setupForms();
  applyInitialTabFromHash();
  refreshProgress();

  const id = getIdentity();
  if (id) {
    renderIdentityBadge(id);
  } else {
    showIdentityGate();
  }
}

// ── Identity ────────────────────────────────────────────────

function getIdentity() {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setIdentity(id) {
  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(id));
  } catch {
    // localStorage 失效時 fallback：仍走 in-memory（重整會回到 gate）
  }
}

function showIdentityGate(prefill) {
  const gate = document.getElementById("identity-gate");
  if (!gate) return;
  gate.hidden = false;
  document.body.classList.add("gate-locked");

  const form = document.getElementById("identity-form");
  if (form) {
    form.reset();
    if (prefill) {
      const radio = form.querySelector(`input[name="role"][value="${cssEscape(prefill.role)}"]`);
      if (radio) radio.checked = true;
      const name = form.querySelector('input[name="name"]');
      if (name) name.value = prefill.name || "";
      updateIdentityNameRequired(prefill.role);
    } else {
      updateIdentityNameRequired(null);
    }
    setGateStatus("");
  }
}

function hideIdentityGate() {
  const gate = document.getElementById("identity-gate");
  if (!gate) return;
  gate.hidden = true;
  document.body.classList.remove("gate-locked");
}

function renderIdentityBadge(id) {
  const badge = document.getElementById("identity-badge");
  if (!badge) return;
  badge.hidden = false;
  const roleEl = badge.querySelector("[data-id-role]");
  const nameEl = badge.querySelector("[data-id-name]");
  if (roleEl) roleEl.textContent = id.role;
  if (nameEl) nameEl.textContent = id.name ? ` · ${id.name}` : "";
}

function updateIdentityNameRequired(role) {
  const field = document.getElementById("identity-name-field");
  const input = field ? field.querySelector('input[name="name"]') : null;
  if (!field || !input) return;
  if (role === "其他") {
    field.classList.add("required");
    input.required = true;
  } else {
    field.classList.remove("required");
    input.required = false;
  }
}

function setGateStatus(text) {
  const el = document.getElementById("gate-status");
  if (el) el.textContent = text || "";
}

function setupIdentityGate() {
  const form = document.getElementById("identity-form");
  if (!form) return;

  form.addEventListener("change", (e) => {
    if (e.target && e.target.name === "role") {
      updateIdentityNameRequired(e.target.value);
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const role = (fd.get("role") || "").toString();
    const name = (fd.get("name") || "").toString().trim();
    if (!role) {
      setGateStatus("請選擇身分");
      return;
    }
    if (role === "其他" && !name) {
      setGateStatus("身分為「其他」時必須填寫名字");
      return;
    }
    const id = { role, name };
    setIdentity(id);
    renderIdentityBadge(id);
    hideIdentityGate();
  });

  const switchBtn = document.getElementById("identity-switch");
  if (switchBtn) {
    switchBtn.addEventListener("click", () => {
      showIdentityGate(getIdentity() || undefined);
    });
  }
}

// ── Tabs ────────────────────────────────────────────────────

function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      activateTab(tab);
      history.replaceState(null, "", `#questions/${tab}`);
    });
  });
}

function activateTab(tab) {
  const targets = TAB_TARGETS[tab] || TAB_TARGETS.all;
  document.querySelectorAll(".tab-btn").forEach((b) => {
    b.setAttribute("aria-selected", b.dataset.tab === tab ? "true" : "false");
  });
  document.querySelectorAll(".question").forEach((q) => {
    q.hidden = !targets.includes(q.dataset.qid);
  });
}

function applyInitialTabFromHash() {
  const m = location.hash.match(/^#questions\/(strategic|operational|all)$/);
  activateTab(m ? m[1] : "strategic");
}

// ── Forms ───────────────────────────────────────────────────

function setupForms() {
  document.querySelectorAll(".answer-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSubmit(form);
    });
  });
}

function setSubmitLabel(btn, label, withArrow) {
  // 用 DOM 操作避免 innerHTML（XSS 風險低但 hook 拒絕）
  while (btn.firstChild) btn.removeChild(btn.firstChild);
  btn.appendChild(document.createTextNode(withArrow ? `${label} ` : label));
  if (withArrow) {
    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.textContent = "→";
    btn.appendChild(arrow);
  }
}

async function handleSubmit(form) {
  const submitBtn = form.querySelector(".submit");
  const status = form.querySelector(".form-status");
  const qid = form.dataset.qid;
  const qtype = form.dataset.qtype;

  const id = getIdentity();
  if (!id) {
    showIdentityGate();
    return;
  }

  const fd = new FormData(form);
  const answerValue = collectAnswerValue(qtype, fd);
  if (!answerValue) {
    setStatus(status, "請先選擇或填寫回答", "error");
    return;
  }

  const payload = {
    timestamp: Date.now(),
    questionId: qid,
    questionType: qtype,
    answerValue,
    note: (fd.get("note") || "").toString().trim(),
    respondentRole: id.role,
    respondentName: id.name || "",
  };

  submitBtn.disabled = true;
  setSubmitLabel(submitBtn, "送出中…", false);
  setStatus(status, "", null);

  try {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.startsWith("<")) {
      throw new Error("APPS_SCRIPT_URL 尚未設定，請填寫 app.js 頂部常數");
    }
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      // text/plain 避開 CORS preflight；Apps Script 用 e.postData.contents 解析
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json().catch(() => ({}));
    if (data.ok === false) throw new Error(data.error || "送出失敗");

    setSubmitLabel(submitBtn, "已送出 ✓", false);
    submitBtn.dataset.state = "success";
    setStatus(status, "已寫入 Sheet。如要補充可再次送出。", "success");

    markAnswered(qid);

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.removeAttribute("data-state");
      setSubmitLabel(submitBtn, "再送一筆", true);
    }, 1400);
  } catch (err) {
    submitBtn.disabled = false;
    setSubmitLabel(submitBtn, "送出", true);
    setStatus(status, `送出失敗：${err.message}`, "error");
  }
}

function collectAnswerValue(qtype, fd) {
  if (qtype === "stance") return (fd.get("stance") || "").toString();
  if (qtype === "abc")    return (fd.get("choice") || "").toString();
  if (qtype === "open")   return (fd.get("note") || "").toString().trim();
  if (qtype === "subtopics") {
    const obj = {};
    let any = false;
    for (const [k, v] of fd.entries()) {
      if (k === "note" || k === "stance" || k === "choice") continue;
      const val = v.toString().trim();
      obj[k] = val;
      if (val) any = true;
    }
    if (!any) return "";
    return JSON.stringify(obj);
  }
  return "";
}

function setStatus(el, text, state) {
  if (!el) return;
  el.textContent = text || "";
  if (state) el.dataset.state = state;
  else delete el.dataset.state;
}

// ── Progress ────────────────────────────────────────────────

function getAnsweredSet() {
  try {
    const raw = sessionStorage.getItem(PROGRESS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markAnswered(qid) {
  const set = getAnsweredSet();
  set.add(qid);
  try {
    sessionStorage.setItem(PROGRESS_KEY, JSON.stringify([...set]));
  } catch {}
  refreshProgress();
}

function refreshProgress() {
  const set = getAnsweredSet();
  const done = TAB_TARGETS.all.filter((q) => set.has(q)).length;
  const counter = document.querySelector("[data-progress-done]");
  const fill = document.querySelector("[data-progress-fill]");
  if (counter) counter.textContent = String(done);
  if (fill) fill.style.right = `${100 - (done / TOTAL_QUESTIONS) * 100}%`;
}

// ── Helpers ─────────────────────────────────────────────────

function cssEscape(s) {
  // 身分值僅有 PM / Kyle / 其他，簡易 escape 即可
  return String(s).replace(/"/g, '\\"');
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
