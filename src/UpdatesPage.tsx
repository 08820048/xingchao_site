import { ArrowLeft, GitFork } from "lucide-react";

import character from "@/assets/brand/xingchao-anime-character-full.jpg";
import { Button } from "@/components/ui/button";
import { ProjectUpdates } from "@/components/ProjectUpdates";

const github = "https://github.com/08820048/xingchao";

export default function UpdatesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/90 px-5 py-3 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a href="/" aria-label="返回星潮首页" className="flex min-h-10 items-center gap-2.5 rounded-full pr-3 outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="size-9 overflow-hidden rounded-full shadow-sm outline outline-1 -outline-offset-1 outline-black/10">
              <img src={character} alt="" className="size-full scale-150 object-cover object-center" />
            </span>
            <span className="text-sm font-semibold tracking-tight">星潮</span>
          </a>
          <div className="flex items-center gap-2">
            <Button render={<a href="/" />} variant="ghost"><ArrowLeft /> 返回首页</Button>
            <Button render={<a href={github} target="_blank" rel="noreferrer" />} variant="outline"><GitFork /> GitHub</Button>
          </div>
        </div>
      </header>

      <main>
        <ProjectUpdates />
      </main>

      <footer className="border-t px-5 py-8 text-center text-xs text-muted-foreground sm:px-8">
        © 2026 Xingchao · Apache-2.0
      </footer>
    </div>
  );
}
