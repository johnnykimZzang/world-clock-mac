import type { Sky } from "../lib/sun";
import type { DayState } from "../lib/time";

export const ORB: Record<DayState, string> = {
  dawn: "#ffb38a",
  day: "#ffd85a",
  dusk: "#ff7a95",
  night: "#7f78ff",
};

/** Lit part of the moon for `phase` (0 new → 0.5 full), as seen from the northern hemisphere */
function moonLitPath(phase: number, r: number): string {
  const k = Math.cos(2 * Math.PI * phase);
  const waxing = phase < 0.5;
  const rx = Math.abs(k) * r;
  const outer = waxing ? 1 : 0;
  const inner = waxing ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0);
  return `M ${r} 0 A ${r} ${r} 0 0 ${outer} ${r} ${2 * r} A ${rx} ${r} 0 0 ${inner} ${r} 0 Z`;
}

export function MoonGlyph({ phase, size }: { phase: number; size: number }) {
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ display: "block" }}>
      <circle cx={r} cy={r} r={r - 0.5} fill="rgba(200,200,230,0.18)" stroke="rgba(230,230,255,0.35)" strokeWidth="0.5" />
      <path d={moonLitPath(phase, r)} fill="#f3f1ff" />
    </svg>
  );
}

/**
 * Soft light pool plus a crisp sun/moon disc, placed where the real
 * sun or moon is in that city's sky.
 */
export function SkyOrb({ sky, glow, disc }: { sky: Sky; glow: number; disc?: number }) {
  const color = ORB[sky.state];
  const pos = { left: `${sky.orb.x}%`, top: `${sky.orb.y}%` };
  return (
    <>
      <span
        className="orb-glow"
        style={{
          ...pos,
          width: glow * 1.5,
          height: glow * 1.5,
          background: `radial-gradient(closest-side, ${color} 0%, ${color} 40%, color-mix(in srgb, ${color} 45%, transparent) 65%, transparent 100%)`,
        }}
      />
      {disc && <span className="orb-disc" style={pos}>
        {sky.isSun ? (
          <span style={{
            display: "block",
            width: disc,
            height: disc,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, #fffbe8, ${color})`,
            boxShadow: `0 0 ${disc}px ${color}`,
          }} />
        ) : (
          <MoonGlyph phase={sky.moon} size={disc + 2} />
        )}
      </span>}
    </>
  );
}
