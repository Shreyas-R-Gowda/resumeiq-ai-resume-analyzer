import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { LandingPreviewCard } from "@/components/landing-preview-card";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "ATS scoring",
    description: "Check parsing quality, section structure, keyword coverage, and recruiter readability.",
    icon: ShieldCheck,
  },
  {
    title: "JD matching",
    description: "Paste a target role and get match percentage, missing phrases, and tailored advice.",
    icon: Target,
  },
  {
    title: "Bullet rewrites",
    description: "Turn flat responsibilities into sharper impact bullets with metrics and action verbs.",
    icon: Sparkles,
  },
  {
    title: "Dashboard report",
    description: "Review score cards, charts, section feedback, weak areas, and exportable PDF feedback.",
    icon: BarChart3,
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.04),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_32%)]" />
          <div className="relative mx-auto grid min-h-[70vh] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-300">
                <CheckCircle2 className="size-4" />
                AI-powered resume intelligence
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-6xl">
                ResumeIQ
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Upload a PDF or DOCX resume and get a professional ATS score, recruiter-grade feedback, missing keywords, section analysis, and improved bullet points in one dashboard.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/upload">
                    Start analysis
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <a href="#features">
                    View features
                  </a>
                </Button>
              </div>
            </div>
            <LandingPreviewCard />
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
              Built for the full review loop
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              From upload to actionable rewrite
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-5">
                  <feature.icon className="mb-4 size-7 text-sky-500" />
                  <h3 className="font-semibold text-slate-950 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
