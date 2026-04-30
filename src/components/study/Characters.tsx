/**
 * Cinematic character avatars — refreshed.
 *
 * Hand-illustrated SVG that follows cryptography textbook tradition
 * (Alice, Bob, Eve…). This pass adds:
 *   • Hair shading (highlight + base + shadow gradient via overlay)
 *   • Cheek blush dots so faces feel alive
 *   • Crisper accessories (Alice's bow, Bob's headphones-style cap)
 *   • Eve's hood drape with proper folds
 *   • Per-character signature tone so they're recognizable at thumbnail size
 *
 * All characters live inside a 120x140 viewBox so the consumer scales
 * via width=100% without face distortion. Faces share a Face primitive
 * that swaps mouth + brows on `expression` while head/hair stay still.
 */

type Expression = "happy" | "neutral" | "worried" | "smug" | "shocked";
type CharacterName =
  | "alice"
  | "bob"
  | "eve"
  | "server"
  | "hacker"
  | "trent";

export function Character({
  name,
  expression = "neutral",
  label,
  sublabel,
}: {
  name: CharacterName;
  expression?: Expression;
  label?: string;
  sublabel?: string;
}) {
  const Body =
    name === "alice"
      ? AliceSvg
      : name === "bob"
        ? BobSvg
        : name === "eve"
          ? EveSvg
          : name === "trent"
            ? TrentSvg
            : name === "hacker"
              ? HackerSvg
              : ServerSvg;
  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 120 140"
        width="100%"
        height="auto"
        aria-label={label ?? name}
        className="drop-shadow-[0_4px_8px_rgba(15,23,42,0.18)]"
      >
        <Body expression={expression} />
      </svg>
      {label && (
        <div className="mt-1 rounded-full bg-foreground px-2.5 py-0.5 text-[10.5px] font-semibold text-background shadow-ios-sm">
          {label}
        </div>
      )}
      {sublabel && (
        <div className="mt-0.5 text-[9.5px] text-muted-foreground">
          {sublabel}
        </div>
      )}
    </div>
  );
}

// ── Shared face + skin primitives ───────────────────────────────────────

const SKIN = "#FFE0CC";
const SKIN_SHADOW = "#F5C9AC";
const BLUSH = "#FFA8B5";

function Cheeks({ tone = BLUSH }: { tone?: string }) {
  return (
    <g fill={tone} opacity={0.7}>
      <ellipse cx="44" cy="72" rx="3.5" ry="2.2" />
      <ellipse cx="76" cy="72" rx="3.5" ry="2.2" />
    </g>
  );
}

function Face({
  expression,
  eyeStyle = "round",
}: {
  expression: Expression;
  eyeStyle?: "round" | "sharp";
}) {
  const eyeFill = "#1A2030";
  return (
    <g>
      {/* Eyes */}
      {expression === "shocked" ? (
        <>
          <circle cx="48" cy="63" r="3.2" fill={eyeFill} />
          <circle cx="72" cy="63" r="3.2" fill={eyeFill} />
        </>
      ) : eyeStyle === "sharp" ? (
        <>
          <path d="M 44 62 Q 48 60 52 62 L 52 64 Q 48 66 44 64 z" fill={eyeFill} />
          <path d="M 68 62 Q 72 60 76 62 L 76 64 Q 72 66 68 64 z" fill={eyeFill} />
        </>
      ) : (
        <>
          <ellipse cx="48" cy="62" rx="2.3" ry="3" fill={eyeFill} />
          <ellipse cx="72" cy="62" rx="2.3" ry="3" fill={eyeFill} />
          {/* Catchlights */}
          <circle cx="48.7" cy="61" r="0.9" fill="#FFFFFF" />
          <circle cx="72.7" cy="61" r="0.9" fill="#FFFFFF" />
        </>
      )}

      {/* Brows */}
      {expression === "worried" && (
        <>
          <path d="M 41 56 Q 48 53 55 56" stroke="#1A2030" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M 65 56 Q 72 53 79 56" stroke="#1A2030" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>
      )}
      {expression === "smug" && (
        <>
          <path d="M 41 56 L 55 54" stroke="#1A2030" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 65 54 L 79 56" stroke="#1A2030" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
      {expression === "happy" && (
        <>
          <path d="M 41 55 Q 48 53 55 55" stroke="#1A2030" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 65 55 Q 72 53 79 55" stroke="#1A2030" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* Mouth */}
      {expression === "happy" && (
        <path
          d="M 50 78 Q 60 86 70 78"
          stroke="#1A2030"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {expression === "neutral" && (
        <path
          d="M 53 79 Q 60 81 67 79"
          stroke="#1A2030"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {expression === "worried" && (
        <path
          d="M 50 82 Q 60 76 70 82"
          stroke="#1A2030"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {expression === "smug" && (
        <path
          d="M 50 78 Q 60 84 70 76"
          stroke="#1A2030"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {expression === "shocked" && (
        <ellipse cx="60" cy="80" rx="3.5" ry="4.5" fill="#1A2030" />
      )}
    </g>
  );
}

// ── Alice — pink + cute ─────────────────────────────────────────────────

function AliceSvg({ expression }: { expression: Expression }) {
  return (
    <g>
      <defs>
        <linearGradient id="alice-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB1D2" />
          <stop offset="100%" stopColor="#E85FA0" />
        </linearGradient>
        <linearGradient id="alice-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD2E2" />
          <stop offset="100%" stopColor="#FFA0C2" />
        </linearGradient>
      </defs>

      {/* Body */}
      <path
        d="M 28 132 Q 28 100 60 100 Q 92 100 92 132 L 92 140 L 28 140 z"
        fill="url(#alice-shirt)"
      />
      {/* Collar shadow */}
      <path d="M 50 100 Q 60 106 70 100 L 70 104 Q 60 109 50 104 z" fill="#E885B0" opacity="0.5" />
      {/* Neck */}
      <rect x="55" y="92" width="10" height="10" fill={SKIN_SHADOW} />

      {/* Hair back (long curtain) */}
      <path
        d="M 26 78 Q 22 38 60 28 Q 98 38 94 78 L 96 110 L 82 96 L 60 92 L 38 96 L 24 110 z"
        fill="url(#alice-hair)"
      />

      {/* Head */}
      <ellipse cx="60" cy="62" rx="22" ry="26" fill={SKIN} />
      {/* Jaw shadow */}
      <path d="M 40 76 Q 60 92 80 76" stroke={SKIN_SHADOW} strokeWidth="1.4" fill="none" opacity="0.5" />

      {/* Hair front bangs with highlights */}
      <path
        d="M 38 50 Q 44 38 54 44 Q 60 32 70 44 Q 78 40 82 52 L 82 62 Q 70 50 60 56 Q 48 50 38 62 z"
        fill="url(#alice-hair)"
      />
      {/* Highlight strand */}
      <path d="M 44 44 Q 50 40 56 44" stroke="#FFD9EA" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Side tuft */}
      <path d="M 36 60 Q 32 80 38 90" stroke="#E85FA0" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Hair bow on right */}
      <g transform="translate(82, 38)">
        <path d="M -8 0 L 0 -7 L 8 0 L 0 7 z" fill="#FF3B7E" />
        <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
        <path d="M -8 0 Q -10 4 -6 8" stroke="#D11A5A" strokeWidth="1.5" fill="none" />
        <path d="M 8 0 Q 10 4 6 8" stroke="#D11A5A" strokeWidth="1.5" fill="none" />
      </g>

      <Cheeks tone={BLUSH} />
      <Face expression={expression} />
    </g>
  );
}

// ── Bob — cool blue ─────────────────────────────────────────────────────

function BobSvg({ expression }: { expression: Expression }) {
  return (
    <g>
      <defs>
        <linearGradient id="bob-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#39A0FF" />
          <stop offset="100%" stopColor="#0A5FCC" />
        </linearGradient>
        <linearGradient id="bob-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E2A40" />
          <stop offset="100%" stopColor="#0F1A2E" />
        </linearGradient>
      </defs>

      {/* Body — dark hoodie with light hood drape */}
      <path
        d="M 28 132 Q 28 100 60 100 Q 92 100 92 132 L 92 140 L 28 140 z"
        fill="url(#bob-shirt)"
      />
      <path d="M 30 100 Q 60 92 90 100 L 90 108 Q 60 100 30 108 z" fill="#2E3D5C" />

      {/* Neck */}
      <rect x="55" y="92" width="10" height="10" fill={SKIN_SHADOW} />

      {/* Hair sides (peek under cap) */}
      <path d="M 38 64 Q 35 78 40 88 L 40 70 z" fill="#3B2A18" />
      <path d="M 82 64 Q 85 78 80 88 L 80 70 z" fill="#3B2A18" />

      {/* Head */}
      <ellipse cx="60" cy="64" rx="22" ry="26" fill={SKIN} />

      {/* Cap (sleeker, tilted slightly) */}
      <path
        d="M 34 50 Q 38 28 60 28 Q 82 28 86 50 L 90 56 L 30 56 z"
        fill="url(#bob-cap)"
      />
      <ellipse cx="60" cy="56" rx="30" ry="3" fill="#0A4F9F" />
      {/* Cap brim */}
      <path d="M 22 56 L 56 62 L 22 62 z" fill="#0A4F9F" />
      {/* Logo on cap */}
      <circle cx="60" cy="40" r="4" fill="#FFFFFF" opacity="0.95" />
      <text
        x="60"
        y="42.5"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="800"
        fontSize="5.5"
        fill="#0A5FCC"
      >
        B
      </text>

      <Cheeks tone="#F4A37F" />
      <Face expression={expression} />

      {/* Stylish glasses (square, dark) */}
      <g fill="none" stroke="#1A2030" strokeWidth="1.8">
        <rect x="40" y="56" width="14" height="11" rx="2.5" />
        <rect x="66" y="56" width="14" height="11" rx="2.5" />
        <line x1="54" y1="61.5" x2="66" y2="61.5" />
      </g>
      {/* Glasses glint */}
      <line x1="42" y1="58" x2="46" y2="62" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" />
      <line x1="68" y1="58" x2="72" y2="62" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" />
    </g>
  );
}

// ── Eve — sleek dark hood + red mask ────────────────────────────────────

function EveSvg({ expression }: { expression: Expression }) {
  return (
    <g>
      <defs>
        <linearGradient id="eve-hood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3D2D4E" />
          <stop offset="100%" stopColor="#1B1226" />
        </linearGradient>
        <linearGradient id="eve-mask" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF5050" />
          <stop offset="100%" stopColor="#C7202D" />
        </linearGradient>
      </defs>

      {/* Body / cloak */}
      <path
        d="M 26 132 Q 26 100 60 100 Q 94 100 94 132 L 94 140 L 26 140 z"
        fill="url(#eve-hood)"
      />
      {/* Cloak fold lines */}
      <path d="M 60 102 L 50 138" stroke="#0F0818" strokeWidth="1.5" opacity="0.7" />
      <path d="M 60 102 L 70 138" stroke="#0F0818" strokeWidth="1.5" opacity="0.7" />

      {/* Hood back */}
      <path
        d="M 22 70 Q 18 32 60 26 Q 102 32 98 70 L 98 102 L 82 88 L 60 92 L 38 88 L 22 102 z"
        fill="url(#eve-hood)"
      />

      {/* Head */}
      <ellipse cx="60" cy="64" rx="22" ry="26" fill={SKIN} />

      {/* Hood front rim with shadow drape */}
      <path
        d="M 34 50 Q 60 28 86 50 L 86 64 Q 60 50 34 64 z"
        fill="url(#eve-hood)"
      />
      {/* Hair bangs peeking out */}
      <path d="M 42 48 Q 50 45 58 48 L 56 56 z" fill="#1B1226" />
      <path d="M 66 48 Q 74 45 78 48 L 74 56 z" fill="#1B1226" />

      {/* Mask */}
      <path
        d="M 38 68 L 82 68 L 82 84 Q 60 90 38 84 z"
        fill="url(#eve-mask)"
      />
      {/* Mask seam */}
      <line x1="60" y1="68" x2="60" y2="86" stroke="#A01825" strokeWidth="0.8" opacity="0.6" />
      {/* Mask edge highlight */}
      <path d="M 38 68 L 82 68" stroke="#FFB3B3" strokeWidth="1" opacity="0.7" />

      {/* Sharp eyes (only — mouth covered) */}
      {expression === "shocked" ? (
        <>
          <circle cx="48" cy="62" r="3.2" fill="#1A2030" />
          <circle cx="72" cy="62" r="3.2" fill="#1A2030" />
        </>
      ) : (
        <>
          <path d="M 42 60 Q 48 58 54 60 Q 50 64 46 64 z" fill="#1A2030" />
          <path d="M 66 60 Q 72 58 78 60 Q 74 64 70 64 z" fill="#1A2030" />
          <circle cx="48" cy="61" r="0.9" fill="#FFFFFF" />
          <circle cx="72" cy="61" r="0.9" fill="#FFFFFF" />
        </>
      )}
      {expression === "smug" && (
        <>
          <path d="M 42 56 L 54 54" stroke="#1A2030" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 66 54 L 78 56" stroke="#1A2030" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
      {expression === "worried" && (
        <>
          <path d="M 41 55 Q 48 53 55 56" stroke="#1A2030" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M 65 56 Q 72 53 79 55" stroke="#1A2030" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

// ── Trent — green + trustworthy ─────────────────────────────────────────

function TrentSvg({ expression }: { expression: Expression }) {
  return (
    <g>
      <defs>
        <linearGradient id="trent-cape" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3FE07F" />
          <stop offset="100%" stopColor="#1F8B5C" />
        </linearGradient>
      </defs>
      {/* Cape */}
      <path
        d="M 22 132 Q 20 96 60 96 Q 100 96 98 132 L 98 140 L 22 140 z"
        fill="url(#trent-cape)"
      />
      {/* Body */}
      <path
        d="M 36 132 Q 36 104 60 104 Q 84 104 84 132 L 84 140 L 36 140 z"
        fill="#34C759"
      />
      {/* Head */}
      <ellipse cx="60" cy="64" rx="22" ry="26" fill={SKIN} />
      {/* Hair */}
      <path d="M 36 50 Q 45 36 60 38 Q 75 36 84 50 L 84 60 Q 70 52 60 56 Q 50 52 36 60 z" fill="#5C3A1E" />
      <Cheeks tone="#F4A37F" />
      <Face expression={expression} />
      {/* Star badge on chest */}
      <g transform="translate(60, 122)">
        <path
          d="M 0 -6 L 1.8 -1.8 L 6 -1.2 L 2.4 1.8 L 3.6 6 L 0 3.6 L -3.6 6 L -2.4 1.8 L -6 -1.2 L -1.8 -1.8 z"
          fill="#FFD60A"
        />
      </g>
    </g>
  );
}

// ── Server — gray rack with active LEDs ─────────────────────────────────

function ServerSvg({ expression }: { expression: Expression }) {
  const led =
    expression === "shocked" || expression === "worried"
      ? "#FF3B30"
      : expression === "happy"
        ? "#34C759"
        : "#0A84FF";
  return (
    <g>
      {/* Rack base with subtle gradient */}
      <defs>
        <linearGradient id="srv-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
      </defs>
      <rect
        x="20"
        y="32"
        width="80"
        height="96"
        rx="8"
        fill="url(#srv-body)"
        stroke="#94A3B8"
        strokeWidth="1.6"
      />
      {/* Slots */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x="26"
            y={42 + i * 20}
            width="68"
            height="16"
            rx="3"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1"
          />
          {/* LED with subtle glow when active */}
          <circle cx={36} cy={50 + i * 20} r="2.2" fill={led} />
          <circle cx={36} cy={50 + i * 20} r="3.5" fill={led} opacity="0.25" />
          {/* Slot text bars */}
          <rect x="44" y={47 + i * 20} width="40" height="2" rx="1" fill="#94A3B8" opacity="0.6" />
          <rect x="44" y={51 + i * 20} width="28" height="2" rx="1" fill="#94A3B8" opacity="0.4" />
        </g>
      ))}
      {/* Top vent grill */}
      <g fill="#94A3B8" opacity="0.6">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={28 + i * 8} y="36" width="6" height="1.6" rx="0.8" />
        ))}
      </g>
      {/* Bottom feet */}
      <rect x="28" y="128" width="8" height="6" fill="#94A3B8" />
      <rect x="84" y="128" width="8" height="6" fill="#94A3B8" />
    </g>
  );
}

// ── Hacker — purple hood + skull ────────────────────────────────────────

function HackerSvg({ expression }: { expression: Expression }) {
  void expression;
  return (
    <g>
      <defs>
        <linearGradient id="hacker-hood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#3A1A8C" />
        </linearGradient>
      </defs>
      {/* Body / robe */}
      <path
        d="M 26 132 Q 26 100 60 100 Q 94 100 94 132 L 94 140 L 26 140 z"
        fill="url(#hacker-hood)"
      />
      {/* Hood */}
      <path
        d="M 20 72 Q 18 30 60 26 Q 102 30 100 72 L 100 106 L 80 90 L 60 94 L 40 90 L 20 106 z"
        fill="url(#hacker-hood)"
      />
      {/* Inner shadow */}
      <ellipse cx="60" cy="62" rx="22" ry="26" fill="#1A0E2D" />
      {/* Skull */}
      <ellipse cx="60" cy="62" rx="14" ry="16" fill="#FFFFFF" />
      {/* Skull eyes */}
      <ellipse cx="55" cy="60" rx="3" ry="3.6" fill="#1A0E2D" />
      <ellipse cx="65" cy="60" rx="3" ry="3.6" fill="#1A0E2D" />
      {/* Skull nose */}
      <path d="M 60 66 L 58 70 L 62 70 z" fill="#1A0E2D" />
      {/* Skull teeth */}
      <rect x="53" y="74" width="14" height="5" fill="#1A0E2D" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={55 + i * 4} y="74" width="0.8" height="5" fill="#FFFFFF" />
      ))}
    </g>
  );
}
