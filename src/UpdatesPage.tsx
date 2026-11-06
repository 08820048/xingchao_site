import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { Mark } from "@/components/Mark";
import { ProjectUpdates } from "@/components/ProjectUpdates";

const github = "https://github.com/08820048/xingchao";

export default function UpdatesPage() {
  return (
    <div className="min-h-screen bg-ink text-pearl">
      <header className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 sm:px-10">
        <a href="/" aria-label="返回星潮首页" className="group flex items-center gap-2.5">
          <Mark className="size-6 text-tide transition-transform duration-500 group-hover:rotate-[18deg]" />
          <span className="font-serif text-lg font-semibold tracking-tight">星潮</span>
        </a>
        <div className="flex items-center gap-6 text-sm text-mist">
          <a href="/" className="link-sweep inline-flex items-center gap-1.5 hover:text-pearl">
            <ArrowLeft className="size-4" /> 首页
          </a>
          <a href={github} target="_blank" rel="noreferrer" className="link-sweep inline-flex items-center gap-1.5 hover:text-pearl">
            GitHub <ArrowUpRight className="size-4" />
          </a>
        </div>
      </header>

      <main>
        <ProjectUpdates />
      </main>

      <footer className="border-t border-line px-6 py-8 text-center text-xs text-mist sm:px-10">
        © 2026 Xingchao · Apache-2.0
      </footer>
    </div>
  );
}
