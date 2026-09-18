---
name: Ewill Proposal
description: Ewill Technology corporate deck — white ground, teal header bar, translucent info cards, dense editorial layout.
mode: light
---

# Ewill Proposal

The house style for Ewill Technology (鎰威科技) proposal and management decks.
Every value below was extracted from the delivered deck `slides/ewill-202607/index.tsx`
(11 pages, 2026/07) — each token carries the line it came from. Nothing here is invented.

This is a **dense corporate report** style, not a keynote style: the type scale sits well
below the `slide-authoring` defaults on purpose, because a page carries a table, a 3-column
card grid, or a metric row rather than one headline.

## Palette

| Role          | Value                    | Notes                                                              |
| ------------- | ------------------------ | ------------------------------------------------------------------ |
| bg            | `#FFFFFF`                | page ground; also the card/metric fill (index.tsx:9, `C.white` :26) |
| text          | `#3E3A39`                | headings, card titles, dark chrome bar (index.tsx:10, `C.charcoal` :24) |
| accent        | `#00979C`                | brand teal — header bar, rules, key numbers (index.tsx:11, `C.teal` :22) |
| muted         | `#666666`                | secondary copy inside cards (index.tsx:30, `C.textSoft`)           |
| accentDark    | `#007A7E`                | second teal step in bar charts / gradients (index.tsx:23)           |
| amber         | `#FBAE40`                | the one warm accent: "in progress", warnings (index.tsx:25)         |
| body          | `#333333`                | default body color set on the page root (index.tsx:29, `C.text`)    |
| surfaceTint   | `#F5F5F5`                | zebra rows, faint watermark ground (index.tsx:27, `C.lightGray`)    |
| border        | `#E0E0E0`                | 1px metric-box borders, neutral badge fill (index.tsx:28, `C.midGray`) |
| danger        | `#D32F2F`                | negative margin, highest risk (index.tsx:31)                        |
| success       | `#2E7D32`                | positive margin figures (index.tsx:32)                              |
| caption       | `#888888`                | lede lines, card subtitles (index.tsx:142, written `#888`)          |
| footerInk     | `#999999`                | page number only (index.tsx:64, written `#999`)                     |
| bodySoft      | `#555555`                | bullet copy inside cards (index.tsx:166, written `#555`)            |
| cardSurface   | `rgba(255,255,255,0.85)` | every content card — translucent so the ribbon watermark reads through (index.tsx:131) |

`cardSurface` is the signature move: cards are **not** opaque white. They sit at 85% over the
background image so the brand ribbon stays visible underneath.

## Typography

- Display font: `"微軟正黑體", "Microsoft JhengHei", "Noto Sans TC", system-ui, sans-serif` — weight 700 for every heading (index.tsx:14).
- Body font: the same stack — weight 400, weight 600–700 for inline emphasis (index.tsx:15).
- Webfont import: none. This is a system CJK stack by design; do not add a webfont loader.
- Type-scale overrides — this theme runs **far denser** than the `slide-authoring` defaults. All of these are deliberate overrides, not oversights:

  | Element                   | Size | Default band | Source        |
  | ------------------------- | ---- | ------------ | ------------- |
  | Cover title               | 48   | 140–200      | index.tsx:97  |
  | Closing title             | 48 (weight 300, `letterSpacing: 6`) | 140–200 | index.tsx:466 |
  | Page heading (header bar) | 36   | 56–80        | index.tsx:52  |
  | Cover subtitle            | 24   | —            | index.tsx:102 |
  | Card title                | 22   | —            | index.tsx:141, :161 |
  | Body / bullets            | 18–20| 32–44        | index.tsx:158, :201 |
  | Lede line under the bar   | 18   | —            | index.tsx:176 |
  | Caption / card subtitle   | 16   | 22–28        | index.tsx:142, :164 |
  | Badge label               | 16   | —            | index.tsx:76  |
  | Table header              | 14   | —            | index.tsx:265 |
  | Hero metric number        | 36–44| —            | index.tsx:321, :426 |

- `typeScale` in the `design` const is `{ hero: 72, body: 28 }` (index.tsx:17) — it is the token ceiling, not what the pages actually render; the concrete sizes above win.
- Line height: 1.3 on the cover title (index.tsx:97), 1.5–1.7 on body copy (index.tsx:201, :294).

## Layout

- Canvas 1920 × 1080, as always.
- Horizontal padding: **80 px**, held by every band — header bar (index.tsx:48), body area (index.tsx:56), footer (index.tsx:63), cover text bars (index.tsx:96).
- Vertical structure of a content page is a fixed three-band column:
  - header bar `height: 80` (index.tsx:46)
  - body area `flex: 1`, `padding: '40px 80px 20px'`, vertically centered (index.tsx:56–57)
  - footer bar `height: 36` (index.tsx:62)
  - → usable body height = 1080 − 80 − 36 − 40 − 20 = **904 px**.
- Corner radius: **8** for cards and panels (index.tsx:18, :129, :157); **4** for badges and chips (index.tsx:77, :456).
- Grid gaps: 16 for the 2-column agenda (index.tsx:125), 20 for 3-column card rows (index.tsx:177), 24 for the 2-column split page (index.tsx:389).
- Card accent rules: `borderLeft: 5px solid <accent>` for list rows (index.tsx:130), `borderTop: 5px solid <accent>` for grid cards (index.tsx:157), `borderTop: 4px solid` for people cards (index.tsx:231).
- Tables: charcoal header row with white uppercase 14 px labels (index.tsx:265), zebra rows at `rgba(245,245,245,0.7)` (index.tsx:273).
- Alignment: left, single column per band. The cover is the only asymmetric page — its text bars are `width: '55%'` against a full-bleed background (index.tsx:96).

### Background images

The deck is built on three full-bleed brand backgrounds under `slides/<id>/assets/`, applied via
`backgroundSize: 'cover'` + `backgroundPosition: 'left bottom'` (index.tsx:37–43):

| File             | Used on         | Look                                                        |
| ---------------- | --------------- | ----------------------------------------------------------- |
| `cover-bg.png`   | cover page only (index.tsx:94) | white ground, large teal ribbon mark upper-right, full logo lockup bottom-left |
| `content-bg.png` | every content page (index.tsx:85) | white ground, the same ribbon as a near-invisible grey watermark, small logo bottom-left |
| `ending-bg.png`  | closing page only (index.tsx:465) | full-bleed teal, darker teal ribbon, reversed white logo |

Copy these three PNGs into the new deck's `assets/` folder and import them as ES modules.
**The demo file `ewill-proposal.demo.tsx` cannot import them** — theme demos must be
self-contained — so it approximates each one with a CSS gradient (`COVER_BG` / `CONTENT_BG` /
`ENDING_BG` at the top of the demo). Those gradients are a stand-in for the preview only; a real
slide always uses the PNGs.

## Fixed components

Paste-ready. Copy verbatim into a slide that uses this theme. The shared font stack goes first:

```tsx
const FONT = '"微軟正黑體", "Microsoft JhengHei", "Noto Sans TC", system-ui, sans-serif';
```

### Design tokens

Every slide built on this theme starts with the same `design` const (index.tsx:7–19), so the
Design panel can retune the brand without touching JSX:

```tsx
import type { DesignSystem } from '@open-slide/core';

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
```

### Title

The page title is a full-width teal band, not free-floating type (index.tsx:45–53, :86).

```tsx
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
```

### Footer

Right-aligned page number, nothing else — no deck name, no date (index.tsx:61–65).
Pull the number from `useSlidePageNumber()`; the source deck hardcoded `{pageNum} / 11`
(index.tsx:88) and this theme deliberately replaces that with the hook.

```tsx
import { useSlidePageNumber } from '@open-slide/core';

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
```

`flexShrink: 0` is the one addition to the source values — it keeps the bar from collapsing
when the body area runs full.

### Eyebrow

A quiet grey lede directly under the title bar: scope note, data source, date range
(index.tsx:176; the same grey-lede role appears at 16 px on :215 and :349).

```tsx
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 18, color: '#888888', marginBottom: 16 }}>{children}</div>
);
```

### Badge

Status chips carry the deck's whole traffic-light vocabulary (index.tsx:67–80).
The source is a style factory; this is the same values wrapped as a component.

```tsx
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
```

### Card

The translucent surface tile every grid page is built from (index.tsx:156–164).

```tsx
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
```

### ContentSlide

The three-band page shell (index.tsx:82–90). `bg` takes any CSS background value, so a real
slide passes the imported PNG and the demo passes a gradient.

```tsx
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
```

## Motion

- Philosophy: **static**. The source deck declares no `@keyframes`, no `SlideTransition`, and no
  `<Steps>` — pages snap, and that is the brand behavior for a management report where the
  audience is reading tables, not watching a keynote.
- Do not add entrance animations when building on this theme. If a page genuinely needs
  sequencing, use `<Steps>` for reveal order rather than inventing a transition vocabulary.

## Aesthetic

Editorial. This is a printed-report look wearing a corporate uniform: a white page, a solid teal
band across the top for the section title, translucent cards floating over a faint brand ribbon,
and a single hairline page number in the corner. Information density is the point — a page is
expected to carry a twelve-row status table or a nine-item card grid and stay legible, which is
why the type runs small and the 80 px side margin never moves. Colour is functional, never
decorative: teal means "ours / on track", amber means "in progress / watch", red means "failed
or negative", charcoal means structural chrome. Avoid drop shadows, avoid gradients on anything
except the brand background itself, avoid rounded corners above 8 px, avoid emoji, and never let
a card go fully opaque white — the 85% translucency over the ribbon watermark is what makes a
page read as Ewill rather than as a generic template.

## Example usage

```tsx
import type { Page, SlideMeta } from '@open-slide/core';
import coverBg from './assets/cover-bg.png';
import contentBg from './assets/content-bg.png';

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
    <div style={{ flex: 1, minHeight: '43%' }} />
    <div style={{ background: '#00979C', padding: '20px 80px', width: '55%' }}>
      <h1 style={{ color: '#FFFFFF', fontSize: 48, fontWeight: 700, lineHeight: 1.3, margin: 0 }}>
        軟體部 2026/08<br />主管會議簡報
      </h1>
    </div>
    <div style={{ background: '#3E3A39', padding: '12px 80px', width: '55%' }}>
      <span style={{ color: '#FFFFFF', fontSize: 24 }}>一行副標，說明這份簡報要交代什麼</span>
    </div>
    <div style={{ padding: '12px 80px', width: '55%', display: 'flex', gap: 40 }}>
      <span style={{ fontSize: 18, color: '#555555' }}>Eric</span>
      <span style={{ fontSize: 18, color: '#555555' }}>2026 / 08 / 20</span>
    </div>
    <div style={{ flex: 1 }} />
  </div>
);

const Status: Page = () => (
  <ContentSlide title="專案進度總覽" bg={`url(${contentBg})`}>
    <Eyebrow>資料來源：專案管制表（20260820）</Eyebrow>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
      <Card accent="#00979C" title="流程面">
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 18, color: '#555555', lineHeight: 1.7 }}>
          <li>週會與專案同步機制上線</li>
          <li>管制表雙層核對</li>
        </ul>
      </Card>
      <Card accent="#FBAE40" title="專案面">
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 18, color: '#555555', lineHeight: 1.7 }}>
          <li>二階驗收文件齊全</li>
          <li>DB 自動清理排程建立</li>
        </ul>
      </Card>
      <Card accent="#D32F2F" title="風險面">
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 18, color: '#555555', lineHeight: 1.7 }}>
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

export const meta: SlideMeta = {
  title: '軟體部 2026/08 主管會議簡報',
  theme: 'ewill-proposal',
  createdAt: '2026-08-20T00:00:00Z',
};
export default [Cover, Status] satisfies Page[];
```
