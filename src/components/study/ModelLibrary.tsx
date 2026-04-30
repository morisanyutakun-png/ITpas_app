import type { StudyFigure } from "@/lib/contentSchema";

type ModelName = Extract<StudyFigure, { kind: "model-diagram" }>["model"];
type Callout = Extract<StudyFigure, { kind: "model-diagram" }>["callouts"][number];

const HUE: Record<NonNullable<Callout["accent"]>, string> = {
  primary: "#0A84FF",
  warm: "#FF9500",
  cool: "#00C7BE",
  neutral: "#8E8E93",
  accent: "#AF52DE",
  danger: "#FF3B30",
  success: "#34C759",
};

/**
 * Renders a curated SVG illustration. Each model has hand-authored
 * geometry so the figure feels like a real textbook diagram rather than
 * a generic stack of boxes. Callouts in the JSON resolve to anchors
 * defined per-model, and the renderer pins a colored bubble at that
 * anchor with the author's text.
 */
export function ModelDiagramView({
  model,
  caption,
  callouts,
}: {
  model: ModelName;
  caption?: string;
  callouts: Callout[];
}) {
  const M = MODELS[model];
  return (
    <figure className="rounded-2xl border border-border bg-card p-5 shadow-surface sm:p-6">
      <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-muted/40 to-muted/10 ring-1 ring-inset ring-border">
        <svg
          viewBox={M.viewBox}
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
        >
          {M.body}
          {/* Callouts */}
          {callouts.map((c, i) => {
            const anchor = M.anchors[c.anchor];
            if (!anchor) return null;
            const hue = HUE[c.accent];
            return (
              <g key={i}>
                <line
                  x1={anchor.x}
                  y1={anchor.y}
                  x2={anchor.lx}
                  y2={anchor.ly}
                  stroke={hue}
                  strokeWidth={1.4}
                  strokeDasharray="3 3"
                  opacity="0.7"
                />
                <circle cx={anchor.x} cy={anchor.y} r={4} fill={hue} />
                <circle cx={anchor.x} cy={anchor.y} r={6.5} fill="none" stroke={hue} strokeWidth={1} opacity={0.5} />
                {/* Bubble */}
                <g
                  transform={`translate(${anchor.lx}, ${anchor.ly})`}
                >
                  <rect
                    x={anchor.la === "left" ? -174 : 0}
                    y={-12}
                    width={174}
                    height={24}
                    rx={6}
                    fill="white"
                    stroke={hue}
                    strokeWidth={1.2}
                  />
                  <text
                    x={anchor.la === "left" ? -166 : 8}
                    y={4}
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                    fontSize={11}
                    fontWeight={600}
                    fill="#0F172A"
                  >
                    {c.text}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
      {caption && (
        <figcaption className="mt-4 border-t border-border/60 pt-3 text-[12px] leading-relaxed text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ── Anchor type ────────────────────────────────────────────────────────

type Anchor = {
  // Point on the model the line draws from.
  x: number;
  y: number;
  // Endpoint of the leader line (where the bubble sits).
  lx: number;
  ly: number;
  // Bubble alignment (which side of lx the box extends).
  la: "left" | "right";
};

type Model = {
  viewBox: string;
  body: React.ReactNode;
  anchors: Record<string, Anchor>;
};

// ── OSI 7-layer stack with cable + router + switch + PC ────────────────

const OsiStack: Model = {
  viewBox: "0 0 800 480",
  body: (
    <g>
      {/* Title */}
      <text
        x="400"
        y="28"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight={700}
        fontSize={14}
        fill="#475569"
      >
        OSI 参照モデル — 各層と代表機器
      </text>

      {/* Stack */}
      {[
        { y: 50, n: 7, name: "アプリケーション層", body: "HTTP / SMTP / DNS / FTP", color: "#FF9500" },
        { y: 96, n: 6, name: "プレゼンテーション層", body: "SSL/TLS / 文字コード変換", color: "#FF9500" },
        { y: 142, n: 5, name: "セッション層", body: "対話の確立・終了", color: "#FF9500" },
        { y: 188, n: 4, name: "トランスポート層", body: "TCP / UDP", color: "#0A84FF" },
        { y: 234, n: 3, name: "ネットワーク層", body: "IP / ICMP / ARP", color: "#0A84FF" },
        { y: 280, n: 2, name: "データリンク層", body: "Ethernet / MAC", color: "#00C7BE" },
        { y: 326, n: 1, name: "物理層", body: "ケーブル / 電気信号", color: "#8E8E93" },
      ].map((l) => (
        <g key={l.n}>
          <rect x="180" y={l.y} width="320" height="38" rx="6" fill="white" stroke={l.color} strokeWidth="1.6" />
          <rect x="180" y={l.y} width="6" height="38" fill={l.color} />
          <text
            x="142"
            y={l.y + 24}
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight={700}
            fontSize={18}
            fill={l.color}
          >
            L{l.n}
          </text>
          <text
            x="196"
            y={l.y + 16}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight={600}
            fontSize={13}
            fill="#0F172A"
          >
            {l.name}
          </text>
          <text
            x="196"
            y={l.y + 30}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontSize={11}
            fill="#64748b"
          >
            {l.body}
          </text>
        </g>
      ))}

      {/* PC (left bottom) */}
      <g transform="translate(60, 380)">
        <rect x="0" y="0" width="80" height="56" rx="6" fill="#E2E8F0" stroke="#475569" strokeWidth="1.4" />
        <rect x="6" y="6" width="68" height="40" rx="2" fill="#0F172A" />
        <rect x="34" y="50" width="12" height="8" fill="#475569" />
        <rect x="20" y="62" width="40" height="4" rx="2" fill="#475569" />
      </g>
      {/* Cable */}
      <path
        d="M 140 410 C 220 410, 220 380, 280 380 L 540 380 C 600 380, 600 410, 680 410"
        stroke="#1A2030"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M 140 410 C 220 410, 220 380, 280 380 L 540 380 C 600 380, 600 410, 680 410"
        stroke="#FFD60A"
        strokeWidth="1"
        fill="none"
        strokeDasharray="6 6"
      />
      {/* Switch (middle bottom) */}
      <g transform="translate(360, 360)">
        <rect x="0" y="0" width="80" height="40" rx="4" fill="#94A3B8" stroke="#475569" strokeWidth="1.4" />
        <rect x="4" y="6" width="72" height="6" rx="2" fill="#1A2030" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={6 + i * 9} y={20} width={6} height={14} rx={1} fill="#FFD60A" />
        ))}
        <text
          x="40"
          y="50"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight={700}
          fontSize={10}
          fill="#475569"
        >
          スイッチ (L2)
        </text>
      </g>
      {/* Router (right bottom) */}
      <g transform="translate(640, 380)">
        <ellipse cx="40" cy="22" rx="36" ry="20" fill="#0A84FF" stroke="#0A5FCC" strokeWidth="1.4" />
        <ellipse cx="40" cy="22" rx="28" ry="14" fill="#39A0FF" />
        {/* Antennas */}
        <line x1="20" y1="6" x2="14" y2="-8" stroke="#0F172A" strokeWidth="1.4" />
        <circle cx="14" cy="-8" r="2.5" fill="#FFD60A" />
        <line x1="60" y1="6" x2="66" y2="-8" stroke="#0F172A" strokeWidth="1.4" />
        <circle cx="66" cy="-8" r="2.5" fill="#FFD60A" />
        <text
          x="40"
          y="56"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight={700}
          fontSize={10}
          fill="#475569"
        >
          ルータ (L3)
        </text>
      </g>
    </g>
  ),
  anchors: {
    "l4-tcp": { x: 500, y: 207, lx: 580, ly: 207, la: "right" },
    "l3-router": { x: 680, y: 410, lx: 720, ly: 470, la: "right" },
    "l2-switch": { x: 400, y: 380, lx: 320, ly: 470, la: "left" },
    "l1-cable": { x: 280, y: 388, lx: 60, ly: 470, la: "right" },
    "l7-http": { x: 500, y: 65, lx: 580, ly: 65, la: "right" },
  },
};

// ── RAID 5 disk array with parity stripe ───────────────────────────────

const Raid5: Model = {
  viewBox: "0 0 800 380",
  body: (
    <g>
      <text
        x="400"
        y="28"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight={700}
        fontSize={14}
        fill="#475569"
      >
        RAID 5 — データ + パリティ分散ストレージ
      </text>

      {/* 4 disks */}
      {[
        { x: 80, label: "ディスク 0" },
        { x: 260, label: "ディスク 1" },
        { x: 440, label: "ディスク 2" },
        { x: 620, label: "ディスク 3" },
      ].map((d, di) => (
        <g key={di} transform={`translate(${d.x}, 60)`}>
          {/* Disk body — 3D-ish cylinder */}
          <ellipse cx="50" cy="0" rx="50" ry="14" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
          <rect x="0" y="0" width="100" height="220" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
          <ellipse cx="50" cy="220" rx="50" ry="14" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
          {/* Stripes — block of data or parity */}
          {[0, 1, 2, 3].map((si) => {
            const isParity =
              (di === 3 && si === 0) ||
              (di === 2 && si === 1) ||
              (di === 1 && si === 2) ||
              (di === 0 && si === 3);
            return (
              <g key={si}>
                <rect
                  x="8"
                  y={20 + si * 50}
                  width="84"
                  height="42"
                  rx="3"
                  fill={isParity ? "#FF3B30" : "#0A84FF"}
                  fillOpacity={isParity ? 0.85 : 0.7}
                  stroke={isParity ? "#C7202D" : "#0A5FCC"}
                  strokeWidth="0.8"
                />
                <text
                  x="50"
                  y={20 + si * 50 + 26}
                  textAnchor="middle"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fontWeight={700}
                  fontSize={12}
                  fill="white"
                >
                  {isParity ? `P${si}` : `D${si}-${di}`}
                </text>
              </g>
            );
          })}
          {/* Disk label */}
          <text
            x="50"
            y="252"
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight={600}
            fontSize={11}
            fill="#475569"
          >
            {d.label}
          </text>
          {/* LED */}
          <circle cx="86" cy="-2" r="3" fill="#34C759" />
        </g>
      ))}

      {/* Stripe legend */}
      <g transform="translate(60, 320)">
        <rect x="0" y="0" width="14" height="14" rx="2" fill="#0A84FF" fillOpacity="0.7" />
        <text x="20" y="11" fontSize={11} fill="#475569" fontFamily="ui-sans-serif, system-ui, sans-serif">
          データブロック (Dn-m)
        </text>
        <rect x="200" y="0" width="14" height="14" rx="2" fill="#FF3B30" fillOpacity="0.85" />
        <text x="220" y="11" fontSize={11} fill="#475569" fontFamily="ui-sans-serif, system-ui, sans-serif">
          パリティブロック (Pn) — 1 台故障時の復元に使用
        </text>
      </g>
    </g>
  ),
  anchors: {
    parity: { x: 670, y: 100, lx: 740, ly: 70, la: "right" },
    rotation: { x: 80, y: 220, lx: 50, ly: 290, la: "right" },
    data: { x: 130, y: 100, lx: 50, ly: 50, la: "right" },
  },
};

// ── Memory hierarchy pyramid ────────────────────────────────────────────

const MemoryHierarchy: Model = {
  viewBox: "0 0 800 420",
  body: (
    <g>
      <text
        x="400"
        y="28"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight={700}
        fontSize={14}
        fill="#475569"
      >
        メモリ階層 — 速くて小さい / 遅くて大きい
      </text>

      {[
        { y: 56, w: 140, name: "レジスタ", body: "数十 byte / < 1 ns / CPU 内", color: "#FF3B30" },
        { y: 112, w: 220, name: "L1 キャッシュ", body: "数十 KB / 1 ns 未満", color: "#FF9500" },
        { y: 168, w: 300, name: "L2/L3 キャッシュ", body: "MB 級 / 数 ns", color: "#FF9500" },
        { y: 224, w: 400, name: "主記憶 (DRAM)", body: "GB 級 / 約 10 ns / 揮発性", color: "#0A84FF" },
        { y: 280, w: 520, name: "SSD / HDD", body: "TB 級 / ms オーダー / 不揮発性", color: "#34C759" },
      ].map((l, i) => (
        <g key={i}>
          <rect
            x={400 - l.w / 2}
            y={l.y}
            width={l.w}
            height={48}
            rx={6}
            fill="white"
            stroke={l.color}
            strokeWidth={1.6}
          />
          <rect x={400 - l.w / 2} y={l.y} width={6} height={48} fill={l.color} />
          <text
            x="400"
            y={l.y + 22}
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight={700}
            fontSize={13}
            fill="#0F172A"
          >
            {l.name}
          </text>
          <text
            x="400"
            y={l.y + 38}
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontSize={11}
            fill="#64748b"
          >
            {l.body}
          </text>
        </g>
      ))}

      {/* Side arrows: speed and capacity */}
      <g transform="translate(60, 40)">
        <text
          x="0"
          y="0"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight={700}
          fontSize={12}
          fill="#FF3B30"
        >
          ↑ 速い
        </text>
        <line x1="40" y1="20" x2="40" y2="280" stroke="#FF3B30" strokeWidth="1.5" markerEnd="url(#mh-arrow)" />
        <text
          x="0"
          y="300"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight={700}
          fontSize={12}
          fill="#FF3B30"
        >
          ↓ 遅い
        </text>
      </g>
      <g transform="translate(720, 40)">
        <text
          x="0"
          y="0"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight={700}
          fontSize={12}
          fill="#34C759"
        >
          ↑ 小容量
        </text>
        <line x1="0" y1="20" x2="0" y2="280" stroke="#34C759" strokeWidth="1.5" markerEnd="url(#mh-arrow)" />
        <text
          x="0"
          y="300"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight={700}
          fontSize={12}
          fill="#34C759"
        >
          ↓ 大容量
        </text>
      </g>

      <defs>
        <marker
          id="mh-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
        </marker>
      </defs>
    </g>
  ),
  anchors: {
    register: { x: 400, y: 80, lx: 200, ly: 60, la: "right" },
    cache: { x: 400, y: 192, lx: 600, ly: 192, la: "right" },
    main: { x: 400, y: 248, lx: 200, ly: 248, la: "right" },
    storage: { x: 400, y: 304, lx: 600, ly: 304, la: "right" },
  },
};

// ── TCP packet header ──────────────────────────────────────────────────

const TcpPacket: Model = {
  viewBox: "0 0 800 280",
  body: (
    <g>
      <text
        x="400"
        y="28"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight={700}
        fontSize={14}
        fill="#475569"
      >
        TCP セグメントの構造
      </text>
      {/* Header rows */}
      {[
        { y: 60, fields: [
          { w: 360, name: "送信元ポート", body: "16 bit" },
          { w: 360, name: "宛先ポート", body: "16 bit" },
        ] },
        { y: 110, fields: [{ w: 720, name: "シーケンス番号", body: "32 bit / 順序保証" }] },
        { y: 160, fields: [{ w: 720, name: "確認応答番号 (ACK)", body: "32 bit / 受信通知" }] },
        { y: 210, fields: [
          { w: 100, name: "オフセット", body: "" },
          { w: 100, name: "予約", body: "" },
          { w: 200, name: "フラグ", body: "SYN ACK FIN ..." },
          { w: 320, name: "ウィンドウ", body: "16 bit / 受信可能サイズ" },
        ] },
      ].map((row, ri) => {
        let x = 40;
        return (
          <g key={ri}>
            {row.fields.map((f, fi) => {
              const r = (
                <g key={fi}>
                  <rect
                    x={x}
                    y={row.y}
                    width={f.w}
                    height={42}
                    fill={ri % 2 === 0 ? "#E2E8F0" : "#F1F5F9"}
                    stroke="#475569"
                    strokeWidth="1.2"
                  />
                  <text
                    x={x + f.w / 2}
                    y={row.y + 18}
                    textAnchor="middle"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                    fontWeight={700}
                    fontSize={12}
                    fill="#0F172A"
                  >
                    {f.name}
                  </text>
                  {f.body && (
                    <text
                      x={x + f.w / 2}
                      y={row.y + 33}
                      textAnchor="middle"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                      fontSize={10}
                      fill="#64748b"
                    >
                      {f.body}
                    </text>
                  )}
                </g>
              );
              x += f.w;
              return r;
            })}
          </g>
        );
      })}
    </g>
  ),
  anchors: {
    seq: { x: 400, y: 120, lx: 760, ly: 110, la: "right" },
    flags: { x: 340, y: 220, lx: 60, ly: 270, la: "right" },
    port: { x: 220, y: 70, lx: 60, ly: 50, la: "right" },
  },
};

// ── Public-key mailbox model ───────────────────────────────────────────

const PublicKeyMailbox: Model = {
  viewBox: "0 0 800 360",
  body: (
    <g>
      <text
        x="400"
        y="28"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight={700}
        fontSize={14}
        fill="#475569"
      >
        公開鍵暗号 — ボブのメールボックス比喩
      </text>
      {/* Mailbox */}
      <g transform="translate(330, 80)">
        <rect x="0" y="40" width="140" height="160" fill="#E2E8F0" stroke="#475569" strokeWidth="1.6" rx="6" />
        {/* Slot */}
        <rect x="20" y="60" width="100" height="14" fill="#1A2030" rx="2" />
        {/* Door */}
        <rect x="20" y="120" width="100" height="60" rx="4" fill="#F1F5F9" stroke="#475569" strokeWidth="1" />
        {/* Lock */}
        <circle cx="70" cy="150" r="8" fill="#FFD60A" stroke="#475569" strokeWidth="1.2" />
        <rect x="68" y="150" width="4" height="8" fill="#475569" />
        {/* Roof */}
        <path d="M -10 40 L 70 0 L 150 40 z" fill="#94A3B8" stroke="#475569" strokeWidth="1.6" />
        {/* Label */}
        <text x="70" y="220" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight={700} fontSize={12} fill="#475569">
          ボブのメールボックス
        </text>
      </g>
      {/* Public key (anyone can drop) */}
      <g transform="translate(80, 130)">
        <circle cx="0" cy="0" r="36" fill="#0A84FF" />
        <text x="0" y="-2" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight={700} fontSize={12} fill="white">
          公開鍵
        </text>
        <text x="0" y="14" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize={10} fill="white">
          (誰でも投函可)
        </text>
      </g>
      {/* Letter being inserted */}
      <g transform="translate(220, 100)">
        <rect x="0" y="0" width="80" height="50" fill="white" stroke="#FF9500" strokeWidth="1.6" rx="3" />
        <path d="M 0 0 L 40 28 L 80 0" stroke="#FF9500" strokeWidth="1" fill="none" />
        <text x="40" y="40" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize={10} fontWeight={700} fill="#FF9500">
          Hello!
        </text>
      </g>
      {/* Arrow into slot */}
      <path d="M 305 130 L 345 130" stroke="#FF9500" strokeWidth="2" markerEnd="url(#pkm-arrow)" />
      {/* Private key (only Bob has) */}
      <g transform="translate(620, 250)">
        <circle cx="0" cy="0" r="36" fill="#AF52DE" />
        <text x="0" y="-2" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight={700} fontSize={12} fill="white">
          秘密鍵
        </text>
        <text x="0" y="14" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize={10} fill="white">
          (ボブだけ)
        </text>
      </g>
      {/* Arrow from private key to lock */}
      <path d="M 585 240 L 405 240" stroke="#AF52DE" strokeWidth="2" markerEnd="url(#pkm-arrow)" />
      <defs>
        <marker
          id="pkm-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
    </g>
  ),
  anchors: {
    pubkey: { x: 80, y: 130, lx: 60, ly: 60, la: "right" },
    privkey: { x: 620, y: 250, lx: 720, ly: 320, la: "right" },
    slot: { x: 400, y: 145, lx: 480, ly: 50, la: "right" },
  },
};

// ── 3-tier client/server architecture ───────────────────────────────────

const ClientServer3Tier: Model = {
  viewBox: "0 0 800 320",
  body: (
    <g>
      <text
        x="400"
        y="28"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight={700}
        fontSize={14}
        fill="#475569"
      >
        3 層クライアント・サーバ構成
      </text>
      {/* Client */}
      <g transform="translate(40, 100)">
        <rect x="0" y="0" width="120" height="80" rx="6" fill="white" stroke="#FF9500" strokeWidth="2" />
        <rect x="6" y="6" width="108" height="60" rx="2" fill="#0F172A" />
        <text x="60" y="106" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight={700} fontSize={12} fill="#FF9500">
          プレゼン層
        </text>
        <text x="60" y="122" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize={10} fill="#64748b">
          ブラウザ / アプリ
        </text>
      </g>
      {/* App server */}
      <g transform="translate(340, 100)">
        <rect x="0" y="0" width="120" height="80" rx="6" fill="white" stroke="#0A84FF" strokeWidth="2" />
        {/* Gear icon */}
        <circle cx="60" cy="40" r="20" fill="#0A84FF" />
        <circle cx="60" cy="40" r="8" fill="white" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={i}
            x="58"
            y="14"
            width="4"
            height="8"
            fill="#0A84FF"
            transform={`rotate(${i * 60} 60 40)`}
          />
        ))}
        <text x="60" y="106" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight={700} fontSize={12} fill="#0A84FF">
          ファンクション層
        </text>
        <text x="60" y="122" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize={10} fill="#64748b">
          AP サーバ / ロジック
        </text>
      </g>
      {/* DB */}
      <g transform="translate(640, 100)">
        <ellipse cx="60" cy="10" rx="48" ry="10" fill="#34C759" stroke="#1F8B5C" strokeWidth="2" />
        <rect x="12" y="10" width="96" height="60" fill="#5BD876" stroke="#1F8B5C" strokeWidth="2" />
        <ellipse cx="60" cy="70" rx="48" ry="10" fill="#34C759" stroke="#1F8B5C" strokeWidth="2" />
        <ellipse cx="60" cy="40" rx="48" ry="10" fill="none" stroke="#1F8B5C" strokeWidth="1" strokeDasharray="3 3" />
        <text x="60" y="106" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight={700} fontSize={12} fill="#1F8B5C">
          データ層
        </text>
        <text x="60" y="122" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize={10} fill="#64748b">
          DB サーバ
        </text>
      </g>
      {/* Connectors */}
      <path d="M 160 140 L 340 140" stroke="#475569" strokeWidth="2" markerEnd="url(#cst-arrow)" />
      <path d="M 460 140 L 640 140" stroke="#475569" strokeWidth="2" markerEnd="url(#cst-arrow)" />
      <text x="250" y="132" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize={10} fill="#475569">
        HTTP
      </text>
      <text x="550" y="132" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize={10} fill="#475569">
        SQL
      </text>
      <defs>
        <marker
          id="cst-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
        </marker>
      </defs>
    </g>
  ),
  anchors: {
    client: { x: 100, y: 140, lx: 60, ly: 240, la: "right" },
    app: { x: 400, y: 140, lx: 360, ly: 240, la: "right" },
    db: { x: 700, y: 140, lx: 660, ly: 240, la: "right" },
  },
};

// ── CPU pipeline ───────────────────────────────────────────────────────

const CpuPipeline: Model = {
  viewBox: "0 0 800 240",
  body: (
    <g>
      <text
        x="400"
        y="28"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight={700}
        fontSize={14}
        fill="#475569"
      >
        CPU 命令パイプライン (5 段)
      </text>
      {[
        { name: "IF", body: "命令フェッチ" },
        { name: "ID", body: "命令デコード" },
        { name: "EX", body: "実行" },
        { name: "MA", body: "メモリアクセス" },
        { name: "WB", body: "ライトバック" },
      ].map((s, i) => (
        <g key={i} transform={`translate(${60 + i * 140}, 80)`}>
          <rect
            x="0"
            y="0"
            width="120"
            height="80"
            rx="6"
            fill="white"
            stroke="#0A84FF"
            strokeWidth="1.8"
          />
          <rect x="0" y="0" width="120" height="22" rx="6" fill="#0A84FF" />
          <text x="60" y="16" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight={700} fontSize={12} fill="white">
            {s.name}
          </text>
          <text x="60" y="50" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight={700} fontSize={11} fill="#0F172A">
            {s.body}
          </text>
          <text x="60" y="65" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize={10} fill="#64748b">
            ステージ {i + 1}
          </text>
          {i < 4 && (
            <path
              d="M 120 40 L 140 40"
              stroke="#475569"
              strokeWidth="1.8"
              markerEnd="url(#cpu-arrow)"
            />
          )}
        </g>
      ))}
      <defs>
        <marker
          id="cpu-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
        </marker>
      </defs>
    </g>
  ),
  anchors: {
    fetch: { x: 120, y: 120, lx: 80, ly: 200, la: "right" },
    decode: { x: 260, y: 120, lx: 220, ly: 200, la: "right" },
    execute: { x: 400, y: 120, lx: 360, ly: 200, la: "right" },
    writeback: { x: 680, y: 120, lx: 640, ly: 200, la: "right" },
  },
};

// ── DNS hierarchy ──────────────────────────────────────────────────────

const DnsHierarchy: Model = {
  viewBox: "0 0 800 380",
  body: (
    <g>
      <text
        x="400"
        y="28"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight={700}
        fontSize={14}
        fill="#475569"
      >
        DNS 階層 — ルート → TLD → 権威サーバ
      </text>
      {/* Root */}
      <g transform="translate(360, 56)">
        <rect x="0" y="0" width="80" height="44" rx="6" fill="#0F172A" />
        <text x="40" y="20" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight={700} fontSize={12} fill="white">
          .
        </text>
        <text x="40" y="34" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize={10} fill="white">
          ルート
        </text>
      </g>
      {/* TLDs */}
      {[
        { x: 120, label: ".jp" },
        { x: 280, label: ".com" },
        { x: 440, label: ".org" },
        { x: 600, label: ".net" },
      ].map((t, i) => (
        <g key={i} transform={`translate(${t.x}, 156)`}>
          <rect x="0" y="0" width="80" height="44" rx="6" fill="white" stroke="#0A84FF" strokeWidth="1.6" />
          <text x="40" y="20" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight={700} fontSize={12} fill="#0A84FF">
            {t.label}
          </text>
          <text x="40" y="34" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize={10} fill="#64748b">
            TLD
          </text>
          <line
            x1="40"
            y1="0"
            x2={400 - t.x}
            y2="-56"
            stroke="#94A3B8"
            strokeWidth="1.4"
          />
        </g>
      ))}
      {/* 2nd level */}
      {[
        { x: 60, label: "co.jp", parent: 120 },
        { x: 240, label: "example.com", parent: 280 },
        { x: 440, label: "wikipedia.org", parent: 440 },
        { x: 640, label: "rfc-editor.net", parent: 600 },
      ].map((s, i) => (
        <g key={i} transform={`translate(${s.x}, 256)`}>
          <rect x="0" y="0" width="120" height="44" rx="6" fill="white" stroke="#34C759" strokeWidth="1.6" />
          <text x="60" y="20" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight={700} fontSize={11} fill="#1F8B5C">
            {s.label}
          </text>
          <text x="60" y="34" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize={9} fill="#64748b">
            権威 DNS
          </text>
          <line
            x1="60"
            y1="0"
            x2={s.parent + 40 - s.x}
            y2="-56"
            stroke="#94A3B8"
            strokeWidth="1.4"
          />
        </g>
      ))}
    </g>
  ),
  anchors: {
    root: { x: 400, y: 78, lx: 580, ly: 60, la: "right" },
    tld: { x: 320, y: 178, lx: 60, ly: 130, la: "right" },
    authoritative: { x: 500, y: 278, lx: 660, ly: 320, la: "right" },
  },
};

// ── Registry ────────────────────────────────────────────────────────────

const MODELS: Record<ModelName, Model> = {
  "osi-stack": OsiStack,
  "raid-5": Raid5,
  "memory-hierarchy": MemoryHierarchy,
  "tcp-packet": TcpPacket,
  "public-key-mailbox": PublicKeyMailbox,
  "client-server-3tier": ClientServer3Tier,
  "cpu-pipeline": CpuPipeline,
  "dns-hierarchy": DnsHierarchy,
};
