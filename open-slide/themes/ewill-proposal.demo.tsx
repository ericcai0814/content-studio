import { type Page, useSlidePageNumber } from '@open-slide/core';

const FONT = '"微軟正黑體", "Microsoft JhengHei", "Noto Sans TC", system-ui, sans-serif';

// Stand-ins for the deck's three brand backgrounds. A real slide imports
// assets/cover-bg.png / content-bg.png / ending-bg.png; a theme demo must be
// self-contained, so each one is approximated with a gradient in brand colors.
const COVER_BG = 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 52%, rgba(0,151,156,0.20) 76%, rgba(0,122,126,0.42) 100%)';
const CONTENT_BG = 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 64%, #F5F5F5 100%)';
const ENDING_BG = 'linear-gradient(135deg, #00979C 0%, #007A7E 100%)';

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

const Badge = ({ tone, children }: { tone: 'danger' | 'warning' | 'success' | 'neutral'; children: React.ReactNode }) => {
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

const Card = ({ accent, title, children }: { accent: string; title: string; children: React.ReactNode }) => (
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

const ContentSlide = ({ title, bg, children }: { title: string; bg: string; children: React.ReactNode }) => (
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

const bulletList = {
  margin: 0,
  paddingLeft: 20,
  fontSize: 18,
  color: '#555555',
  lineHeight: 1.7,
} as const;

const valueWord = {
  color: 'rgba(255,255,255,0.7)',
  fontSize: 20,
  letterSpacing: 4,
} as const;

const Cover: Page = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: COVER_BG,
      fontFamily: FONT,
      color: '#333333',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ flex: 1, minHeight: '43%' }} />
    <div style={{ background: '#00979C', padding: '20px 80px', width: '55%' }}>
      <h1 style={{ color: '#FFFFFF', fontSize: 48, fontWeight: 700, lineHeight: 1.3, margin: 0 }}>
        Ewill Proposal<br />提案簡報樣式
      </h1>
    </div>
    <div style={{ background: '#3E3A39', padding: '12px 80px', width: '55%' }}>
      <span style={{ color: '#FFFFFF', fontSize: 24 }}>白底 · teal 標題帶 · 半透明資訊卡</span>
    </div>
    <div style={{ padding: '12px 80px', width: '55%', display: 'flex', gap: 40 }}>
      <span style={{ fontSize: 18, color: '#555555' }}>鎰威科技</span>
      <span style={{ fontSize: 18, color: '#555555' }}>ewill-proposal</span>
    </div>
    <div style={{ flex: 1 }} />
  </div>
);

const Content: Page = () => (
  <ContentSlide title="本月改善成果" bg={CONTENT_BG}>
    <Eyebrow>三欄式資訊卡 —— 上緣色條分類，狀態用 badge 標記</Eyebrow>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
      <Card accent="#00979C" title="流程面">
        <ul style={bulletList}>
          <li>週會與專案同步機制上線</li>
          <li>管制表雙層核對</li>
        </ul>
      </Card>
      <Card accent="#FBAE40" title="專案面">
        <ul style={bulletList}>
          <li>二階驗收文件齊全</li>
          <li>DB 自動清理排程建立</li>
        </ul>
      </Card>
      <Card accent="#D32F2F" title="風險面">
        <ul style={bulletList}>
          <li>驗收限期改善中</li>
          <li>責任切分待討論</li>
        </ul>
      </Card>
    </div>
    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
      <Badge tone="success">完成</Badge>
      <Badge tone="warning">執行中</Badge>
      <Badge tone="danger">最高風險</Badge>
      <Badge tone="neutral">下階段</Badge>
    </div>
  </ContentSlide>
);

const Closing: Page = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: ENDING_BG,
      fontFamily: FONT,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    }}
  >
    <h1 style={{ color: '#FFFFFF', fontSize: 48, fontWeight: 300, letterSpacing: 6, margin: 0 }}>Thank You</h1>
    <div style={{ display: 'flex', gap: 60, marginTop: 36 }}>
      <span style={valueWord}>PROFESSIONAL</span>
      <span style={valueWord}>EFFICIENCY</span>
      <span style={valueWord}>PASSION</span>
      <span style={valueWord}>INTEGRITY</span>
    </div>
    <div style={{ color: '#FFFFFF', fontSize: 24, marginTop: 16, letterSpacing: 8 }}>專業、效率、熱情、誠信</div>
  </div>
);

export default [Cover, Content, Closing];
