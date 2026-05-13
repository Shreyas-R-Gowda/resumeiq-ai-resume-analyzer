"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

const states = [
  {
    title: "Software Engineer Resume",
    status: "ATS scan complete",
    score: "82/100",
    items: [
      ["Project impact", "Strong"],
      ["Keyword coverage", "Good fit"],
      ["Student readiness", "Promising"],
      ["Formatting", "Clean"],
    ],
  },
  {
    title: "ML Intern Resume",
    status: "Recruiter review ready",
    score: "79/100",
    items: [
      ["Technical stack", "Relevant"],
      ["Metrics", "Needs more"],
      ["Projects", "Competitive"],
      ["ATS parsing", "Healthy"],
    ],
  },
  {
    title: "Frontend Resume",
    status: "JD match calibrated",
    score: "85/100",
    items: [
      ["UI projects", "Standout"],
      ["Keywords", "Aligned"],
      ["Experience", "Growing"],
      ["Clarity", "Sharp"],
    ],
  },
];

export function LandingPreviewCard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % states.length);
    }, 2800);

    return () => window.clearInterval(interval);
  }, []);

  const state = states[index];

  return (
    <div className="animate-fade-up rounded-lg border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <FileText className="size-5" />
          </div>
          <div className="transition-opacity duration-300">
            <p className="font-semibold">{state.title}</p>
            <p className="text-sm text-slate-500">{state.status}</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {state.score}
        </span>
      </div>
      <div className="space-y-3">
        {state.items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-lg bg-slate-50 p-3 transition-all duration-300 dark:bg-slate-950"
          >
            <span className="text-sm font-medium">{label}</span>
            <span className="text-sm text-slate-500">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
