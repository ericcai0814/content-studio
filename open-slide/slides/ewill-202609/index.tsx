import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { useSlidePageNumber } from '@open-slide/core';

import coverBg from './assets/cover-bg.png';
import contentBg from './assets/content-bg.png';
import endingBg from './assets/ending-bg.png';
import aiTimeline from './assets/ai-timeline-figma.png';

export const design: DesignSystem = {
  palette: {
    bg: '#FFFFFF',
    text: '#3E3A39',
    accent: '#00979C',
  },
  fonts: {
    display: '"微軟正黑體", "Microsoft JhengHei", "Noto Sans TC", system-ui, sans-serif',
    body: '"微軟正黑體", "Microsoft JhengHei", "Noto Sans TC", system-ui, sans-serif',
  },
  typeScale: { hero: 72, body: 28 },
  radius: 8,
};

const C = {
  teal: '#00979C',
  tealDark: '#007A7E',
  charcoal: '#3E3A39',
  amber: '#FBAE40',
  yellow: '#F2C94C',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  midGray: '#E0E0E0',
  text: '#333333',
  textSoft: '#666666',
  danger: '#D32F2F',
};

const font = design.fonts.body;
const SURFACE = 'rgba(255,255,255,0.85)';
const reportCell: React.CSSProperties = { padding: '14px 16px', verticalAlign: 'top' };
const reportKey: React.CSSProperties = { ...reportCell, fontWeight: 700, color: C.charcoal };
const reportTable: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 28, lineHeight: 1.5 };
const reportHead: React.CSSProperties = { background: C.charcoal, color: C.white, fontSize: 26, textAlign: 'left' };

const bgSlide = (img: string): React.CSSProperties => ({
  width: '100%', height: '100%', position: 'relative' as const,
  backgroundImage: `url(${img})`,
  backgroundSize: 'cover',
  backgroundPosition: 'left bottom',
  fontFamily: font, color: C.text, overflow: 'hidden',
});

const headerBar: React.CSSProperties = {
  height: 80, background: C.teal,
  display: 'flex', alignItems: 'center',
  padding: '0 80px', flexShrink: 0,
};

const headerEyebrow: React.CSSProperties = {
  color: 'rgba(255,255,255,0.75)', fontSize: 20, letterSpacing: 3, marginBottom: 2,
};

const headerText: React.CSSProperties = {
  color: C.white, fontSize: 44, fontWeight: 700, display: 'block', lineHeight: 1.1,
};

const bodyArea: React.CSSProperties = {
  flex: 1, padding: '32px 80px 20px',
  display: 'flex', flexDirection: 'column' as const, justifyContent: 'flex-start' as const,
  overflow: 'hidden',
};

const footerBar: React.CSSProperties = {
  height: 36, display: 'flex', alignItems: 'center',
  justifyContent: 'flex-end', padding: '0 80px',
  fontSize: 20, color: '#999', flexShrink: 0,
};

const subHead: React.CSSProperties = {
  fontSize: 30, fontWeight: 700, color: C.charcoal, marginBottom: 10,
};

const tableHead: React.CSSProperties = {
  background: C.charcoal, color: C.white, fontSize: 20, letterSpacing: 1,
};

const th: React.CSSProperties = { textAlign: 'left', padding: '5px 12px', fontWeight: 700 };
const td: React.CSSProperties = { padding: '4px 12px', verticalAlign: 'top' };
const tdNum: React.CSSProperties = { ...td, textAlign: 'right' };
const tdKey: React.CSSProperties = { ...td, fontWeight: 700, color: C.charcoal };
const tdSoft: React.CSSProperties = { ...td, color: '#555' };
const tdMute: React.CSSProperties = { ...td, color: '#888' };
const tdIdx: React.CSSProperties = { ...td, color: '#999' };
const tdSt: React.CSSProperties = { ...td, color: '#777' };
const tdTight: React.CSSProperties = { ...td, padding: '3px 12px' };
const tdTightKey: React.CSSProperties = { ...tdTight, fontWeight: 700, color: C.charcoal };
const tdTightSoft: React.CSSProperties = { ...tdTight, color: '#555' };
const tdProj: React.CSSProperties = { ...tdTight, fontSize: 20, fontWeight: 700, color: C.charcoal };
const tdProjSoft: React.CSSProperties = { ...tdTight, fontSize: 20, color: C.text };
const tdSev: React.CSSProperties = { ...td, textAlign: 'center' };
const tdItem: React.CSSProperties = { ...td, color: C.charcoal };
const tdStat: React.CSSProperties = { ...td, color: '#555', fontSize: 20 };
const tdPhase: React.CSSProperties = { ...td, fontWeight: 700, color: C.teal };
const tdPhaseWarn: React.CSSProperties = { ...td, fontWeight: 700, color: C.amber };
const tdMile: React.CSSProperties = { ...td, width: 220, fontWeight: 700, color: C.teal };
const tdMileV: React.CSSProperties = { ...td, color: '#555', lineHeight: 1.5 };
const zebra = (i: number): React.CSSProperties => ({
  background: i % 2 === 1 ? 'rgba(245,245,245,0.7)' : 'transparent',
});

const noteBox = (accent: string): React.CSSProperties => ({
  background: SURFACE, borderRadius: 8, borderLeft: `5px solid ${accent}`,
  padding: '12px 20px', fontSize: 20, color: '#555', lineHeight: 1.45,
});

const badge = (type: 'danger' | 'warning' | 'success' | 'neutral'): React.CSSProperties => {
  const map = {
    danger: { bg: C.danger, color: C.white },
    warning: { bg: C.amber, color: C.charcoal },
    success: { bg: C.teal, color: C.white },
    neutral: { bg: C.midGray, color: '#555' },
  };
  const s = map[type];
  return {
    display: 'inline-block', fontSize: 20, padding: '3px 12px',
    borderRadius: 4, fontWeight: 700, whiteSpace: 'nowrap' as const,
    background: s.bg, color: s.color,
  };
};

/* ---------- shared components (5) ---------- */

const ContentSlide = ({ title, section, children }: {
  title: string; section?: string; children: React.ReactNode;
}) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ ...bgSlide(contentBg), display: 'flex', flexDirection: 'column' }}>
      <div style={headerBar}>
        <div>
          {section ? <div style={headerEyebrow}>{section}</div> : null}
          <span style={headerText}>{title}</span>
        </div>
      </div>
      <div style={bodyArea}>{children}</div>
      <div style={footerBar}>{current} / {total}</div>
    </div>
  );
};

const Lede = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 20, color: '#888', marginBottom: 10 }}>{children}</div>
);

const Card = ({ accent, title, children }: {
  accent: string; title: string; children: React.ReactNode;
}) => (
  <div style={{
    borderRadius: 8, padding: '18px 22px', borderTop: `5px solid ${accent}`,
    background: SURFACE, fontSize: 20,
  }}>
    <div style={{ fontWeight: 700, fontSize: 30, marginBottom: 10, color: C.charcoal, lineHeight: 1.3 }}>{title}</div>
    {children}
  </div>
);

const Metric = ({ accent, value, label, note }: {
  accent: string; value: string; label: string; note?: string;
}) => (
  <div style={{
    borderRadius: 8, padding: '18px 22px', borderTop: `5px solid ${accent}`,
    background: SURFACE,
  }}>
    <div style={{ fontSize: 64, fontWeight: 700, color: accent, lineHeight: 1.15 }}>{value}</div>
    <div style={{ fontSize: 30, fontWeight: 700, color: C.charcoal, margin: '4px 0 8px' }}>{label}</div>
    {note ? <div style={{ fontSize: 24, color: '#555', lineHeight: 1.45 }}>{note}</div> : null}
  </div>
);

const Dot = ({ color }: { color: string }) => (
  <span style={{
    display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
    background: color, verticalAlign: 'middle',
  }} />
);

// 專案管制表(20260825)「軟體部2026KPI」K24:K38，與來源表公式逐列核對。
// 保留 Excel 顯示的元整數；其餘 7 筆在 6–12 月分攤為 0。
const financeH2 = {
  tsa: 1_360_135,
  insurance: 513_975,
  changGung: 1_200_000,
  tsmc: 825_000,
  tids: 370_000,
  kpmg: 345_573,
  wemb: 150_000,
  taichung: 50_000,
};
const financeTotal = Object.values(financeH2).reduce((sum, amount) => sum + amount, 0);
const financeForecast = 300_000; // K39：尚未入來源表的威彼預期新案。
const yuan = (amount: number) => amount.toLocaleString('zh-TW');
const wan = (amount: number) => (amount / 10_000).toFixed(1);

// Eric 2026/09/22 更新的階段請款，與 8/25 KPI 分攤分開記錄。
const tsmcBilling = { phase2Development: 2_857_143, phase1To2Testing: 714_286 };
const tsmcBillingTotal = tsmcBilling.phase2Development + tsmcBilling.phase1To2Testing;

const FinanceRow = ({ index, name, amount }: {
  index: number; name: string; amount: number;
}) => (
  <tr style={zebra(index)}>
    <td style={{ ...tdKey, padding: '10px 16px' }}>{name}</td>
    <td style={{ ...tdNum, padding: '10px 16px', color: C.teal, fontWeight: 700 }}>{yuan(amount)}</td>
  </tr>
);

/* ---------- pages ---------- */

// P1 封面
const Cover: Page = () => (
  <div style={{ ...bgSlide(coverBg), display: 'flex', flexDirection: 'column' }}>
    <div style={{ flex: 1, minHeight: '43%' }} />
    <div style={{ background: C.teal, padding: '20px 80px', width: '55%' }}>
      <h1 style={{ color: C.white, fontSize: 56, fontWeight: 700, lineHeight: 1.3, margin: 0 }}>
        軟體部 2026/09<br />主管會議簡報
      </h1>
    </div>
    <div style={{ background: C.charcoal, padding: '12px 80px', width: '55%' }}>
      <span style={{ color: C.white, fontSize: 28 }}>工作重心調整・AI 平台・專案進度</span>
    </div>
    <div style={{ padding: '12px 80px', width: '55%', display: 'flex', gap: 40 }}>
      <span style={{ fontSize: 22, color: '#555' }}>Eric</span>
      <span style={{ fontSize: 22, color: '#555' }}>2026 / 09 / 22</span>
    </div>
    <div style={{ flex: 1 }} />
  </div>
);

// P2 本月重點
const Headline: Page = () => (
  <ContentSlide title="9 月工作重點">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginTop: 24 }}>
      <Metric accent={C.teal} value="10/29" label="ONETSA 正式交接"
        note="9/14 起進行 30 個工作日的交接輔導。目前依課表進行，仍需完成異動文件與驗收準備。" />
      <Metric accent={C.amber} value="30–40%" label="9 月起的 AI 平台投入"
        note="原本投入 10–20%。調整既有專案的時間分配，增加 AI 平台建置投入。" />
      <Metric accent={C.teal} value={`${wan(financeTotal)} 萬`} label="6–12 月部門分攤毛利"
        note={`已入表 ${yuan(financeTotal)} 元，包含未開票與未到期款。預期新案另列 ${wan(financeForecast)} 萬。`} />
    </div>
  </ContentSlide>
);

// P3 工作重心前後對照
const FocusPlan: Page = () => (
  <ContentSlide section="管理規劃" title="9–12 月工作重心調整">
    <div style={{ fontSize: 28, color: C.textSoft, marginBottom: 24 }}>Eric 的時間與管理投入｜原本與 9 月起規劃</div>
    <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.5, marginBottom: 36 }}>減少既有專案占用的時間，提高 AI 平台投入。</div>
    <table style={{ ...reportTable, background: SURFACE }}>
      <thead><tr style={{ ...reportHead, fontSize: 30 }}>
        <th style={{ ...reportCell, width: 780 }}>工作重心</th>
        <th style={{ ...reportCell, width: 430 }}>原本</th>
        <th style={reportCell}>9–12 月規劃</th>
      </tr></thead>
      <tbody>
        <tr style={zebra(0)}>
          <td style={{ ...reportKey, padding: '28px 20px', fontSize: 36 }}>既有專案交付／維護</td>
          <td style={{ ...reportCell, padding: '20px', fontSize: 56, color: C.textSoft }}>60–70%</td>
          <td style={{ ...reportKey, padding: '20px', fontSize: 64, color: C.teal }}>30–40%</td>
        </tr>
        <tr style={zebra(1)}>
          <td style={{ ...reportKey, padding: '28px 20px', fontSize: 36 }}>AI 平台</td>
          <td style={{ ...reportCell, padding: '20px', fontSize: 56, color: C.textSoft }}>10–20%</td>
          <td style={{ ...reportKey, padding: '20px', fontSize: 64, color: C.teal }}>30–40%</td>
        </tr>
        <tr style={zebra(2)}>
          <td style={{ ...reportKey, padding: '28px 20px', fontSize: 36 }}>團隊建設</td>
          <td style={{ ...reportCell, padding: '20px', fontSize: 56, color: C.textSoft }}>10–20%</td>
          <td style={{ ...reportKey, padding: '20px', fontSize: 64, color: C.teal }}>20%</td>
        </tr>
      </tbody>
    </table>
  </ContentSlide>
);

// P4 部門改善與 AI 平台的關係
const Department: Page = () => (
  <ContentSlide section="AI 平台" title="部門改善如何支撐 AI 平台">
    <table style={{ ...reportTable, fontSize: 30, marginTop: 24 }}>
      <thead><tr style={reportHead}><th style={{ ...reportCell, width: 350 }}>已有基礎</th><th style={{ ...reportCell, width: 610 }}>目前進度</th><th style={reportCell}>與 AI 平台的關係</th></tr></thead>
      <tbody>
        <tr style={zebra(0)}><td style={reportKey}>月會與週報</td><td style={reportCell}>月會固定舉行，週報統一進度與工時格式。</td><td style={reportCell}>後續用來追蹤 AI 導入情況與所需工時。</td></tr>
        <tr style={zebra(1)}><td style={reportKey}>部門文件站</td><td style={reportCell}>已上線，成員可查閱共用文件。</td><td style={reportCell}>整理為團隊與 AI 都能查找的知識來源。</td></tr>
        <tr style={zebra(2)}><td style={reportKey}>交付驗證規範</td><td style={reportCell}>9/17 已發布；實際採用仍待確認。</td><td style={reportCell}>AI 產出也須附測試或查核結果，再回報完成。</td></tr>
        <tr style={zebra(3)}><td style={reportKey}>系統建置環境</td><td style={reportCell}>Windows 環境已建置，專案驗證待完成。</td><td style={reportCell}>後續接入可重複執行的建置與測試，驗證 AI 輔助修改。</td></tr>
      </tbody>
    </table>
  </ContentSlide>
);

// P5 AI 平台時間軸
const AITimeline: Page = () => (
  <ContentSlide section="AI 平台" title="AI 平台化現況：2025/11–2026/09">
    {/* Figma 12:2 is 1000×636. Show y=0–423: the timeline and legend only. */}
    <div style={{ width: 1760, height: 744.48, overflow: 'hidden', flexShrink: 0, marginTop: 40 }}>
      <img
        src={aiTimeline}
        alt="軟體部 AI 平台化時間軸：2025 年 11 月 LogSec、2026 年 1 月 AI 輔助交付、3 月流程與基礎設施、4 月 POC、7 月 repo 重整、8 月團隊規範與知識庫、9 月導覽與交付工具"
        style={{ display: 'block', width: 1760, height: 1119.36, maxWidth: 'none' }}
      />
    </div>
  </ContentSlide>
);

// P6 AI 平台推進規劃
const AIPlatformPlan: Page = () => (
  <ContentSlide section="AI 平台" title="AI 平台化：9–12 月推進規劃">
    <div style={{ fontSize: 32, lineHeight: 1.5, marginBottom: 28 }}>把既有文件、工具與做法，整理成團隊可共用的工作環境。</div>
    <table style={{ ...reportTable, fontSize: 30 }}>
      <thead><tr style={reportHead}><th style={{ ...reportCell, width: 320 }}>工作方向</th><th style={{ ...reportCell, width: 580 }}>目前基礎</th><th style={reportCell}>接下來要做</th></tr></thead>
      <tbody>
        <tr style={zebra(0)}><td style={reportKey}>共用專案入口</td><td style={reportCell}>各案已有文件與作業規則。</td><td style={reportCell}>統一專案入口與基本文件，讓成員從同一份資料開始。</td></tr>
        <tr style={zebra(1)}><td style={reportKey}>知識整理與查找</td><td style={reportCell}>已有交接文件、維護知識庫與作業說明。</td><td style={reportCell}>建立跨專案索引，整理可重用的文件範本。</td></tr>
        <tr style={zebra(2)}><td style={reportKey}>工具與流程複用</td><td style={reportCell}>已有團隊規則、AI 工具與專案試作。</td><td style={reportCell}>先在海巡案驗證，再推廣到其他專案。</td></tr>
        <tr style={zebra(3)}><td style={reportKey}>交付品質與用量</td><td style={reportCell}>已發布交付驗證規範，並開始追蹤用量。</td><td style={reportCell}>將測試檢查納入成員專案，設定用量提醒。</td></tr>
      </tbody>
    </table>
  </ContentSlide>
);

// P7 部門分攤與專案請款
const Finance: Page = () => (
  <ContentSlide section="專案財務" title="部門分攤與專案請款">
    <div style={{ fontSize: 24, color: C.textSoft, marginBottom: 24 }}>單位：元。分攤依 8/25 管制表，含未開票與未到期款；請款進度截至 9/22，兩種金額分開計算。</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 40 }}>
      <div>
        <div style={{ ...subHead, marginBottom: 18 }}>6–12 月部門分攤毛利</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 28, lineHeight: 1.4 }}>
          <thead><tr style={{ ...tableHead, fontSize: 26 }}><th style={{ ...th, padding: '12px 16px' }}>專案</th><th style={{ ...th, padding: '12px 16px', width: 270, textAlign: 'right' }}>分攤毛利</th></tr></thead>
          <tbody>
            <FinanceRow index={0} name="松機 ONE TSA" amount={financeH2.tsa} />
            <FinanceRow index={1} name="保發數位學習平台" amount={financeH2.insurance} />
            <FinanceRow index={2} name="長庚 HRPMS" amount={financeH2.changGung} />
            <FinanceRow index={3} name="台積電宿舍" amount={financeH2.tsmc} />
            <FinanceRow index={4} name="威彼台鐵 TIDS" amount={financeH2.tids} />
            <FinanceRow index={5} name="KPMG TOPS" amount={financeH2.kpmg} />
            <FinanceRow index={6} name="威彼技術合作與支援" amount={financeH2.wemb} />
            <FinanceRow index={7} name="臺中航空站 115 年度修正" amount={financeH2.taichung} />
            <tr style={{ background: 'rgba(0,151,156,0.12)', fontWeight: 700, fontSize: 32 }}>
              <td style={{ ...td, padding: '14px 16px' }}>已入表合計</td><td style={{ ...tdNum, padding: '14px 16px', color: C.teal }}>{yuan(financeTotal)}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: 20, padding: '14px 16px', borderLeft: `5px solid ${C.amber}`, fontSize: 27, lineHeight: 1.5 }}>
          威彼預期新案另列 <b>{yuan(financeForecast)}</b><br />含預期合計 <b>{yuan(financeTotal + financeForecast)}</b>
        </div>
      </div>
      <div>
        <div style={{ ...subHead, marginBottom: 18 }}>請款進度（全案金額）</div>
        <div style={{ background: C.lightGray, padding: '20px 24px', borderRadius: 8, fontSize: 27, lineHeight: 1.5 }}>
          <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 12 }}>台積電｜階段款尚未開票</div>
          <div>第二階段開發：{yuan(tsmcBilling.phase2Development)}</div>
          <div>一～二階段測試：{yuan(tsmcBilling.phase1To2Testing)}</div>
          <div style={{ borderTop: `1px solid ${C.midGray}`, marginTop: 14, paddingTop: 14, fontSize: 34, color: C.tealDark, fontWeight: 700 }}>合計 {yuan(tsmcBillingTotal)}</div>
        </div>
        <div style={{ fontSize: 27, lineHeight: 1.6, marginTop: 24 }}><b>松機｜末期 1,400,000</b><br />待啟動驗收，尚未開票。</div>
        <div style={{ fontSize: 27, lineHeight: 1.6, marginTop: 20 }}><b>保發</b>｜驗收合格，開票簽呈待回覆。</div>
        <div style={{ fontSize: 27, lineHeight: 1.6, marginTop: 20 }}><b>台鐵</b>｜已結案，尚未開票。</div>
      </div>
    </div>
  </ContentSlide>
);

// P8 ONETSA 交接安排
const HandoverHow: Page = () => (
  <ContentSlide section="專案進度｜ONETSA" title="交接安排：10/29 正式交接">
    <div style={{ fontSize: 30, lineHeight: 1.5, marginBottom: 30 }}>
      9/14–10/29，共 30 個工作日。由我方輔導新承接廠商，雙方每日簽到留存紀錄。
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
      <Card accent={C.teal} title="第一階段｜基本操作與維護">
        <div style={{ fontSize: 30, color: C.tealDark, fontWeight: 700, marginBottom: 18 }}>9/14–10/8</div>
        <div style={{ fontSize: 28, lineHeight: 1.6 }}>系統操作、日常維護與常見問題排除。</div>
      </Card>
      <Card accent={C.tealDark} title="第二階段｜進階實作">
        <div style={{ fontSize: 30, color: C.tealDark, fontWeight: 700, marginBottom: 18 }}>10/12–10/19</div>
        <div style={{ fontSize: 28, lineHeight: 1.6 }}>系統部署、報表、資安應變與環境搬遷。</div>
      </Card>
      <Card accent={C.amber} title="第三階段｜異動說明與交接">
        <div style={{ fontSize: 30, color: C.tealDark, fontWeight: 700, marginBottom: 18 }}>10/20–10/29</div>
        <div style={{ fontSize: 28, lineHeight: 1.6 }}>核對程式異動、補齊交付資料，10/29 正式交接。</div>
      </Card>
    </div>
    <div style={{ ...noteBox(C.teal), fontSize: 30, marginTop: 40, padding: '24px 28px' }}>
      <b style={{ color: C.charcoal }}>截至 9/22</b><br />
      已完成前 6 日課程，目前進入第 7 日；Eric 自 9/21 起現場帶教。
    </div>
    <div style={{ fontSize: 28, lineHeight: 1.6, marginTop: 24 }}>
      交接目標：讓承接廠商能操作、維護系統，並排除常見問題。
    </div>
  </ContentSlide>
);

// P9 主要專案
const ThreeCases: Page = () => {
  const paragraph: React.CSSProperties = { fontSize: 28, lineHeight: 1.6, margin: '0 0 20px', color: '#555' };
  return (
    <ContentSlide section="專案進度" title="主要專案：長庚、台積電與保發">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, alignItems: 'start' }}>
        <Card accent={C.teal} title="長庚｜開始直接服務客戶">
          <p style={paragraph}>9 月起由我方直接對接客戶，首週處理 <b style={{ color: C.teal }}>10 案</b>。</p>
          <blockquote style={{ margin: '16px 0 24px', padding: '18px 20px', borderLeft: `4px solid ${C.teal}`, background: 'rgba(0,151,156,0.08)', borderRadius: 4 }}>
            <div style={{ fontSize: 24, color: C.tealDark, fontWeight: 700 }}>9/14｜Steven（許佑民）回饋</div>
            <div style={{ fontSize: 24, color: '#555', lineHeight: 1.5, marginTop: 8 }}>針對首週案件處理方式與節奏</div>
            <div style={{ fontSize: 36, color: C.tealDark, fontWeight: 700, lineHeight: 1.4, marginTop: 12 }}>「不錯，無須調整」</div>
          </blockquote>
          <p style={paragraph}>一般案件 1–3 天處理，急件當日處理。</p>
          <p style={paragraph}>10/2 收集新增需求，評估排程與報價後再決定承接。</p>
        </Card>
        <Card accent={C.amber} title="台積電｜第四階段需求訪談">
          <p style={paragraph}><b style={{ color: C.charcoal }}>專案尚未結案</b>，目前進行第四階段需求訪談。</p>
          <p style={paragraph}>9/21 已完成四項複測，可提交客戶。</p>
          <p style={paragraph}>後續測試待需求文件補齊後啟動。</p>
        </Card>
        <Card accent={C.danger} title="保發｜進入保固維護">
          <p style={paragraph}>8/27 驗收合格，保固至 2027/8/27。</p>
          <p style={paragraph}>9/16 已更新正式系統，持續處理手機影音、下載與連線問題。</p>
        </Card>
      </div>
    </ContentSlide>
  );
};

// P10 其他專案分類
const Projects: Page = () => (
  <ContentSlide section="專案進度" title="其他專案：依工作類型整理">
    <table style={{ ...reportTable, fontSize: 26 }}>
      <thead><tr style={reportHead}><th style={{ ...reportCell, width: 230 }}>類別</th><th style={{ ...reportCell, width: 460 }}>專案</th><th style={reportCell}>進度</th></tr></thead>
      <tbody>
        <tr><td rowSpan={4} style={{ ...reportKey, color: C.teal, borderBottom: `1px solid ${C.midGray}` }}>開發與交付</td><td style={reportKey}>KPMG TOPS</td><td style={reportCell}>開發與資安修正並行。</td></tr>
        <tr><td style={reportKey}>海巡署 OAC TDS</td><td style={reportCell}>測試中，內部目標 10/16 交付。</td></tr>
        <tr><td style={reportKey}>央行訪客系統</td><td style={reportCell}>資安修正已上線；連線設定待客戶配合。</td></tr>
        <tr><td style={{ ...reportKey, borderBottom: `1px solid ${C.midGray}` }}>公司官網改版</td><td style={{ ...reportCell, borderBottom: `1px solid ${C.midGray}` }}>測試站已完成，待正式上線。</td></tr>
        <tr style={zebra(1)}><td rowSpan={3} style={{ ...reportKey, color: C.teal, borderBottom: `1px solid ${C.midGray}` }}>維護與合約</td><td style={reportKey}>威彼技術合作</td><td style={reportCell}>合約待用印，9/24 會議追蹤服務事項。</td></tr>
        <tr style={zebra(1)}><td style={reportKey}>富邦 ESG／陽信／遊戲橘子</td><td style={reportCell}>持續維護；富邦待安排季度會議，橘子已完成定保。</td></tr>
        <tr style={zebra(1)}><td style={{ ...reportKey, borderBottom: `1px solid ${C.midGray}` }}>台中機場候補</td><td style={{ ...reportCell, borderBottom: `1px solid ${C.midGray}` }}>已退回舊版，後續資料串接方案待定。</td></tr>
        <tr><td rowSpan={2} style={{ ...reportKey, color: C.teal, borderBottom: `1px solid ${C.midGray}` }}>提案與待啟動</td><td style={reportKey}>健保署機櫃提案</td><td style={reportCell}>9/15 已送提案與報價，尚未簽約。</td></tr>
        <tr><td style={{ ...reportKey, borderBottom: `1px solid ${C.midGray}` }}>富邦報表自動化</td><td style={{ ...reportCell, borderBottom: `1px solid ${C.midGray}` }}>未開案。</td></tr>
      </tbody>
    </table>
  </ContentSlide>
);

// P11 結尾
const Ending: Page = () => (
  <div style={{
    ...bgSlide(endingBg), display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center', textAlign: 'center',
  }}>
    <h1 style={{ color: C.white, fontSize: 48, fontWeight: 300, letterSpacing: 6, margin: 0 }}>Thank You</h1>
    <div style={{ display: 'flex', gap: 60, marginTop: 36 }}>
      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 24, letterSpacing: 4 }}>PROFESSIONAL</span>
      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 24, letterSpacing: 4 }}>EFFICIENCY</span>
      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 24, letterSpacing: 4 }}>PASSION</span>
      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 24, letterSpacing: 4 }}>INTEGRITY</span>
    </div>
    <div style={{ color: C.white, fontSize: 28, marginTop: 16, letterSpacing: 8 }}>專業、效率、熱情、誠信</div>
  </div>
);

export const meta: SlideMeta = {
  title: '軟體部 2026/09 主管會議簡報',
  theme: 'ewill-proposal',
  createdAt: '2026-09-21T22:12:18.439Z',
};

export default [
  Cover, // 1 封面
  Headline, // 2 本月重點
  FocusPlan, // 3 工作重心前後對照
  Department, // 4 部門改善與 AI 平台的關係
  AITimeline, // 5 AI 平台時間軸
  AIPlatformPlan, // 6 AI 平台推進規劃
  Finance, // 7 部門分攤與專案請款
  HandoverHow, // 8 ONETSA 交接安排
  ThreeCases, // 9 主要專案
  Projects, // 10 其他專案分類
  Ending, // 11 結尾
] satisfies Page[];
