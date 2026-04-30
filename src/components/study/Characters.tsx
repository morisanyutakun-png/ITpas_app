/**
 * Cinematic character avatars.
 *
 * Hand-drawn SVG characters in the spirit of cryptography textbooks where
 * "Alice" and "Bob" are used as the canonical sender/receiver. Each
 * character is drawn at 120×140 inside a viewBox so the consumer can
 * scale by `width=100%` without facial distortion.
 *
 * Visual code (so readers spot them instantly):
 *   • Alice  — pink hair, gentle smile.
 *   • Bob    — blue cap, glasses.
 *   • Eve    — dark hood + red mask (the eavesdropper).
 *   • Trent  — green cape (trusted third party / CA).
 *   • Server — gray rack with status LED.
 *   • Hacker — purple hood with skull mark.
 *
 * Faces deliberately use minimal features so different expressions
 * (happy / neutral / worried / smug / shocked) just swap the mouth+brow
 * paths — the head, hair and body stay still.
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
      <div className="relative">
        <svg
          viewBox="0 0 120 140"
          width="100%"
          height="auto"
          aria-label={label ?? name}
          className="drop-shadow-md"
        >
          <Body expression={expression} />
        </svg>
      </div>
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

// ── Shared face primitives ──────────────────────────────────────────────

function Face({ expression }: { expression: Expression }) {
  return (
    <g>
      {/* Eyes — circles regardless of expression except for "shocked" */}
      {expression === "shocked" ? (
        <>
          <circle cx="48" cy="62" r="3" fill="#0F172A" />
          <circle cx="72" cy="62" r="3" fill="#0F172A" />
        </>
      ) : (
        <>
          <ellipse cx="48" cy="62" rx="2" ry="2.6" fill="#0F172A" />
          <ellipse cx="72" cy="62" rx="2" ry="2.6" fill="#0F172A" />
        </>
      )}
      {/* Brows */}
      {expression === "worried" && (
        <>
          <path d="M 42 56 Q 48 53 54 55" stroke="#0F172A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M 66 55 Q 72 53 78 56" stroke="#0F172A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </>
      )}
      {expression === "smug" && (
        <>
          <path d="M 42 56 L 54 56" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 66 56 L 78 56" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      {/* Mouth */}
      {expression === "happy" && (
        <path
          d="M 50 76 Q 60 84 70 76"
          stroke="#0F172A"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {expression === "neutral" && (
        <line
          x1="52"
          y1="78"
          x2="68"
          y2="78"
          stroke="#0F172A"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
      {expression === "worried" && (
        <path
          d="M 50 80 Q 60 75 70 80"
          stroke="#0F172A"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {expression === "smug" && (
        <path
          d="M 50 78 Q 60 82 70 76"
          stroke="#0F172A"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {expression === "shocked" && (
        <ellipse
          cx="60"
          cy="80"
          rx="3.5"
          ry="4"
          fill="#0F172A"
        />
      )}
    </g>
  );
}

// ── Alice — pink hair, friendly ────────────────────────────────────────

function AliceSvg({ expression }: { expression: Expression }) {
  return (
    <g>
      {/* Body */}
      <path d="M 30 132 Q 30 100 60 100 Q 90 100 90 132 L 90 140 L 30 140 z" fill="#FFC1DA" />
      <path d="M 60 100 L 60 92 L 60 100" stroke="#FFC1DA" strokeWidth="6" />
      {/* Hair back */}
      <path
        d="M 30 70 Q 25 40 60 30 Q 95 40 90 70 L 92 96 L 80 88 L 60 92 L 40 88 L 28 96 z"
        fill="#FF7AA8"
      />
      {/* Head */}
      <ellipse cx="60" cy="62" rx="22" ry="26" fill="#FFE0CC" />
      {/* Hair front bangs */}
      <path
        d="M 38 50 Q 45 42 55 46 Q 60 38 70 46 Q 78 44 82 52 L 82 60 Q 70 50 60 56 Q 48 50 38 60 z"
        fill="#FF7AA8"
      />
      {/* Bow */}
      <g transform="translate(80, 36)">
        <path d="M 0 0 L 6 -6 L 12 0 L 6 6 z" fill="#FF3B7E" />
        <circle cx="6" cy="0" r="2" fill="#FFFFFF" />
      </g>
      <Face expression={expression} />
    </g>
  );
}

// ── Bob — blue cap + glasses ────────────────────────────────────────────

function BobSvg({ expression }: { expression: Expression }) {
  return (
    <g>
      {/* Body */}
      <path d="M 30 132 Q 30 100 60 100 Q 90 100 90 132 L 90 140 L 30 140 z" fill="#9BC8FF" />
      {/* Head */}
      <ellipse cx="60" cy="64" rx="22" ry="26" fill="#FFE0CC" />
      {/* Hair sides */}
      <path d="M 38 64 Q 35 78 40 86 L 40 70 z" fill="#3D2A1A" />
      <path d="M 82 64 Q 85 78 80 86 L 80 70 z" fill="#3D2A1A" />
      {/* Cap */}
      <path d="M 36 50 Q 40 30 60 30 Q 80 30 84 50 L 86 56 L 34 56 z" fill="#0A84FF" />
      <ellipse cx="60" cy="56" rx="26" ry="3" fill="#0A6FD9" />
      {/* Cap brim */}
      <path d="M 28 56 L 50 60 L 28 60 z" fill="#0A6FD9" />
      <Face expression={expression} />
      {/* Glasses */}
      <g fill="none" stroke="#0F172A" strokeWidth="1.6">
        <circle cx="48" cy="62" r="6" />
        <circle cx="72" cy="62" r="6" />
        <line x1="54" y1="62" x2="66" y2="62" />
      </g>
    </g>
  );
}

// ── Eve — dark hood + red mask, sneaky ──────────────────────────────────

function EveSvg({ expression }: { expression: Expression }) {
  return (
    <g>
      {/* Body */}
      <path d="M 30 132 Q 30 100 60 100 Q 90 100 90 132 L 90 140 L 30 140 z" fill="#3A2F46" />
      {/* Hood back */}
      <path
        d="M 24 70 Q 22 36 60 30 Q 98 36 96 70 L 96 100 L 82 88 L 60 92 L 38 88 L 24 100 z"
        fill="#2A2030"
      />
      {/* Head */}
      <ellipse cx="60" cy="64" rx="22" ry="26" fill="#FFE0CC" />
      {/* Hood front rim */}
      <path
        d="M 36 52 Q 60 30 84 52 L 84 64 Q 60 50 36 64 z"
        fill="#2A2030"
      />
      {/* Mask covering nose+mouth */}
      <path
        d="M 40 68 L 80 68 L 80 82 Q 60 88 40 82 z"
        fill="#FF3B30"
      />
      {/* Eyes (only) */}
      {expression === "shocked" ? (
        <>
          <circle cx="48" cy="62" r="3" fill="#0F172A" />
          <circle cx="72" cy="62" r="3" fill="#0F172A" />
        </>
      ) : (
        <>
          <ellipse cx="48" cy="62" rx="2" ry="2.6" fill="#0F172A" />
          <ellipse cx="72" cy="62" rx="2" ry="2.6" fill="#0F172A" />
        </>
      )}
      {expression === "smug" && (
        <>
          <path d="M 42 57 L 54 55" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 66 55 L 78 57" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

// ── Trent — green cape, trusted third party ────────────────────────────

function TrentSvg({ expression }: { expression: Expression }) {
  return (
    <g>
      {/* Cape */}
      <path d="M 24 132 Q 22 96 60 96 Q 98 96 96 132 L 96 140 L 24 140 z" fill="#1F8B5C" />
      {/* Body */}
      <path d="M 36 132 Q 36 104 60 104 Q 84 104 84 132 L 84 140 L 36 140 z" fill="#34C759" />
      {/* Head */}
      <ellipse cx="60" cy="64" rx="22" ry="26" fill="#FFE0CC" />
      {/* Hair */}
      <path d="M 36 50 Q 45 36 60 38 Q 75 36 84 50 L 84 60 Q 70 52 60 56 Q 50 52 36 60 z" fill="#5C3A1E" />
      <Face expression={expression} />
      {/* Star badge on chest */}
      <g transform="translate(60, 122)">
        <path d="M 0 -5 L 1.5 -1.5 L 5 -1 L 2 1.5 L 3 5 L 0 3 L -3 5 L -2 1.5 L -5 -1 L -1.5 -1.5 z" fill="#FFD60A" />
      </g>
    </g>
  );
}

// ── Server — gray rack ──────────────────────────────────────────────────

function ServerSvg({ expression }: { expression: Expression }) {
  // Servers don't really have expressions; we use the LED color/state.
  const led =
    expression === "shocked" || expression === "worried"
      ? "#FF3B30"
      : expression === "happy"
        ? "#34C759"
        : "#0A84FF";
  return (
    <g>
      {/* Rack base */}
      <rect x="22" y="34" width="76" height="92" rx="6" fill="#E5E7EB" stroke="#94A3B8" strokeWidth="1.5" />
      {/* Slots */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x="28"
            y={42 + i * 18}
            width="64"
            height="14"
            rx="2"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1"
          />
          <circle cx={36} cy={49 + i * 18} r="1.6" fill={led} />
          <line
            x1={44}
            y1={49 + i * 18}
            x2={86}
            y2={49 + i * 18}
            stroke="#94A3B8"
            strokeWidth="0.7"
            strokeDasharray="2 2"
          />
        </g>
      ))}
      {/* Bottom feet */}
      <rect x="30" y="126" width="8" height="6" fill="#94A3B8" />
      <rect x="82" y="126" width="8" height="6" fill="#94A3B8" />
    </g>
  );
}

// ── Hacker — purple hood + skull ────────────────────────────────────────

function HackerSvg({ expression }: { expression: Expression }) {
  void expression;
  return (
    <g>
      {/* Body / robe */}
      <path d="M 28 132 Q 28 100 60 100 Q 92 100 92 132 L 92 140 L 28 140 z" fill="#5B21B6" />
      {/* Hood */}
      <path
        d="M 22 72 Q 20 32 60 28 Q 100 32 98 72 L 98 104 L 80 90 L 60 94 L 40 90 L 22 104 z"
        fill="#3A1A8C"
      />
      {/* Inside shadow */}
      <ellipse cx="60" cy="62" rx="22" ry="26" fill="#1E1033" />
      {/* Skull eyes */}
      <circle cx="50" cy="60" r="3.5" fill="#FFFFFF" />
      <circle cx="70" cy="60" r="3.5" fill="#FFFFFF" />
      {/* Smile bones */}
      <path d="M 50 76 L 70 76" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="55" y1="76" x2="55" y2="80" stroke="#FFFFFF" strokeWidth="1.5" />
      <line x1="60" y1="76" x2="60" y2="80" stroke="#FFFFFF" strokeWidth="1.5" />
      <line x1="65" y1="76" x2="65" y2="80" stroke="#FFFFFF" strokeWidth="1.5" />
    </g>
  );
}
