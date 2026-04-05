import { useMemo } from "react";

const STAR_COUNT = 12;

export function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, () => ({
        w: 1 + Math.random() * 2,
        top: Math.random() * 100,
        left: Math.random() * 100,
        dur: 2 + Math.random() * 3,
        delay: Math.random() * 2,
      })),
    []
  );

  return (
    <>
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: `${s.w}px`,
            height: `${s.w}px`,
            background: "rgba(255,255,255,0.5)",
            borderRadius: "50%",
            top: `${s.top}%`,
            left: `${s.left}%`,
            animation: `twinkle ${s.dur}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </>
  );
}
