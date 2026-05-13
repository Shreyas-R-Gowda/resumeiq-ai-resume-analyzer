import { SiteHeader } from "@/components/site-header";
import { UploadForm } from "@/components/upload-form";

export default function UploadPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
            Resume upload
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Analyze your resume against ATS and recruiter expectations
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Add a target job description for keyword matching and role-specific recommendations, or use demo mode for a polished walkthrough.
          </p>
        </div>
        <UploadForm />
      </main>
    </>
  );
}
