import type { StudyFigure } from "@/lib/contentSchema";

/**
 * Deterministic SVG thumbnail for a lesson card. Renders one of seven
 * abstract glyphs that mirror the lesson's hero figure kind, on a
 * gradient drawn from the major's hue. No images, no fonts, no JS — just
 * a small SVG that scales cleanly and stays consistent across the app.
 */
export function LessonThumbnail({
  hue,
  figureKind,
  className,
  ariaLabel,
}: {
  hue: string;
  figureKind: StudyFigure["kind"];
  className?: string;
  ariaLabel?: string;
}) {
  const id = `t-${figureKind}-${slug(hue)}`;
  return (
    <svg
      viewBox="0 0 320 200"
      role="img"
      aria-label={ariaLabel ?? "lesson thumbnail"}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={hue} stopOpacity="0.92" />
          <stop offset="60%" stopColor={hue} stopOpacity="0.72" />
          <stop offset="100%" stopColor={mix(hue, "#000", 0.55)} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.85" cy="0.1" r="0.9">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-shadow`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <pattern
          id={`${id}-grid`}
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 16 0 L 0 0 0 16"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.06"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      {/* Background */}
      <rect width="320" height="200" fill={`url(#${id}-bg)`} />
      <rect width="320" height="200" fill={`url(#${id}-grid)`} />
      <rect width="320" height="200" fill={`url(#${id}-glow)`} />
      <rect width="320" height="200" fill={`url(#${id}-shadow)`} />

      {/* Figure-kind glyph */}
      <g transform="translate(40, 32)">{glyphFor(figureKind)}</g>
    </svg>
  );
}

function glyphFor(kind: StudyFigure["kind"]) {
  // Each glyph fits within 240×136 starting at (0,0) so the parent
  // translate places it inside a 40px gutter on a 320×200 canvas.
  switch (kind) {
    case "layered":
      return (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={0}
              y={i * 30}
              width={240 - i * 30}
              height={20}
              rx={6}
              fill="#FFFFFF"
              fillOpacity={0.92 - i * 0.18}
            />
          ))}
        </g>
      );

    case "compare":
      return (
        <g>
          <rect
            x={0}
            y={6}
            width={108}
            height={120}
            rx={14}
            fill="#FFFFFF"
            fillOpacity={0.92}
          />
          <rect
            x={132}
            y={6}
            width={108}
            height={120}
            rx={14}
            fill="#FFFFFF"
            fillOpacity={0.5}
          />
          <line
            x1={120}
            y1={20}
            x2={120}
            y2={112}
            stroke="#FFFFFF"
            strokeOpacity={0.6}
            strokeWidth={2}
            strokeDasharray="4 6"
          />
        </g>
      );

    case "flow":
      return (
        <g transform="translate(0, 36)">
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${i * 88}, 0)`}>
              <circle cx={32} cy={32} r={26} fill="#FFFFFF" fillOpacity={0.9} />
              {i < 2 && (
                <path
                  d="M 60 32 H 84"
                  stroke="#FFFFFF"
                  strokeOpacity={0.85}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              )}
            </g>
          ))}
        </g>
      );

    case "quadrant":
      return (
        <g>
          {[0, 1, 2, 3].map((i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            return (
              <rect
                key={i}
                x={col * 124}
                y={row * 70}
                width={116}
                height={62}
                rx={12}
                fill="#FFFFFF"
                fillOpacity={0.85 - i * 0.12}
              />
            );
          })}
        </g>
      );

    case "step-list":
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(0, ${i * 44})`}>
              <circle cx={18} cy={18} r={14} fill="#FFFFFF" fillOpacity={0.94} />
              <text
                x={18}
                y={22}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontWeight={700}
                fontSize={14}
                textAnchor="middle"
                fill={"currentColor"}
                style={{ color: "#0F172A", mixBlendMode: "normal" }}
              >
                {i + 1}
              </text>
              <rect
                x={44}
                y={6}
                width={196}
                height={24}
                rx={6}
                fill="#FFFFFF"
                fillOpacity={0.7 - i * 0.14}
              />
            </g>
          ))}
        </g>
      );

    case "tree":
      return (
        <g>
          <rect
            x={84}
            y={0}
            width={72}
            height={26}
            rx={8}
            fill="#FFFFFF"
            fillOpacity={0.95}
          />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <path
                d={`M 120 26 Q 120 50 ${30 + i * 90} 64`}
                stroke="#FFFFFF"
                strokeOpacity={0.55}
                strokeWidth={2}
                fill="none"
              />
              <rect
                x={i * 90}
                y={64}
                width={60}
                height={56}
                rx={10}
                fill="#FFFFFF"
                fillOpacity={0.78 - i * 0.14}
              />
            </g>
          ))}
        </g>
      );

    case "labeled-diagram":
      return (
        <g>
          <circle cx={70} cy={60} r={50} fill="#FFFFFF" fillOpacity={0.94} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <line
                x1={120}
                y1={60}
                x2={154}
                y2={20 + i * 40}
                stroke="#FFFFFF"
                strokeOpacity={0.55}
                strokeWidth={2}
              />
              <rect
                x={156}
                y={10 + i * 40}
                width={84}
                height={20}
                rx={6}
                fill="#FFFFFF"
                fillOpacity={0.85 - i * 0.16}
              />
            </g>
          ))}
        </g>
      );

    case "topology":
      return (
        <g>
          {/* 4 nodes connected as a small graph */}
          {[
            { x: 30, y: 18, label: "A" },
            { x: 200, y: 18, label: "B" },
            { x: 30, y: 108, label: "C" },
            { x: 200, y: 108, label: "D" },
          ].map((n, i) => (
            <g key={i}>
              <rect
                x={n.x}
                y={n.y}
                width={36}
                height={26}
                rx={6}
                fill="#FFFFFF"
                fillOpacity={0.9 - i * 0.1}
              />
            </g>
          ))}
          {[
            [48, 31, 218, 31],
            [48, 31, 48, 121],
            [218, 31, 218, 121],
            [48, 121, 218, 121],
            [48, 31, 218, 121],
          ].map((p, i) => (
            <line
              key={i}
              x1={p[0]}
              y1={p[1]}
              x2={p[2]}
              y2={p[3]}
              stroke="#FFFFFF"
              strokeOpacity={0.45}
              strokeWidth={1.5}
            />
          ))}
        </g>
      );

    case "matrix":
      return (
        <g>
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={c * 80}
                y={r * 32}
                width={72}
                height={24}
                rx={4}
                fill="#FFFFFF"
                fillOpacity={c === 0 ? 0.9 - r * 0.04 : 0.6 - r * 0.08}
              />
            ))
          )}
        </g>
      );

    case "timeline":
      return (
        <g>
          {/* Color-banded timeline bar */}
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={i * 60}
              y={48}
              width={56}
              height={36}
              rx={i === 0 ? 8 : 0}
              fill="#FFFFFF"
              fillOpacity={0.92 - i * 0.18}
            />
          ))}
          {/* Markers */}
          {[0, 1, 2, 3].map((i) => (
            <circle
              key={i}
              cx={i * 60 + 28}
              cy={108}
              r={5}
              fill="#FFFFFF"
              fillOpacity={0.85}
            />
          ))}
        </g>
      );

    case "proportion-bar":
      return (
        <g>
          {[
            { x: 0, w: 110 },
            { x: 110, w: 70 },
            { x: 180, w: 60 },
          ].map((s, i) => (
            <rect
              key={i}
              x={s.x}
              y={48}
              width={s.w}
              height={42}
              fill="#FFFFFF"
              fillOpacity={0.92 - i * 0.18}
            />
          ))}
        </g>
      );

    case "cinematic":
      // Filmstrip motif — three frames + glowing dot to suggest a movie.
      return (
        <g>
          {/* Three film cells */}
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={10 + i * 78}
              y={30}
              width={70}
              height={76}
              rx={8}
              fill="#FFFFFF"
              fillOpacity={0.92 - i * 0.18}
            />
          ))}
          {/* Sprocket holes */}
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={`top-${i}`}
              x={20 + i * 56}
              y={14}
              width={14}
              height={6}
              rx={2}
              fill="#FFFFFF"
              fillOpacity={0.75}
            />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={`bot-${i}`}
              x={20 + i * 56}
              y={116}
              width={14}
              height={6}
              rx={2}
              fill="#FFFFFF"
              fillOpacity={0.55}
            />
          ))}
          {/* Glow dot in center cell */}
          <circle cx={123} cy={68} r={11} fill="#FFFFFF" fillOpacity={0.95} />
        </g>
      );

    case "animated-process":
      // Play-button-in-frame motif to suggest "moving figure".
      return (
        <g>
          {/* Two actor boxes with a connecting curve and a packet */}
          <rect
            x={0}
            y={36}
            width={70}
            height={64}
            rx={10}
            fill="#FFFFFF"
            fillOpacity={0.92}
          />
          <rect
            x={170}
            y={36}
            width={70}
            height={64}
            rx={10}
            fill="#FFFFFF"
            fillOpacity={0.78}
          />
          <path
            d="M 70 68 Q 120 24, 170 68"
            stroke="#FFFFFF"
            strokeOpacity={0.55}
            strokeWidth={2.5}
            fill="none"
            strokeDasharray="5 5"
          />
          <circle cx={120} cy={42} r={9} fill="#FFFFFF" fillOpacity={0.95} />
          {/* Play triangle on left actor */}
          <path
            d="M 28 56 L 28 80 L 50 68 z"
            fill="#0F172A"
            fillOpacity={0.85}
          />
        </g>
      );
  }
}

// ── Color helpers ─────────────────────────────────────────────────────────

function slug(s: string) {
  return s.replace(/[^a-zA-Z0-9]/g, "");
}

function mix(a: string, b: string, t: number): string {
  const A = parseHex(a);
  const B = parseHex(b);
  const r = Math.round(A.r + (B.r - A.r) * t);
  const g = Math.round(A.g + (B.g - A.g) * t);
  const bl = Math.round(A.b + (B.b - A.b) * t);
  return `#${[r, g, bl].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

function parseHex(s: string): { r: number; g: number; b: number } {
  const m = s.replace("#", "").match(/^([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (!m) return { r: 30, g: 41, b: 59 };
  const v = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}
