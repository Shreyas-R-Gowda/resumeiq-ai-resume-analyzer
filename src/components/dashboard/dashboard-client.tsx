"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  Gauge,
  SearchCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { AnalysisCharts } from "@/components/dashboard/analysis-charts";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyzeResponse } from "@/types/resume";

function getScoreTone(score: number) {
  if (score >= 75) return "success";
  if (score >= 40) return "warning";
  return "danger";
}

function getScoreLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Improvement";
  return "Weak";
}

function ListBlock({
  items,
  emptyLabel,
}: {
  items: string[];
  emptyLabel: string;
}) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function MetricBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const tone = getScoreTone(value);
  const color =
    tone === "success" ? "bg-emerald-500" : tone === "warning" ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-300">{label}</span>
        <span className="font-semibold text-slate-950 dark:text-white">{value}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Gauge;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
        <Icon className="size-4 text-sky-500" />
        {label}
      </div>
      <div className="text-2xl font-semibold text-slate-950 dark:text-white">{value}</div>
    </div>
  );
}

export function DashboardClient() {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = sessionStorage.getItem("resume-analysis");
      if (!stored) {
        router.replace("/upload");
        return;
      }

      setData(JSON.parse(stored) as AnalyzeResponse);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  const sections = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.analysis.sectionFeedback).sort(
      (a, b) => (b[1].score ?? 0) - (a[1].score ?? 0),
    );
  }, [data]);

  async function downloadPdf() {
    if (!reportRef.current) return;

    setExportError("");
    setIsExporting(true);

    try {
      const imageData = await toPng(reportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#f8fafc",
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const image = new Image();
      image.src = imageData;
      await image.decode();

      const width = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const height = (image.height * width) / image.width;

      if (height <= pageHeight) {
        pdf.addImage(imageData, "PNG", 0, 0, width, height);
      } else {
        let currentY = 0;
        while (currentY < height) {
          pdf.addImage(imageData, "PNG", 0, -currentY, width, height);
          currentY += pageHeight;
          if (currentY < height) {
            pdf.addPage();
          }
        }
      }

      pdf.save("resume-analysis-report.pdf");
    } catch (error) {
      console.error("PDF export failed", error);
      setExportError("PDF export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { analysis } = data;
  const insight = analysis.recruiterInsights;
  const strongestSection = insight?.strongestSection ?? sections[0]?.[0] ?? "experience";
  const weakestSection = insight?.weakestSection ?? sections.at(-1)?.[0] ?? "summary";

  return (
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-sky-600 dark:text-sky-400">
            Analysis dashboard
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            {data.fileName}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Recruiter-style review calibrated for engineering resumes.
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
            Scores are AI-estimated recruiter benchmarks. ATS score simulates modern applicant tracking systems.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" asChild>
            <Link href="/upload">New analysis</Link>
          </Button>
          <Button onClick={downloadPdf} disabled={isExporting}>
            <Download className="size-4" />
            {isExporting ? "Exporting" : "Download PDF"}
          </Button>
        </div>
      </div>

      {exportError ? (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {exportError}
        </div>
      ) : null}

      <div ref={reportRef} className="space-y-5 rounded-2xl bg-slate-50 pb-4 dark:bg-slate-950">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-sky-900 px-5 py-5 text-white dark:border-slate-800">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-sky-200">Recruiter report</p>
                  <h2 className="mt-2 text-3xl font-semibold">{data.fileName}</h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-200">
                    {insight?.estimatedRecruiterImpression ??
                      "Well-structured engineering resume with clear opportunities to raise interview odds."}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Resume score" value={`${analysis.resumeScore}/100`} icon={Gauge} />
                  <StatCard label="ATS score" value={`${analysis.atsScore}/100`} icon={SearchCheck} />
                  <StatCard label="JD match" value={`${analysis.jdMatchPercentage ?? 0}%`} icon={Target} />
                  <StatCard label="Readiness" value={getScoreLabel(analysis.resumeScore)} icon={TrendingUp} />
                </div>
              </div>
            </div>
            <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-4 sm:grid-cols-2">
                <ScoreRing value={analysis.resumeScore} label="Resume score" />
                <ScoreRing value={analysis.atsScore} label="ATS score" />
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <Sparkles className="size-4 text-sky-500" />
                  Recruiter insights
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Strongest section</span>
                    <Badge tone="success" className="capitalize">{strongestSection}</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Weakest section</span>
                    <Badge tone="warning" className="capitalize">{weakestSection}</Badge>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    {insight?.interviewReadiness ?? "Interview readiness improves further with stronger metrics and sharper role targeting."}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      <div className="mb-1 font-medium text-slate-950 dark:text-white">ATS pass likelihood</div>
                      {insight?.atsPassLikelihood ?? "Moderate"}
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      <div className="mb-1 font-medium text-slate-950 dark:text-white">Interview probability</div>
                      {insight?.interviewProbabilityEstimate ?? "Moderate"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <div className="mb-1 font-medium text-slate-950 dark:text-white">Strongest recruiter signal</div>
                    {insight?.strongestRecruiterSignal ?? "Clear technical substance"}
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <div className="mb-2 font-medium text-slate-950 dark:text-white">Hiring risk factors</div>
                    <ul className="space-y-1">
                      {(insight?.hiringRiskFactors ?? []).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <AnalysisCharts analysis={analysis} />
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h3 className="font-semibold text-slate-950 dark:text-white">Resume category scoring</h3>
                {analysis.scoreBreakdown ? (
                  <div className="space-y-4">
                    <MetricBar label="Formatting & ATS structure" value={analysis.scoreBreakdown.formattingAtsStructure} />
                    <MetricBar label="Technical skills relevance" value={analysis.scoreBreakdown.technicalSkillsRelevance} />
                    <MetricBar label="Project quality" value={analysis.scoreBreakdown.projectQuality} />
                    <MetricBar label="Experience & metrics" value={analysis.scoreBreakdown.experienceImpactMetrics} />
                    <MetricBar label="Keyword coverage" value={analysis.scoreBreakdown.keywordCoverage} />
                    <MetricBar label="Grammar & clarity" value={analysis.scoreBreakdown.grammarClarity} />
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Category data unavailable.</p>
                )}
              </div>
              <div className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h3 className="font-semibold text-slate-950 dark:text-white">ATS category scoring</h3>
                {analysis.atsBreakdown ? (
                  <div className="space-y-4">
                    <MetricBar label="Readability" value={analysis.atsBreakdown.readability} />
                    <MetricBar label="Keyword matching" value={analysis.atsBreakdown.keywordMatching} />
                    <MetricBar label="Section structure" value={analysis.atsBreakdown.sectionStructure} />
                    <MetricBar label="Contact info detection" value={analysis.atsBreakdown.contactInfoDetection} />
                    <MetricBar label="Parsing friendliness" value={analysis.atsBreakdown.parsingFriendliness} />
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">ATS detail unavailable.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ListBlock items={analysis.strengths} emptyLabel="No notable strengths were returned." />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Weaknesses</CardTitle>
            </CardHeader>
            <CardContent>
              <ListBlock items={analysis.weaknesses} emptyLabel="No major weaknesses were returned." />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          {(["critical", "important", "optional"] as const).map((group) => (
            <Card key={group}>
              <CardHeader>
                <CardTitle className="capitalize">{group} suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <ListBlock
                  items={analysis.suggestions[group]}
                  emptyLabel={`No ${group} suggestions right now.`}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <CardTitle>Missing ATS keywords</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {analysis.missingKeywords.length ? (
                analysis.missingKeywords.map((keyword) => (
                  <Badge key={keyword} tone="warning">
                    {keyword}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-slate-500">No major keyword gaps detected.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Skills detected</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {analysis.skills.length ? (
                analysis.skills.map((skill) => (
                  <Badge key={`${skill.name}-${skill.level}`} tone="success">
                    {skill.name}
                    {skill.level ? ` • ${skill.level}` : ""}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-slate-500">No skill signals were extracted.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
            <CardHeader>
              <CardTitle>Resume section analysis</CardTitle>
            </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sections.map(([section, feedback]) => (
              <div
                key={section}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-sky-800"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="font-semibold capitalize text-slate-950 dark:text-white">
                    {section}
                  </h3>
                  <Badge tone={getScoreTone(feedback.score ?? 0)}>{feedback.score ?? 0}/100</Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{feedback.feedback}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-sky-500" />
              AI rewritten bullet points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ListBlock
              items={analysis.rewrittenBullets}
              emptyLabel="No rewritten bullets were generated."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm leading-7 text-slate-100">
              {data.resumeText}
            </pre>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
