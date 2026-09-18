import type { DesignSystem, Page } from '@open-slide/core';

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

const C = {
  teal: '#00979C',
  tealDark: '#007A7E',
  charcoal: '#3E3A39',
  amber: '#FBAE40',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  midGray: '#E0E0E0',
  text: '#333333',
  textSoft: '#666666',
  danger: '#D32F2F',
  success: '#2E7D32',
};

const font = design.fonts.body;

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

const headerText: React.CSSProperties = {
  color: C.white, fontSize: 36, fontWeight: 700,
};

const bodyArea: React.CSSProperties = {
  flex: 1, padding: '40px 80px 20px',
  display: 'flex', flexDirection: 'column' as const, justifyContent: 'center' as const,
  overflow: 'hidden',
};

const footerBar: React.CSSProperties = {
  height: 36, display: 'flex', alignItems: 'center',
  justifyContent: 'flex-end', padding: '0 80px',
  fontSize: 18, color: '#999',
};

const badge = (type: 'danger' | 'warning' | 'success' | 'neutral'): React.CSSProperties => {
  const map = {
    danger: { bg: C.danger, color: C.white },
    warning: { bg: C.amber, color: C.charcoal },
    success: { bg: C.teal, color: C.white },
    neutral: { bg: C.midGray, color: '#555' },
  };
  const s = map[type];
  return {
    display: 'inline-block', fontSize: 16, padding: '2px 10px',
    borderRadius: 4, fontWeight: 700, whiteSpace: 'nowrap' as const,
    background: s.bg, color: s.color,
  };
};

const ContentSlide = ({ title, pageNum, children }: {
  title: string; pageNum: number; children: React.ReactNode;
}) => (
  <div style={{ ...bgSlide(contentBg), display: 'flex', flexDirection: 'column' }}>
    <div style={headerBar}><span style={headerText}>{title}</span></div>
    <div style={bodyArea}>{children}</div>
    <div style={footerBar}>{pageNum} / 11</div>
  </div>
);

// S1 Cover
const Cover: Page = () => (
  <div style={{ ...bgSlide(coverBg), display: 'flex', flexDirection: 'column' }}>
    <div style={{ flex: 1, minHeight: '43%' }} />
    <div style={{ background: C.teal, padding: '20px 80px', width: '55%' }}>
      <h1 style={{ color: C.white, fontSize: 48, fontWeight: 700, lineHeight: 1.3, margin: 0 }}>
        軟體部 2026/07<br />主管會議簡報
      </h1>
    </div>
    <div style={{ background: C.charcoal, padding: '12px 80px', width: '55%' }}>
      <span style={{ color: C.white, fontSize: 24 }}>接任首月執行成果、專案風險與改善措施</span>
    </div>
    <div style={{ padding: '12px 80px', width: '55%', display: 'flex', gap: 40 }}>
      <span style={{ fontSize: 18, color: '#555' }}>Eric</span>
      <span style={{ fontSize: 18, color: '#555' }}>2026 / 07 / 23</span>
    </div>
    <div style={{ flex: 1 }} />
  </div>
);

// S2 Agenda
const Agenda: Page = () => {
  const items = [
    { n: 1, t: '30 / 60 / 90 天計畫追蹤', d: '接任目標達成進度' },
    { n: 2, t: '本月改善成果', d: '流程、專案、人員工具' },
    { n: 3, t: '組織現況與人員發展', d: '團隊結構與方向' },
    { n: 4, t: '專案進度總覽', d: '12 案即時狀態' },
    { n: 5, t: '風險與事件', d: '高風險案與維護量化' },
    { n: 6, t: '業績管理', d: '營收、毛利、年度彙總' },
    { n: 7, t: '下月重點', d: '8 月 Top 3' },
  ];
  return (
    <ContentSlide title="報告範圍" pageNum={2}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {items.map((it) => (
          <div key={it.n} style={{
            display: 'flex', alignItems: 'center', gap: 20,
            padding: '20px 24px', borderRadius: 8,
            borderLeft: `5px solid ${it.n === 7 ? C.amber : C.teal}`,
            background: 'rgba(255,255,255,0.85)',
            ...(it.n === 7 ? { gridColumn: 'span 2' } : {}),
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: it.n === 7 ? C.amber : C.teal, color: it.n === 7 ? C.charcoal : C.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 22, flexShrink: 0,
            }}>{it.n}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{it.t}</div>
              <div style={{ fontSize: 16, color: '#888', marginTop: 2 }}>{it.d}</div>
            </div>
          </div>
        ))}
      </div>
    </ContentSlide>
  );
};

// S3 30/60/90
const PhaseCard = ({ title, tag, tagColor, tagBg, subtitle, items, dotColor }: {
  title: string; tag: string; tagColor: string; tagBg: string; subtitle: string;
  items: string[]; dotColor: string;
}) => (
  <div style={{
    borderRadius: 8, padding: '20px 22px', borderTop: `5px solid ${dotColor}`,
    background: 'rgba(255,255,255,0.85)', fontSize: 20,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <span style={{ fontWeight: 700, fontSize: 22 }}>{title}</span>
      <span style={{ fontSize: 14, padding: '3px 10px', borderRadius: 4, fontWeight: 700, background: tagBg, color: tagColor }}>{tag}</span>
    </div>
    <div style={{ fontSize: 16, color: '#888', marginBottom: 10 }}>{subtitle}</div>
    {items.map((it, i) => (
      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline', padding: '4px 0', color: '#555' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0, marginTop: 6 }} />
        <span>{it}</span>
      </div>
    ))}
  </div>
);

const Plan: Page = () => (
  <ContentSlide title="30 / 60 / 90 天計畫追蹤" pageNum={3}>
    <p style={{ fontSize: 18, color: '#888', marginBottom: 16 }}>接任日：6/1 -- 30 天已到期 / 60 天執行中 / 90 天為下階段目標</p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
      <PhaseCard title="30 天（7/1）" tag="完成" tagColor={C.white} tagBg={C.teal} subtitle="交接與高風險案" dotColor={C.teal}
        items={['交接與追蹤機制已建立（每日紀錄、逐案追蹤）', '19 案責任人已全數指定']} />
      <PhaseCard title="60 天（8/1）" tag="執行中" tagColor={C.charcoal} tagBg={C.amber} subtitle="角色與流程" dotColor={C.amber}
        items={['PMO 四場會議推進（6/24-7/20）', 'BRD/PRD/FSD 分工定稿', 'PMSys 專案管理系統開發啟動', '會議品質三型態 7 月試行中']} />
      <PhaseCard title="90 天（9/1）" tag="下階段" tagColor="#666" tagBg={C.midGray} subtitle="流程驗證與改善" dotColor="#bbb"
        items={['AI workflow：海巡署作為首個試點', '維護案依類型/頻率建立分級制度', '評估可複製的產品線候選（承商系統等）']} />
    </div>
  </ContentSlide>
);

// S4 Improvements
const Improvements: Page = () => (
  <ContentSlide title="本月改善成果" pageNum={4}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, flex: 1 }}>
      {[
        { title: '流程面', bg: C.teal, items: ['建立固定週會與專案同步機制（已開 4 場，含會議紀錄）', '溝通管道整合：口頭同步改為文字留底，每日結構化紀錄（22 日）', '管制表雙層核對，發現 5 案合約缺口'] },
        { title: '專案面', bg: C.charcoal, items: ['台積電宿舍二階驗收 2A 通過，驗收文件齊全', '陽信銀行 DB 異常處理：清 19 億筆 / 釋放 410 GB，建立自動清理排程', '央行弱點修正 90%、財資機櫃 GCB 完成、台中機場異常 RCA 完成', '富邦 ESG 報表進入第二階段（圖表樣式 + 資料來源確認）'] },
        { title: '人員 + 工具', bg: C.amber, items: ['尚文回任（7/14 報到）-- 接任後首個 JD 成效', 'PMSys 專案管理系統開發啟動（紘昱負責，預計 1 個月）', '柏崴、柏佑交接完畢（7/31 離職）', '建立持續招募流程（目標 2 RD + 1 PM），避免人才流失時來不及反應'] },
      ].map((col) => (
        <div key={col.title} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: C.white, padding: '10px 16px', borderRadius: '8px 8px 0 0', background: col.bg, ...(col.bg === C.amber ? { color: C.charcoal } : {}) }}>{col.title}</div>
          <div style={{ background: 'rgba(255,255,255,0.85)', padding: '14px 16px', borderRadius: '0 0 8px 8px', flex: 1 }}>
            {col.items.map((it, i) => (
              <div key={i} style={{ fontSize: 18, color: '#555', padding: '5px 0', lineHeight: 1.5, display: 'flex', gap: 8 }}>
                <span style={{ flexShrink: 0 }}>-</span><span>{it}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </ContentSlide>
);

// S5 Org
const Org: Page = () => (
  <ContentSlide title="組織現況與人員發展方向" pageNum={5}>
    <p style={{ fontSize: 16, color: '#888', marginBottom: 14 }}>留任核心 6 人 + 持續招募中（目標：2 RD + 1 PM）/ 扁平化運作，全員直接報告</p>
    <div style={{ textAlign: 'center', marginBottom: 14 }}>
      <span style={{ display: 'inline-block', background: C.teal, color: C.white, padding: '10px 40px', borderRadius: 8, fontWeight: 700, fontSize: 22 }}>
        Eric<br /><span style={{ fontWeight: 400, fontSize: 16, opacity: 0.7 }}>6/1 接任主管</span>
      </span>
    </div>
    <div style={{ width: 2, height: 18, background: C.teal, margin: '0 auto 14px' }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {[
        { name: '王雪綸', role: 'PM / UIUX', resp: '台積電 UIUX、保發中心', dir: 'PMO 負責人' },
        { name: '楊若絹', role: 'PM', resp: '台積電宿舍（主 PM）', dir: '' },
        { name: 'Gino（崔緯平）', role: 'RD / 後端', resp: '保發、松機、長庚、海巡署', dir: '架構師 / DBA 方向' },
        { name: 'Gill', role: 'PM / QA', resp: '台積電測試、海巡署 PM、PMO', dir: '' },
        { name: '紘昱', role: 'RD / 前端', resp: 'PMSys 開發', dir: '朝 SRE 方向' },
        { name: '尚文（游尚文）', role: 'RD（7/14 回任）', resp: '富邦報價、北工、OneTSA', dir: '前後端整合' },
      ].map((m) => (
        <div key={m.name} style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 8, padding: 14, textAlign: 'center', borderTop: `4px solid ${C.teal}`, fontSize: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: C.charcoal }}>{m.name}</div>
          <div style={{ fontSize: 14, color: C.teal, fontWeight: 600, margin: '2px 0 6px' }}>{m.role}</div>
          <div style={{ color: '#666', lineHeight: 1.4 }}>{m.resp}</div>
          {m.dir && <div style={{ color: C.amber, fontWeight: 600, marginTop: 4, fontSize: 14 }}>{m.dir}</div>}
        </div>
      ))}
    </div>
    <div style={{ marginTop: 14, padding: '10px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.85)', fontSize: 16, color: '#666', borderLeft: `5px solid ${C.amber}`, lineHeight: 1.5 }}>
      <b>策略：</b>前端轉全端（尚文、紘昱主導向 Gino 請教）| 松機維護全員具備 | 柏崴、柏佑均已交接完畢 7/31 離職
    </div>
  </ContentSlide>
);

// S6 Projects
const Projects: Page = () => {
  const rows: { name: string; status: string; sType: 'danger' | 'warning' | 'success' | 'neutral'; event: string; sub?: boolean }[] = [
    { name: '保發中心（第六期）', status: '限期改善', sType: 'danger', event: '7/9 驗收未過，限期至 8/9；影音效能未達標' },
    { name: '台積電宿舍', status: '待上包回覆', sType: 'warning', event: '最新版已交付；2A 通過；卡在越世未轉知' },
    { name: '松山機場 / OneTSA', status: '高維護負載', sType: 'warning', event: '7/22 DB 監控部署；30 事件 / 22 天（92%）' },
    { name: '威彼維護（3 客戶）', status: '報價更新', sType: 'neutral', event: '威彼維持 3w/月；富邦 8 月起獨立新增 5w/月（6 個月期）' },
    { name: '-- 富邦 ESG', status: '第二階段', sType: 'success', event: '7/16 圖表樣式 -> 7/22 資料來源確認', sub: true },
    { name: '-- 陽信銀行', status: '提前完成', sType: 'success', event: '清 19 億筆 / 410 GB + 自動清理排程', sub: true },
    { name: '-- 遊戲橘子 SBMS', status: '正常', sType: 'success', event: '每月定保；6/17 用電異常已修復', sub: true },
    { name: '長庚 HRPMS', status: '穩定運作', sType: 'neutral', event: '精誠主導、我方為輔；9 月轉主軸' },
    { name: '台中機場候補', status: '已處置', sType: 'success', event: '7/8 RCA 完成 + MySQL 參數調整' },
    { name: 'TOPS（北市採購）', status: '待新合約', sType: 'neutral', event: 'SSL 憑證已更新' },
    { name: '影音串流平台', status: 'VM 申請中', sType: 'warning', event: '6 台 VM 需求（正式 3+測試 3），首客戶 CAC' },
    { name: 'OAC TDS（海巡署）', status: '已啟動', sType: 'success', event: '7/22 啟始會議完成；目標做成可複製模板' },
  ];
  return (
    <ContentSlide title="專案進度總覽" pageNum={6}>
      <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 18 }}>
        <thead>
          <tr style={{ background: C.charcoal, color: C.white, fontSize: 14, textTransform: 'uppercase' as const, letterSpacing: 1 }}>
            <th style={{ textAlign: 'left', padding: '8px 12px' }}>專案</th>
            <th style={{ textAlign: 'left', padding: '8px 12px' }}>狀態</th>
            <th style={{ textAlign: 'left', padding: '8px 12px' }}>本月關鍵事件</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ background: i % 2 === 1 ? 'rgba(245,245,245,0.7)' : 'transparent' }}>
              <td style={{ padding: '6px 12px', fontWeight: r.sub ? 400 : 700, paddingLeft: r.sub ? 30 : 12, color: r.sub ? '#666' : C.text }}>{r.name}</td>
              <td style={{ padding: '6px 12px' }}><span style={badge(r.sType)}>{r.status}</span></td>
              <td style={{ padding: '6px 12px', color: '#555' }}>{r.event}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ContentSlide>
  );
};

// S7 Risks
const Risks: Page = () => (
  <ContentSlide title="風險與事件" pageNum={7}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ borderRadius: 8, padding: '18px 22px', background: 'rgba(255,255,255,0.85)', borderLeft: `6px solid ${C.danger}`, fontSize: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={badge('danger')}>最高風險</span>
          <span style={{ fontWeight: 700, fontSize: 20 }}>保發中心第六期驗收未過</span>
        </div>
        <ul style={{ paddingLeft: 20, color: '#555', lineHeight: 1.7 }}>
          <li>7/9 驗收未通過，限期改善至 8/9</li>
          <li>主因：影音平台效能未達標</li>
          <li>管制表毛利 <b style={{ color: C.danger }}>-195.9 萬</b></li>
          <li>我方已完成：Gino deadlock 修正、多表索引補建</li>
          <li>驊宏責任切分策略待討論</li>
        </ul>
      </div>
      <div style={{ borderRadius: 8, padding: '18px 22px', background: 'rgba(255,255,255,0.85)', borderLeft: `6px solid ${C.amber}`, fontSize: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={badge('warning')}>中風險</span>
          <span style={{ fontWeight: 700, fontSize: 20 }}>台積電宿舍 -- 驗收卡在上包</span>
        </div>
        <ul style={{ paddingLeft: 20, color: '#555', lineHeight: 1.7 }}>
          <li>驗收文件 7/7 齊全，最新版已交付，2A 通過</li>
          <li>卡點：越世至今（7/21）未轉知力麗/台積電</li>
          <li>風險：影響請款時程（台積要求 7/20 前簽核）</li>
        </ul>
      </div>
      <div style={{ borderRadius: 8, padding: '18px 22px', background: 'rgba(255,255,255,0.85)', borderLeft: `6px solid ${C.teal}`, fontSize: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={badge('success')}>量化數據</span>
          <span style={{ fontWeight: 700, fontSize: 20 }}>松機維護負載量化</span>
        </div>
        <p style={{ color: '#666', marginBottom: 10 }}>維護紀錄統計（6/18-7/22，24 個工作日）</p>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'center', flex: 1, background: C.white, borderRadius: 8, padding: 12, border: `1px solid ${C.midGray}` }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: C.teal }}>92%</div>
            <div style={{ fontSize: 14, color: '#888' }}>有維護活動天數<br />22 / 24 天</div>
          </div>
          <div style={{ textAlign: 'center', flex: 1, background: C.white, borderRadius: 8, padding: 12, border: `1px solid ${C.midGray}` }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: C.amber }}>30</div>
            <div style={{ fontSize: 14, color: '#888' }}>維護事件總數</div>
          </div>
          <div style={{ flex: 1, background: C.white, borderRadius: 8, padding: '12px 18px', border: `1px solid ${C.midGray}` }}>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>事件類別</div>
            <div style={{ fontSize: 18, lineHeight: 1.7 }}>遠端支援 14<br />協調測試 13<br />系統異常 3</div>
          </div>
        </div>
      </div>
    </div>
  </ContentSlide>
);

// S8 Finance Projects
const FinProjects: Page = () => {
  const rows = [
    { name: '保發-數位學習平台', amount: '720.3 萬', rev: '180.1 萬', margin: '-195.9 萬', mColor: C.danger, st: '限期改善', sType: 'danger' as const },
    { name: '台積電宿舍管理', amount: '690 萬', rev: '379.5 萬', margin: '46.5 萬', mColor: C.success, st: '待上包回覆', sType: 'warning' as const },
    { name: '松機 ONE TSA V1.6', amount: '379 萬', rev: '379 萬', margin: '18.95 萬', mColor: C.success, st: '無合約', sType: 'warning' as const },
    { name: 'KPMG TOPS', amount: '1,132.75 萬', rev: '97.38 萬', margin: '252.4 萬', mColor: C.success, st: '待新合約', sType: 'neutral' as const },
    { name: '威彼-技術合作與支援', amount: '105 萬', rev: '105 萬', margin: '10 萬', mColor: C.success, st: '接案', sType: 'neutral' as const },
  ];
  return (
    <ContentSlide title="業績管理 -- 專案" pageNum={8}>
      <p style={{ fontSize: 16, color: '#888', marginBottom: 10 }}>資料來源：專案管制表（20260622）</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 18 }}>
        <thead>
          <tr style={{ background: C.charcoal, color: C.white, fontSize: 14, textTransform: 'uppercase' as const }}>
            <th style={{ textAlign: 'left', padding: '8px 12px' }}>專案</th>
            <th style={{ textAlign: 'right', padding: '8px 12px' }}>專案金額</th>
            <th style={{ textAlign: 'right', padding: '8px 12px' }}>2026 營收</th>
            <th style={{ textAlign: 'right', padding: '8px 12px' }}>毛利</th>
            <th style={{ textAlign: 'left', padding: '8px 12px' }}>狀態</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ background: i % 2 === 1 ? 'rgba(245,245,245,0.7)' : 'transparent' }}>
              <td style={{ padding: '7px 12px', fontWeight: 700 }}>{r.name}</td>
              <td style={{ padding: '7px 12px', textAlign: 'right' }}>{r.amount}</td>
              <td style={{ padding: '7px 12px', textAlign: 'right' }}>{r.rev}</td>
              <td style={{ padding: '7px 12px', textAlign: 'right', color: r.mColor, fontWeight: 700 }}>{r.margin}</td>
              <td style={{ padding: '7px 12px' }}><span style={badge(r.sType)}>{r.st}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>毛利分布</div>
        <div style={{ display: 'flex', gap: 3, height: 28, borderRadius: 4, overflow: 'hidden', fontSize: 14, color: C.white }}>
          <div style={{ flex: 252, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>TOPS +252</div>
          <div style={{ flex: 47, background: C.tealDark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>台積 +47</div>
          <div style={{ flex: 19, background: '#5bb5b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>松機</div>
          <div style={{ flex: 10, background: '#8ed0d2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>威彼</div>
          <div style={{ flex: 196, background: C.danger, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>保發 -196</div>
        </div>
      </div>
    </ContentSlide>
  );
};

// S9 Finance Maintenance
const FinMaint: Page = () => (
  <ContentSlide title="業績管理 -- 維護 + 整體" pageNum={9}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.white, background: C.charcoal, padding: '8px 16px', borderRadius: '8px 8px 0 0' }}>維護案</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 17 }}>
          <thead><tr style={{ background: 'rgba(245,245,245,0.7)', fontSize: 13, color: '#888' }}>
            <th style={{ textAlign: 'left', padding: '5px 10px' }}>專案</th>
            <th style={{ textAlign: 'right', padding: '5px 10px' }}>營收</th>
            <th style={{ textAlign: 'right', padding: '5px 10px' }}>毛利</th>
            <th style={{ textAlign: 'left', padding: '5px 10px' }}>備註</th>
          </tr></thead>
          <tbody>
            {[
              { n: '北工環境管理', r: '100.28 萬', m: '78.4 萬', mc: C.success, note: '月 11.14 萬' },
              { n: '威彼-技術合作與支援', r: '37.8 萬', m: '7.8 萬', mc: C.success, note: '月 3.15 萬（維持）' },
              { n: '富邦維護（8 月新增）', r: '30 萬', m: '--', mc: '#888', note: '月 5 萬 x 6 個月' },
              { n: '精誠-長庚 HRPMS', r: '336 萬', m: '-31 萬', mc: C.danger, note: '9 月接主軸' },
              { n: '臺中航空站', r: '14.8 萬', m: '4.8 萬', mc: C.success, note: '接案' },
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.midGray}` }}>
                <td style={{ padding: '6px 10px' }}>{row.n}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{row.r}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right', color: row.mc }}>{row.m}</td>
                <td style={{ padding: '6px 10px' }}>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.white, background: C.charcoal, padding: '8px 16px', borderRadius: '8px 8px 0 0' }}>年度彙總（2026）</div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, marginBottom: 6 }}><span>專案營收</span><span style={{ fontWeight: 700 }}>1,141 萬</span></div>
          <div style={{ height: 10, background: C.midGray, borderRadius: 5, overflow: 'hidden', marginBottom: 16 }}><div style={{ height: '100%', width: '70%', background: C.teal, borderRadius: 5 }} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, marginBottom: 6 }}><span>維護營收</span><span style={{ fontWeight: 700 }}>519 萬</span></div>
          <div style={{ height: 10, background: C.midGray, borderRadius: 5, overflow: 'hidden', marginBottom: 16 }}><div style={{ height: '100%', width: '31%', background: C.amber, borderRadius: 5 }} /></div>
          <div style={{ borderTop: `3px solid ${C.charcoal}`, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 22, fontWeight: 700 }}>年度合計</span>
            <span style={{ fontSize: 44, fontWeight: 700, color: C.teal }}>1,660 萬</span>
          </div>
          <div style={{ fontSize: 16, color: '#888' }}>專案 69% / 維護 31%</div>
        </div>
      </div>
    </div>
  </ContentSlide>
);

// S10 Next Month
const NextMonth: Page = () => (
  <ContentSlide title="下月重點" pageNum={10}>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.charcoal, marginBottom: 16 }}>8 月 Top 3</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 28 }}>
        {[
          { n: 1, t: '保發中心限期改善', d: '截止 8/9\n驊宏責任切分為核心\n需會議中討論策略', color: C.danger },
          { n: 2, t: '海巡署 OAC TDS', d: '已啟動開發\nGino 工程、Gill PM\nPMO + AI workflow 試點', color: C.teal },
          { n: 3, t: '松機 runbook + 工單', d: 'VM 已架設 192.168.50.91\n8 月中產出初版 SOP', color: C.teal },
        ].map((it) => (
          <div key={it.n} style={{ borderRadius: 8, padding: 22, background: 'rgba(255,255,255,0.85)', borderTop: `5px solid ${it.color}`, position: 'relative' }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: it.color, opacity: 0.12, position: 'absolute', top: 8, right: 16 }}>{it.n}</div>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 10 }}>{it.t}</div>
            <div style={{ fontSize: 18, color: '#666', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{it.d}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.charcoal, marginBottom: 12 }}>其他進行中</div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {['台積電二階驗收 -- 持續追越世', 'PMSys 開發中（紘昱，預計 1 個月）', '長庚 HRPMS 9 月接主軸準備'].map((t) => (
          <div key={t} style={{ background: 'rgba(255,255,255,0.85)', padding: '12px 20px', borderRadius: 4, fontSize: 18, color: '#555', borderLeft: `4px solid ${C.teal}` }}>{t}</div>
        ))}
      </div>
    </div>
  </ContentSlide>
);

// S11 Ending
const Ending: Page = () => (
  <div style={{ ...bgSlide(endingBg), display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
    <h1 style={{ color: C.white, fontSize: 48, fontWeight: 300, letterSpacing: 6, margin: 0 }}>Thank You</h1>
    <div style={{ display: 'flex', gap: 60, marginTop: 36 }}>
      {['PROFESSIONAL', 'EFFICIENCY', 'PASSION', 'INTEGRITY'].map((v) => (
        <span key={v} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 20, letterSpacing: 4 }}>{v}</span>
      ))}
    </div>
    <div style={{ color: C.white, fontSize: 24, marginTop: 16, letterSpacing: 8 }}>專業、效率、熱情、誠信</div>
  </div>
);

export default [Cover, Agenda, Plan, Improvements, Org, Projects, Risks, FinProjects, FinMaint, NextMonth, Ending];
