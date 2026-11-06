import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { Mark } from "@/components/Mark";
import { ProjectUpdates } from "@/components/ProjectUpdates";
import { github } from "@/lib/story";

export default function UpdatesPage() {
  return (
    <div className="appendix min-h-screen">
      <header className="shell flex h-16 items-center justify-between">
        <a href="/" aria-label="返回星潮首页" className="group flex items-center gap-2.5">
          <Mark className="size-6 text-lantern transition-transform duration-500 group-hover:rotate-[18deg]" />
          <span className="font-serif text-lg font-extrabold tracking-tight">星潮</span>
        </a>
        <div className="flex items-center gap-6 text-sm text-leaf/70">
          <a href="/" className="link-sweep inline-flex items-center gap-1.5 hover:text-leaf">
            <ArrowLeft className="size-4" /> 首页
          </a>
          <a href={github} target="_blank" rel="noreferrer" className="link-sweep inline-flex items-center gap-1.5 hover:text-leaf">
            GitHub <ArrowUpRight className="size-4" />
          </a>
        </div>
      </header>

      <main>
        <ProjectUpdates />
      </main>

      <footer className="border-t border-leaf/20 py-8 text-center text-xs text-leaf/65">© 2026 Xingchao · Apache-2.0</footer>
    </div>
  );
}
