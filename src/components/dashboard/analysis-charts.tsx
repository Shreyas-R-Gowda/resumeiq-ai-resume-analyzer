"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalysisResult } from "@/types/resume";

export function AnalysisCharts({ analysis }: { analysis: AnalysisResult }) {
  const formatTooltipValue = (
    value: number | string | readonly (number | string)[] | undefined,
    label: string,
  ) => [
    `${Array.isArray(value) ? value[0] ?? 0 : value ?? 0}/100`,
    label,
  ] as [string, string];

  const scoreData = [
    { name: "Resume Score", value: analysis.resumeScore, fill: "#0ea5e9" },
    { name: "ATS Score", value: analysis.atsScore, fill: "#22c55e" },
    { name: "JD Match", value: analysis.jdMatchPercentage ?? 0, fill: "#f59e0b" },
  ];

  const breakdown = analysis.scoreBreakdown
    ? [
        { subject: "Format", value: analysis.scoreBreakdown.formattingAtsStructure },
        { subject: "Skills", value: analysis.scoreBreakdown.technicalSkillsRelevance },
        { subject: "Projects", value: analysis.scoreBreakdown.projectQuality },
        { subject: "Impact", value: analysis.scoreBreakdown.experienceImpactMetrics },
        { subject: "Keywords", value: analysis.scoreBreakdown.keywordCoverage },
        { subject: "Clarity", value: analysis.scoreBreakdown.grammarClarity },
      ]
    : [];

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={scoreData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => formatTooltipValue(value, "Score")} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {scoreData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={breakdown}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => formatTooltipValue(value, "Category")} />
            <Radar dataKey="value" stroke="#0ea5e9" fill="#38bdf8" fillOpacity={0.45} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
