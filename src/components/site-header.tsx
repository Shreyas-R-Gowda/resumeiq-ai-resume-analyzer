import Link from "next/link";
import { FileSearch2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-9 place-items-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <FileSearch2 className="size-5" />
          </span>
          <span>ResumeIQ</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button size="sm" asChild>
            <Link href="/upload">Analyze resume</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
