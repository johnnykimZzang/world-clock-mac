import { useRef, useState } from "react";

interface DialProps {
  hour: number;
  minute: number;
  size?: number;
  /** Called with a minute delta while the hour hand is dragged (one turn = 12h) */
  onScrub: (deltaMinutes: number) => void;
  onScrubEnd: () => void;
}

function polar(c: number, angleDeg: number, len: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: c + Math.cos(rad) * len, y: c + Math.sin(rad) * len };
}

/** Analog dial for the base city. Drag anywhere on it to turn the hour hand. */
export function Dial({ hour, minute, size = 84, onScrub, onScrubEnd }: DialProps) {
  const ref = useRef<SVGSVGElement>(null);
  const drag = useRef<{ angle: number; carry: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const c = size / 2;
  const r = c - 3;
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minuteAngle = minute * 6;

  const pointerAngle = (e: React.PointerEvent) => {
    const box = ref.current!.getBoundingClientRect();
    const dx = e.clientX - (box.left + box.width / 2);
    const dy = e.clientY - (box.top + box.height / 2);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { angle: pointerAngle(e), carry: 0 };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) return;
    const angle = pointerAngle(e);
    let delta = angle - d.angle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    d.angle = angle;
    // 360° = 12h = 720 min → 2 min per degree
    d.carry += delta * 2;
    const whole = Math.trunc(d.carry);
    if (whole !== 0) {
      d.carry -= whole;
      onScrub(whole);
    }
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    onScrubEnd();
  };

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const major = i % 3 === 0;
    const a = polar(c, i * 30, r - (major ? 8 : 4));
    const b = polar(c, i * 30, r - 1);
    return (
      <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
        stroke="currentColor" strokeWidth={major ? 1.6 : 1} opacity={major ? 0.7 : 0.35} />
    );
  });
  const hourTip = polar(c, hourAngle, r * 0.52);
  const minuteTip = polar(c, minuteAngle, r * 0.78);

  return (
    <svg
      ref={ref}
      className={`dial${dragging ? " is-dragging" : ""}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="slider"
      aria-label="기준 시각 다이얼 — 드래그하여 시간 이동"
      aria-valuetext={`${hour}시 ${minute}분`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <circle cx={c} cy={c} r={r} fill="var(--fill-2)" stroke="currentColor" strokeOpacity="0.25" />
      {ticks}
      <line x1={c} y1={c} x2={minuteTip.x} y2={minuteTip.y}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1={c} y1={c} x2={hourTip.x} y2={hourTip.y}
        stroke="var(--accent)" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx={hourTip.x} cy={hourTip.y} r={dragging ? 5 : 3.5} fill="var(--accent)" className="dial-grip" />
      <circle cx={c} cy={c} r="3" fill="currentColor" />
    </svg>
  );
}
