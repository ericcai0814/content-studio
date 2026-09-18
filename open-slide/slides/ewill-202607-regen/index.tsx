import { useSlidePageNumber } from '@open-slide/core';
import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import coverBg from './assets/cover-bg.png';
import contentBg from './assets/content-bg.png';
import endingBg from './assets/ending-bg.png';

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

const FONT = '"微軟正黑體", "Microsoft JhengHei", "Noto Sans TC", system-ui, sans-serif';

const C = {
  white: '#FFFFFF',
  charcoal: '#3E3A39',
  teal: '#00979C',
  tealDark: '#007A7E',
  amber: '#FBAE40',
  text: '#333333',
  textSoft: '#666666',
  bodySoft: '#555555',
  caption: '#888888',
  lightGray: '#F5F5F5',
  midGray: '#E0E0E0',
  danger: '#D32F2F',
  success: '#2E7D32',
  cardSurface: 'rgba(255,255,255,0.85)',
  zebra: 'rgba(245,245,245,0.7)',
};

/* ---------- theme fixed components (themes/ewill-proposal.md) ---------- */

const Title = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      height: 80,
      background: '#00979C',
      display: 'flex',
      alignItems: 'center',
      padding: '0 80px',
      flexShrink: 0,
    }}
  >
    <span style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 700 }}>{children}</span>
  </div>
);

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 80px',
        fontSize: 18,
        color: '#999999',
        flexShrink: 0,
      }}
    >
      {current} / {total}
    </div>
  );
};

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 18, color: '#888888', marginBottom: 16 }}>{children}</div>
);

const Badge = ({
  tone,
  children,
}: {
  tone: 'danger' | 'warning' | 'success' | 'neutral';
  children: React.ReactNode;
}) => {
  const map = {
    danger: { bg: '#D32F2F', color: '#FFFFFF' },
    warning: { bg: '#FBAE40', color: '#3E3A39' },
    success: { bg: '#00979C', color: '#FFFFFF' },
    neutral: { bg: '#E0E0E0', color: '#555555' },
  };
  const s = map[tone];
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 16,
        padding: '2px 10px',
        borderRadius: 4,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        background: s.bg,
        color: s.color,
      }}
    >
      {children}
    </span>
  );
};

const Card = ({
  accent,
  title,
  children,
}: {
  accent: string;
  title: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      borderRadius: 8,
      padding: '20px 22px',
      borderTop: `5px solid ${accent}`,
      background: 'rgba(255,255,255,0.85)',
      fontSize: 20,
    }}
  >
    <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10, color: '#3E3A39' }}>{title}</div>
    {children}
  </div>
);

const ContentSlide = ({
  title,
  bg,
  children,
}: {
  title: string;
  bg: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: bg,
      backgroundSize: 'cover',
      backgroundPosition: 'left bottom',
      fontFamily: FONT,
      color: '#333333',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Title>{title}</Title>
    <div
      style={{
        flex: 1,
        padding: '40px 80px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
    <Footer />
  </div>
);

/* ---------- deck-local components ---------- */

const bulletList = {
  margin: 0,
  paddingLeft: 20,
  fontSize: 18,
  color: C.bodySoft,
  lineHeight: 1.7,
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontSize: 22,
      fontWeight: 700,
      color: C.charcoal,
      borderLeft: `5px solid ${C.teal}`,
      paddingLeft: 12,
      marginBottom: 16,
    }}
  >
    {children}
  </div>
);

const AgendaItem = ({ num, name, desc }: { num: string; name: string; desc: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
      borderRadius: 8,
      padding: '18px 22px',
      borderLeft: `5px solid ${C.teal}`,
      background: C.cardSurface,
    }}
  >
    <span style={{ fontSize: 22, fontWeight: 700, color: C.teal, lineHeight: 1.3 }}>{num}</span>
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.charcoal, marginBottom: 6 }}>{name}</div>
      <div style={{ fontSize: 18, color: C.bodySoft, lineHeight: 1.5 }}>{desc}</div>
    </div>
  </div>
);

const PlanCard = ({
  accent,
  stage,
  tone,
  badge,
  sub,
  children,
}: {
  accent: string;
  stage: string;
  tone: 'danger' | 'warning' | 'success' | 'neutral';
  badge: string;
  sub: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      borderRadius: 8,
      padding: '20px 22px',
      borderTop: `5px solid ${accent}`,
      background: C.cardSurface,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
      }}
    >
      <span style={{ fontSize: 22, fontWeight: 700, color: C.charcoal }}>{stage}</span>
      <Badge tone={tone}>{badge}</Badge>
    </div>
    <div style={{ fontSize: 16, color: C.caption, marginBottom: 12 }}>{sub}</div>
    <ul style={bulletList}>{children}</ul>
  </div>
);

const PersonCard = ({
  name,
  role,
  scope,
  growth,
}: {
  name: string;
  role: string;
  scope: string;
  growth: string;
}) => (
  <div
    style={{
      borderRadius: 8,
      padding: '16px 18px',
      borderTop: `4px solid ${C.teal}`,
      background: C.cardSurface,
    }}
  >
    <div style={{ fontSize: 22, fontWeight: 700, color: C.charcoal }}>{name}</div>
    <div style={{ fontSize: 16, fontWeight: 700, color: C.teal, marginTop: 4 }}>{role}</div>
    <div style={{ fontSize: 18, color: C.bodySoft, marginTop: 8, lineHeight: 1.5 }}>{scope}</div>
    {growth ? (
      <div style={{ fontSize: 16, color: C.caption, marginTop: 6 }}>{growth}</div>
    ) : null}
  </div>
);

const TH = ({ label, width, align }: { label: string; width: string; align?: 'left' | 'right' }) => (
  <th
    style={{
      fontSize: 14,
      fontWeight: 700,
      color: C.white,
      textAlign: align ?? 'left',
      letterSpacing: '0.08em',
      padding: '10px 16px',
      width,
    }}
  >
    {label}
  </th>
);

const tdBase = {
  fontSize: 18,
  color: C.text,
  padding: '12px 16px',
  verticalAlign: 'middle' as const,
};

const StatusRow = ({
  project,
  tone,
  status,
  event,
  zebra,
  sub,
}: {
  project: string;
  tone: 'danger' | 'warning' | 'success' | 'neutral';
  status: string;
  event: string;
  zebra: boolean;
  sub?: boolean;
}) => (
  <tr style={{ background: zebra ? C.zebra : 'transparent' }}>
    <td style={{ ...tdBase, paddingLeft: sub ? 40 : 16, color: sub ? C.bodySoft : C.text }}>
      {sub ? <span style={{ color: C.caption, marginRight: 6 }}>└</span> : null}
      {project}
    </td>
    <td style={tdBase}>
      <Badge tone={tone}>{status}</Badge>
    </td>
    <td style={tdBase}>{event}</td>
  </tr>
);

const RiskBlock = ({
  accent,
  tone,
  label,
  heading,
  children,
}: {
  accent: string;
  tone: 'danger' | 'warning' | 'success' | 'neutral';
  label: string;
  heading: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      display: 'flex',
      gap: 20,
      borderRadius: 8,
      padding: '18px 22px',
      borderLeft: `5px solid ${accent}`,
      background: C.cardSurface,
    }}
  >
    <div style={{ flexShrink: 0, width: 110, paddingTop: 4 }}>
      <Badge tone={tone}>{label}</Badge>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.charcoal, marginBottom: 8 }}>
        {heading}
      </div>
      {children}
    </div>
  </div>
);

const metricBox = {
  flex: 1,
  border: `1px solid ${C.midGray}`,
  borderRadius: 8,
  background: C.white,
  padding: '14px 18px',
};

const Metric = ({ value, label }: { value: string; label: string }) => (
  <div style={metricBox}>
    <div style={{ fontSize: 44, fontWeight: 700, color: C.teal, lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: 16, color: C.textSoft, marginTop: 6 }}>{label}</div>
  </div>
);

const CatRow = ({ name, count }: { name: string; count: string }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
    <span style={{ fontSize: 18, color: C.bodySoft }}>{name}</span>
    <span style={{ fontSize: 22, fontWeight: 700, color: C.teal }}>{count}</span>
  </div>
);

const PerfRow = ({
  project,
  amount,
  revenue,
  margin,
  marginColor,
  status,
  zebra,
}: {
  project: string;
  amount: string;
  revenue: string;
  margin: string;
  marginColor: string;
  status: string;
  zebra: boolean;
}) => (
  <tr style={{ background: zebra ? C.zebra : 'transparent' }}>
    <td style={tdBase}>{project}</td>
    <td style={{ ...tdBase, textAlign: 'right' }}>{amount}</td>
    <td style={{ ...tdBase, textAlign: 'right' }}>{revenue}</td>
    <td style={{ ...tdBase, textAlign: 'right', color: marginColor, fontWeight: 700 }}>{margin}</td>
    <td style={{ ...tdBase, color: C.textSoft }}>{status}</td>
  </tr>
);

const BarSeg = ({ pct, color, label }: { pct: number; color: string; label: string }) => (
  <div
    style={{
      flex: `0 0 ${pct}%`,
      background: color,
      color: C.white,
      fontSize: 14,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {label}
  </div>
);

const MaintRow = ({
  project,
  revenue,
  margin,
  marginColor,
  note,
  zebra,
}: {
  project: string;
  revenue: string;
  margin: string;
  marginColor: string;
  note: string;
  zebra: boolean;
}) => (
  <tr style={{ background: zebra ? C.zebra : 'transparent' }}>
    <td style={tdBase}>{project}</td>
    <td style={{ ...tdBase, textAlign: 'right' }}>{revenue}</td>
    <td style={{ ...tdBase, textAlign: 'right', color: marginColor, fontWeight: 700 }}>{margin}</td>
    <td style={{ ...tdBase, color: C.textSoft }}>{note}</td>
  </tr>
);

const RevenueRow = ({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
}) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 18, color: C.textSoft }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 700, color: C.charcoal }}>{value}</span>
    </div>
    <div
      style={{
        height: 10,
        borderRadius: 4,
        background: C.midGray,
        marginTop: 8,
        overflow: 'hidden',
      }}
    >
      <div style={{ width: `${pct}%`, height: '100%', background: color }} />
    </div>
  </div>
);

const FocusCard = ({
  num,
  accent,
  tint,
  titleColor,
  heading,
  children,
}: {
  num: string;
  accent: string;
  tint: string;
  titleColor: string;
  heading: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      position: 'relative',
      borderRadius: 8,
      padding: '20px 22px',
      borderTop: `5px solid ${accent}`,
      background: C.cardSurface,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 4,
        right: 16,
        fontSize: 56,
        fontWeight: 700,
        lineHeight: 1,
        color: tint,
      }}
    >
      {num}
    </div>
    <div
      style={{
        position: 'relative',
        fontSize: 22,
        fontWeight: 700,
        color: titleColor,
        marginBottom: 10,
      }}
    >
      {heading}
    </div>
    <ul style={bulletList}>{children}</ul>
  </div>
);

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      display: 'inline-block',
      fontSize: 18,
      color: C.bodySoft,
      background: C.cardSurface,
      border: `1px solid ${C.midGray}`,
      borderRadius: 4,
      padding: '8px 16px',
    }}
  >
    {children}
  </span>
);

const ValueWord = ({ en, zh }: { en: string; zh: string }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 22, fontWeight: 700, color: C.white, letterSpacing: 3 }}>{en}</div>
    <div
      style={{
        fontSize: 18,
        color: 'rgba(255,255,255,0.85)',
        letterSpacing: 2,
        marginTop: 12,
      }}
    >
      {zh}
    </div>
  </div>
);

/* ---------- pages ---------- */

const Cover: Page = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      backgroundImage: `url(${coverBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'left bottom',
      fontFamily: FONT,
      color: '#333333',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ flex: 1, minHeight: '40%' }} />
    <div style={{ background: C.teal, padding: '20px 80px', width: '55%' }}>
      <h1 style={{ color: C.white, fontSize: 48, fontWeight: 700, lineHeight: 1.3, margin: 0 }}>
        軟體部 2026/07
        <br />
        主管會議簡報
      </h1>
    </div>
    <div style={{ background: C.charcoal, padding: '12px 80px', width: '55%' }}>
      <span style={{ color: C.white, fontSize: 24 }}>接任首月執行成果、專案風險與改善措施</span>
    </div>
    <div style={{ padding: '18px 80px 0', width: '55%' }}>
      <div style={{ fontSize: 18, color: C.bodySoft }}>報告人：Eric</div>
      <div style={{ fontSize: 18, color: C.bodySoft, marginTop: 8 }}>2026 / 07 / 23</div>
    </div>
    <div style={{ flex: 1 }} />
  </div>
);

const Agenda: Page = () => (
  <ContentSlide title="報告範圍" bg={`url(${contentBg})`}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <AgendaItem num="01" name="30 / 60 / 90 天計畫追蹤" desc="接任目標達成進度" />
      <AgendaItem num="02" name="本月改善成果" desc="流程、專案、人員工具" />
      <AgendaItem num="03" name="組織現況與人員發展" desc="團隊結構與方向" />
      <AgendaItem num="04" name="專案進度總覽" desc="12 案即時狀態" />
      <AgendaItem num="05" name="風險與事件" desc="高風險案與維護量化" />
      <AgendaItem num="06" name="業績管理" desc="營收、毛利、年度彙總" />
      <div style={{ gridColumn: '1 / -1' }}>
        <AgendaItem num="07" name="下月重點" desc="8 月 Top 3" />
      </div>
    </div>
  </ContentSlide>
);

const Plan: Page = () => (
  <ContentSlide title="30 / 60 / 90 天計畫追蹤" bg={`url(${contentBg})`}>
    <Eyebrow>接任日：6/1 — 30 天已到期 / 60 天執行中 / 90 天為下階段目標</Eyebrow>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 20,
      }}
    >
      <PlanCard accent={C.teal} stage="30 天（7/1）" tone="success" badge="完成" sub="交接與高風險案">
        <li>交接與追蹤機制已建立（每日紀錄、逐案追蹤）</li>
        <li>19 案責任人已全數指定</li>
      </PlanCard>
      <PlanCard accent={C.amber} stage="60 天（8/1）" tone="warning" badge="執行中" sub="角色與流程">
        <li>PMO 四場會議推進（6/24-7/20）</li>
        <li>BRD/PRD/FSD 分工定稿</li>
        <li>PMSys 專案管理系統開發啟動</li>
        <li>會議品質三型態 7 月試行中</li>
      </PlanCard>
      <PlanCard
        accent={C.midGray}
        stage="90 天（9/1）"
        tone="neutral"
        badge="下階段"
        sub="流程驗證與改善"
      >
        <li>AI workflow：海巡署作為首個試點</li>
        <li>維護案依類型/頻率建立分級制度</li>
        <li>評估可複製的產品線候選（承商系統等）</li>
      </PlanCard>
    </div>
  </ContentSlide>
);

const Improvements: Page = () => (
  <ContentSlide title="本月改善成果" bg={`url(${contentBg})`}>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 20,
      }}
    >
      <Card accent={C.teal} title="流程面">
        <ul style={bulletList}>
          <li>建立固定週會與專案同步機制（已開 4 場，含會議紀錄）</li>
          <li>溝通管道整合：口頭同步改為文字留底，每日結構化紀錄（22 日）</li>
          <li>管制表雙層核對，發現 5 案合約缺口</li>
        </ul>
      </Card>
      <Card accent={C.amber} title="專案面">
        <ul style={bulletList}>
          <li>台積電宿舍二階驗收 2A 通過，驗收文件齊全</li>
          <li>陽信銀行 DB 異常處理：清 19 億筆 / 釋放 410 GB，建立自動清理排程</li>
          <li>央行弱點修正 90%、財資機櫃 GCB 完成、台中機場異常 RCA 完成</li>
          <li>富邦 ESG 報表進入第二階段（圖表樣式 + 資料來源確認）</li>
        </ul>
      </Card>
      <Card accent={C.tealDark} title="人員 + 工具">
        <ul style={bulletList}>
          <li>尚文回任（7/14 報到）— 接任後首個 JD 成效</li>
          <li>PMSys 專案管理系統開發啟動（紘昱負責，預計 1 個月）</li>
          <li>柏崴、柏佑交接完畢（7/31 離職）</li>
          <li>建立持續招募流程（目標 2 RD + 1 PM），避免人才流失時來不及反應</li>
        </ul>
      </Card>
    </div>
  </ContentSlide>
);

const Org: Page = () => (
  <ContentSlide title="組織現況與人員發展方向" bg={`url(${contentBg})`}>
    <Eyebrow>留任核心 6 人 + 持續招募中（目標：2 RD + 1 PM）/ 扁平化運作，全員直接報告</Eyebrow>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          borderRadius: 8,
          background: C.teal,
          color: C.white,
          padding: '12px 36px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700 }}>Eric</div>
        <div style={{ fontSize: 16, marginTop: 2 }}>6/1 接任主管</div>
      </div>
      <div style={{ width: 2, height: 20, background: C.teal }} />
      <div style={{ width: '66.6%', height: 2, background: C.teal }} />
      <div style={{ width: '66.6%', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: 2, height: 16, background: C.teal }} />
        <div style={{ width: 2, height: 16, background: C.teal }} />
        <div style={{ width: 2, height: 16, background: C.teal }} />
      </div>
    </div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 20,
        marginTop: 12,
      }}
    >
      <PersonCard
        name="王雪綸"
        role="PM / UIUX"
        scope="台積電 UIUX、保發中心"
        growth="方向：PMO 負責人"
      />
      <PersonCard name="楊若絹" role="PM" scope="台積電宿舍（主 PM）" growth="" />
      <PersonCard
        name="Gino（崔緯平）"
        role="RD / 後端"
        scope="保發、松機、長庚、海巡署"
        growth="方向：架構師 / DBA 方向"
      />
      <PersonCard name="Gill" role="PM / QA" scope="台積電測試、海巡署 PM、PMO" growth="" />
      <PersonCard name="紘昱" role="RD / 前端" scope="PMSys 開發" growth="方向：朝 SRE 方向" />
      <PersonCard
        name="尚文（游尚文）"
        role="RD（7/14 回任）"
        scope="富邦報價、北工、OneTSA"
        growth="方向：前後端整合"
      />
    </div>
    <div
      style={{
        marginTop: 24,
        borderRadius: 8,
        padding: '14px 20px',
        borderLeft: `5px solid ${C.amber}`,
        background: C.cardSurface,
        fontSize: 18,
        color: C.bodySoft,
      }}
    >
      策略：前端轉全端（尚文、紘昱主導向 Gino 請教） | 松機維護全員具備 | 柏崴、柏佑均已交接完畢
      7/31 離職
    </div>
  </ContentSlide>
);

const Projects: Page = () => (
  <ContentSlide title="專案進度總覽" bg={`url(${contentBg})`}>
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      <thead>
        <tr style={{ background: C.charcoal }}>
          <TH label="專案" width="24%" />
          <TH label="狀態" width="15%" />
          <TH label="本月關鍵事件" width="61%" />
        </tr>
      </thead>
      <tbody>
        <StatusRow
          project="保發中心（第六期）"
          tone="danger"
          status="限期改善"
          event="7/9 驗收未過，限期至 8/9；影音效能未達標"
          zebra={false}
        />
        <StatusRow
          project="台積電宿舍"
          tone="warning"
          status="待上包回覆"
          event="最新版已交付；2A 通過；卡在越世未轉知"
          zebra
        />
        <StatusRow
          project="松山機場 / OneTSA"
          tone="warning"
          status="高維護負載"
          event="7/22 DB 監控部署；30 事件 / 22 天（92%）"
          zebra={false}
        />
        <StatusRow
          project="威彼維護（3 客戶）"
          tone="neutral"
          status="報價更新"
          event="威彼維持 3w/月；富邦 8 月起獨立新增 5w/月（6 個月期）"
          zebra
        />
        <StatusRow
          project="富邦 ESG"
          tone="success"
          status="第二階段"
          event="7/16 圖表樣式 → 7/22 資料來源確認"
          zebra={false}
          sub
        />
        <StatusRow
          project="陽信銀行"
          tone="success"
          status="提前完成"
          event="清 19 億筆 / 410 GB + 自動清理排程"
          zebra
          sub
        />
        <StatusRow
          project="遊戲橘子 SBMS"
          tone="success"
          status="正常"
          event="每月定保；6/17 用電異常已修復"
          zebra={false}
          sub
        />
        <StatusRow
          project="長庚 HRPMS"
          tone="neutral"
          status="穩定運作"
          event="精誠主導、我方為輔；9 月轉主軸"
          zebra
        />
        <StatusRow
          project="台中機場候補"
          tone="success"
          status="已處置"
          event="7/8 RCA 完成 + MySQL 參數調整"
          zebra={false}
        />
        <StatusRow
          project="TOPS（北市採購）"
          tone="neutral"
          status="待新合約"
          event="SSL 憑證已更新"
          zebra
        />
        <StatusRow
          project="影音串流平台"
          tone="warning"
          status="VM 申請中"
          event="6 台 VM 需求（正式 3+測試 3），首客戶 CAC"
          zebra={false}
        />
        <StatusRow
          project="OAC TDS（海巡署）"
          tone="success"
          status="已啟動"
          event="7/22 啟始會議完成；目標做成可複製模板"
          zebra
        />
      </tbody>
    </table>
  </ContentSlide>
);

const Risks: Page = () => (
  <ContentSlide title="風險與事件" bg={`url(${contentBg})`}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <RiskBlock
        accent={C.danger}
        tone="danger"
        label="最高風險"
        heading="保發中心第六期驗收未過"
      >
        <ul style={bulletList}>
          <li>7/9 驗收未通過，限期改善至 8/9</li>
          <li>主因：影音平台效能未達標</li>
          <li>
            管制表毛利{' '}
            <strong style={{ color: C.danger, fontWeight: 700 }}>-195.9 萬</strong>
          </li>
          <li>我方已完成：Gino deadlock 修正、多表索引補建</li>
          <li>驊宏責任切分策略待討論</li>
        </ul>
      </RiskBlock>
      <RiskBlock
        accent={C.amber}
        tone="warning"
        label="中風險"
        heading="台積電宿舍 — 驗收卡在上包"
      >
        <ul style={bulletList}>
          <li>驗收文件 7/7 齊全，最新版已交付，2A 通過</li>
          <li>卡點：越世至今（7/21）未轉知力麗/台積電</li>
          <li>風險：影響請款時程（台積要求 7/20 前簽核）</li>
        </ul>
      </RiskBlock>
      <RiskBlock accent={C.teal} tone="neutral" label="量化數據" heading="松機維護負載量化">
        <div style={{ fontSize: 16, color: C.caption, marginBottom: 12 }}>
          維護紀錄統計（6/18-7/22，24 個工作日）
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
          <Metric value="92%" label="有維護活動天數（22 / 24 天）" />
          <Metric value="30" label="維護事件總數" />
          <div style={metricBox}>
            <div style={{ fontSize: 16, color: C.textSoft, marginBottom: 8 }}>事件類別明細</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <CatRow name="遠端支援" count="14" />
              <CatRow name="協調測試" count="13" />
              <CatRow name="系統異常" count="3" />
            </div>
          </div>
        </div>
      </RiskBlock>
    </div>
  </ContentSlide>
);

const PerfProjects: Page = () => (
  <ContentSlide title="業績管理 — 專案" bg={`url(${contentBg})`}>
    <Eyebrow>資料來源：專案管制表（20260622）</Eyebrow>
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      <thead>
        <tr style={{ background: C.charcoal }}>
          <TH label="專案" width="32%" />
          <TH label="專案金額" width="16%" align="right" />
          <TH label="2026 營收" width="16%" align="right" />
          <TH label="毛利" width="16%" align="right" />
          <TH label="狀態" width="20%" />
        </tr>
      </thead>
      <tbody>
        <PerfRow
          project="保發-數位學習平台"
          amount="720.3 萬"
          revenue="180.1 萬"
          margin="-195.9 萬"
          marginColor={C.danger}
          status="限期改善"
          zebra={false}
        />
        <PerfRow
          project="台積電宿舍管理"
          amount="690 萬"
          revenue="379.5 萬"
          margin="46.5 萬"
          marginColor={C.success}
          status="待上包回覆"
          zebra
        />
        <PerfRow
          project="松機 ONE TSA V1.6"
          amount="379 萬"
          revenue="379 萬"
          margin="18.95 萬"
          marginColor={C.success}
          status="無合約"
          zebra={false}
        />
        <PerfRow
          project="KPMG TOPS"
          amount="1,132.75 萬"
          revenue="97.38 萬"
          margin="252.4 萬"
          marginColor={C.success}
          status="待新合約"
          zebra
        />
        <PerfRow
          project="威彼-技術合作與支援"
          amount="105 萬"
          revenue="105 萬"
          margin="10 萬"
          marginColor={C.success}
          status="接案"
          zebra={false}
        />
      </tbody>
    </table>
    <div style={{ marginTop: 28 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.charcoal, marginBottom: 10 }}>
        毛利分布
      </div>
      <div style={{ display: 'flex', height: 44, borderRadius: 8, overflow: 'hidden' }}>
        <BarSeg pct={48.2} color={C.teal} label="TOPS +252" />
        <BarSeg pct={8.9} color={C.tealDark} label="台積 +47" />
        <BarSeg pct={3.6} color={C.teal} label="松機" />
        <BarSeg pct={1.9} color={C.tealDark} label="威彼" />
        <BarSeg pct={37.4} color={C.danger} label="保發 -196" />
      </div>
    </div>
  </ContentSlide>
);

const PerfMaintenance: Page = () => (
  <ContentSlide title="業績管理 — 維護 + 整體" bg={`url(${contentBg})`}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
      <div>
        <SectionLabel>維護案</SectionLabel>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ background: C.charcoal }}>
              <TH label="專案" width="34%" />
              <TH label="營收" width="19%" align="right" />
              <TH label="毛利" width="18%" align="right" />
              <TH label="備註" width="29%" />
            </tr>
          </thead>
          <tbody>
            <MaintRow
              project="北工環境管理"
              revenue="100.28 萬"
              margin="78.4 萬"
              marginColor={C.success}
              note="月 11.14 萬"
              zebra={false}
            />
            <MaintRow
              project="威彼-技術合作與支援"
              revenue="37.8 萬"
              margin="7.8 萬"
              marginColor={C.success}
              note="月 3.15 萬（維持）"
              zebra
            />
            <MaintRow
              project="富邦維護（8 月新增）"
              revenue="30 萬"
              margin="—"
              marginColor={C.caption}
              note="月 5 萬 x 6 個月"
              zebra={false}
            />
            <MaintRow
              project="精誠-長庚 HRPMS"
              revenue="336 萬"
              margin="-31 萬"
              marginColor={C.danger}
              note="9 月接主軸"
              zebra
            />
            <MaintRow
              project="臺中航空站"
              revenue="14.8 萬"
              margin="4.8 萬"
              marginColor={C.success}
              note="接案"
              zebra={false}
            />
          </tbody>
        </table>
      </div>
      <div>
        <SectionLabel>年度彙總（2026）</SectionLabel>
        <div style={{ borderRadius: 8, background: C.cardSurface, padding: '24px 28px' }}>
          <RevenueRow label="專案營收" value="1,141 萬" pct={69} color={C.teal} />
          <RevenueRow label="維護營收" value="519 萬" pct={31} color={C.tealDark} />
          <div style={{ borderTop: `1px solid ${C.midGray}`, marginTop: 4, paddingTop: 20 }}>
            <div style={{ fontSize: 18, color: C.textSoft }}>年度合計</div>
            <div style={{ fontSize: 48, fontWeight: 700, color: C.teal, lineHeight: 1.2 }}>
              1,660 萬
            </div>
          </div>
          <div style={{ fontSize: 16, color: C.caption, marginTop: 12 }}>專案 69% / 維護 31%</div>
        </div>
      </div>
    </div>
  </ContentSlide>
);

const NextMonth: Page = () => (
  <ContentSlide title="下月重點" bg={`url(${contentBg})`}>
    <SectionLabel>8 月 Top 3</SectionLabel>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 20,
      }}
    >
      <FocusCard
        num="01"
        accent={C.danger}
        tint="rgba(211,47,47,0.15)"
        titleColor={C.danger}
        heading="保發中心限期改善"
      >
        <li>截止 8/9</li>
        <li>驊宏責任切分為核心</li>
        <li>需會議中討論策略</li>
      </FocusCard>
      <FocusCard
        num="02"
        accent={C.teal}
        tint="rgba(0,151,156,0.15)"
        titleColor={C.charcoal}
        heading="海巡署 OAC TDS"
      >
        <li>已啟動開發</li>
        <li>Gino 工程、Gill PM</li>
        <li>PMO + AI workflow 試點</li>
      </FocusCard>
      <FocusCard
        num="03"
        accent={C.teal}
        tint="rgba(0,151,156,0.15)"
        titleColor={C.charcoal}
        heading="松機 runbook + 工單"
      >
        <li>VM 已架設 192.168.50.91</li>
        <li>8 月中產出初版 SOP</li>
      </FocusCard>
    </div>
    <div style={{ marginTop: 32 }}>
      <SectionLabel>其他進行中</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Chip>台積電二階驗收 — 持續追越世</Chip>
        <Chip>PMSys 開發中（紘昱，預計 1 個月）</Chip>
        <Chip>長庚 HRPMS 9 月接主軸準備</Chip>
      </div>
    </div>
  </ContentSlide>
);

const Closing: Page = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      backgroundImage: `url(${endingBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'left bottom',
      fontFamily: FONT,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <h1
      style={{
        margin: 0,
        fontSize: 48,
        fontWeight: 300,
        letterSpacing: 6,
        color: C.white,
      }}
    >
      Thank You
    </h1>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 240px)',
        marginTop: 64,
      }}
    >
      <ValueWord en="PROFESSIONAL" zh="專業" />
      <ValueWord en="EFFICIENCY" zh="效率" />
      <ValueWord en="PASSION" zh="熱情" />
      <ValueWord en="INTEGRITY" zh="誠信" />
    </div>
  </div>
);

export const meta: SlideMeta = {
  title: '軟體部 2026/07 主管會議簡報',
  theme: 'ewill-proposal',
  createdAt: '2026-09-18T17:57:22.141Z',
};

export default [
  Cover,
  Agenda,
  Plan,
  Improvements,
  Org,
  Projects,
  Risks,
  PerfProjects,
  PerfMaintenance,
  NextMonth,
  Closing,
] satisfies Page[];
