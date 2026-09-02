import { useEffect, useState } from "react";
import { ArrowUpRight, GitCommitHorizontal } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { parseGitHubCommits, projectUpdates, type ProjectUpdate, type UpdateKind } from "@/lib/github-updates";

const commitsUrl = "https://github.com/08820048/xingchao/commits/main";
const apiUrl = "https://api.github.com/repos/08820048/xingchao/commits?per_page=6";
const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "Asia/Shanghai",
});

const kinds: Record<UpdateKind, { label: string; variant: BadgeProps["variant"] }> = {
  feature: { label: "新功能", variant: "success" },
  fix: { label: "修复", variant: "error" },
  improvement: { label: "优化", variant: "info" },
  docs: { label: "文档", variant: "secondary" },
  maintenance: { label: "维护", variant: "outline" },
  update: { label: "更新", variant: "warning" },
};

function UpdateRow({ update }: { update: ProjectUpdate }) {
  const category = kinds[update.kind];

  return (
    <li className="relative grid gap-3 border-b py-6 pl-7 sm:grid-cols-[8rem_1fr_auto] sm:items-start sm:gap-6 sm:pl-8">
      <span className="absolute left-0 top-8 size-2.5 rounded-full bg-foreground ring-4 ring-background" aria-hidden="true" />
      <time className="tabular-nums text-sm text-muted-foreground" dateTime={update.date}>
        {dateFormatter.format(new Date(update.date))}
      </time>
      <div className="min-w-0">
        <Badge variant={category.variant}>{category.label}</Badge>
        <h2 className="mt-2 text-pretty text-base font-medium leading-7 sm:text-lg">{update.title}</h2>
      </div>
      <a
        href={update.url}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-10 items-center gap-1.5 self-center rounded-md text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`查看提交 ${update.sha}`}
      >
        <GitCommitHorizontal className="size-3.5" />
        <code>{update.sha}</code>
        <ArrowUpRight className="size-3.5" />
      </a>
    </li>
  );
}

export function ProjectUpdates() {
  const [updates, setUpdates] = useState(projectUpdates);

  useEffect(() => {
    const controller = new AbortController();

    fetch(apiUrl, { headers: { Accept: "application/vnd.github+json" }, signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`GitHub API ${response.status}`);
        return response.json() as Promise<unknown>;
      })
      .then((data) => {
        const parsed = parseGitHubCommits(data);
        if (parsed.length) setUpdates(parsed);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  return (
    <section id="updates" className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <Badge variant="outline">项目更新</Badge>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">每一次变化，都有迹可循。</h2>
            <p className="mt-3 text-pretty text-sm leading-6 text-muted-foreground">从 GitHub 实时读取最近提交，并按新功能、修复与优化自动归类。</p>
          </div>
          <Button render={<a href={commitsUrl} target="_blank" rel="noreferrer" />} variant="outline">
            查看全部更新 <ArrowUpRight />
          </Button>
        </div>

        <ol className="relative mt-10 border-t before:absolute before:bottom-0 before:left-[4px] before:top-0 before:w-px before:bg-border">
          {updates.map((update) => <UpdateRow key={update.sha} update={update} />)}
        </ol>
      </div>
    </section>
  );
}
