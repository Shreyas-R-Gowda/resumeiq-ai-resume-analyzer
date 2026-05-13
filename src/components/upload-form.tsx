"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyzeResponse } from "@/types/resume";
import { cn } from "@/utils/cn";

const acceptedTypes = [".pdf", ".docx"];
const progressSteps = [
  "Parsing resume",
  "Checking ATS structure",
  "Calibrating scores",
  "Preparing recruiter report",
];

export function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [progressStep, setProgressStep] = useState(0);

  const fileSummary = useMemo(() => {
    if (!file) return null;
    return `${(file.size / 1024 / 1024).toFixed(2)} MB • ${file.name.split(".").pop()?.toUpperCase()}`;
  }, [file]);

  useEffect(() => {
    if (!isAnalyzing) return;

    const interval = window.setInterval(() => {
      setProgressStep((current) => Math.min(current + 1, progressSteps.length - 1));
    }, 900);

    return () => window.clearInterval(interval);
  }, [isAnalyzing]);

  function selectFile(nextFile?: File) {
    setError("");
    if (!nextFile) return;

    const isAccepted = acceptedTypes.some((type) =>
      nextFile.name.toLowerCase().endsWith(type),
    );

    if (!isAccepted) {
      setError("Upload a PDF or DOCX resume.");
      return;
    }

    setFile(nextFile);
  }

  async function runAnalysis(useDemo = false) {
    if (!file && !useDemo) {
      setError("Choose a resume before analyzing.");
      return;
    }

    setIsAnalyzing(true);
    setProgressStep(0);
    setError("");

    const formData = new FormData();
    if (file) {
      formData.append("resume", file);
    }
    formData.append("jobDescription", jobDescription);
    formData.append("useDemo", String(useDemo));

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed. Please try again.");
      }

      sessionStorage.setItem("resume-analysis", JSON.stringify(data as AnalyzeResponse));
      router.push("/dashboard");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Analysis failed.");
    } finally {
      setProgressStep(0);
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader>
          <CardTitle>Upload resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              selectFile(event.dataTransfer.files[0]);
            }}
            className={cn(
              "flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 text-center transition duration-200 dark:border-slate-700 dark:bg-slate-900/60",
              isDragging && "scale-[1.01] border-sky-400 bg-sky-50 shadow-lg shadow-sky-100 dark:bg-sky-950/30",
              file && "border-emerald-300 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/30",
            )}
          >
            <input
              className="sr-only"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => selectFile(event.target.files?.[0])}
            />
            {file ? (
              <CheckCircle2 className="mb-4 size-12 text-emerald-500" />
            ) : (
              <UploadCloud className="mb-4 size-12 text-sky-500" />
            )}
            <p className="text-lg font-semibold text-slate-950 dark:text-white">
              {file ? "Resume ready to analyze" : "Drop your resume here"}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {file ? "You can replace it anytime before running analysis." : "PDF or DOCX, up to 8 MB"}
            </p>
          </label>

          {file && (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileText className="size-5 text-sky-500" />
                  <div>
                    <p className="font-medium text-slate-950 dark:text-white">{file.name}</p>
                    <p className="text-sm text-slate-500">{fileSummary}</p>
                  </div>
                </div>
                <button
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setFile(null)}
                  aria-label="Remove file"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100">
                  <Eye className="size-4 text-sky-500" />
                  File preview
                </div>
                <p className="truncate">{file.name}</p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="rounded-lg border border-sky-200 bg-sky-50/80 p-4 dark:border-sky-900 dark:bg-sky-950/30">
              <div className="mb-3 flex items-center justify-between text-sm font-medium text-sky-800 dark:text-sky-200">
                <span>{progressSteps[progressStep]}</span>
                <span>{Math.round(((progressStep + 1) / progressSteps.length) * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-sky-100 dark:bg-sky-900/80">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-500"
                  style={{ width: `${((progressStep + 1) / progressSteps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button className="w-full" size="lg" disabled={isAnalyzing} onClick={() => runAnalysis(false)}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Analyzing resume
                </>
              ) : (
                "Analyze resume"
              )}
            </Button>
            <Button
              className="w-full"
              size="lg"
              variant="secondary"
              disabled={isAnalyzing}
              onClick={() => runAnalysis(true)}
            >
              <Sparkles className="size-4" />
              Demo analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Target job description</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste a role description to calculate JD match, ATS keywords, and tailored suggestions."
              className="min-h-72 w-full resize-y rounded-lg border border-slate-200 bg-white p-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-sky-950"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What the analyzer checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">ATS structure and parsing friendliness</div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">Technical skills, projects, and quantified impact</div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">Keyword coverage, clarity, and recruiter readiness</div>
          </CardContent>
        </Card>

        {isAnalyzing && (
          <Card>
            <CardContent className="space-y-3 pt-5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
