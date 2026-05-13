"use client";

import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

function getScoreState(score: number) {
  if (score >= 90) return { label: "Excellent", ring: "#10b981", text: "Top-tier recruiter signal" };
  if (score >= 75) return { label: "Strong", ring: "#22c55e", text: "Competitive for many roles" };
  if (score >= 60) return { label: "Good", ring: "#f59e0b", text: "Solid foundation with room to sharpen" };
  if (score >= 40) return { label: "Needs Improvement", ring: "#f97316", text: "Important improvements would help" };
  return { label: "Weak", ring: "#ef4444", text: "Needs meaningful revision" };
}

export function ScoreRing({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const [displayValue, setDisplayValue] = useState(0);
  const scoreState = getScoreState(clamped);

  useEffect(() => {
    let frame = 0;
    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / 800, 1);
      setDisplayValue(Math.round(clamped * progress));
      if (progress < 1) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [clamped]);

  return (
    <div className={cn("flex items-center gap-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-900/70", className)}>
      <div
        className="grid size-28 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${scoreState.ring} ${displayValue * 3.6}deg, rgb(226 232 240) 0deg)`,
        }}
      >
        <div className="grid size-20 place-items-center rounded-full bg-white dark:bg-slate-950">
          <span className="text-2xl font-bold text-slate-950 dark:text-white">
            {displayValue}
          </span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
          {scoreState.label}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {scoreState.text}
        </p>
      </div>
    </div>
  );
}
