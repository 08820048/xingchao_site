import { useEffect, useState } from "react";
import { ArrowUpRight, GitCommitHorizontal } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

function UpdateCard({ update }: { update: ProjectUpdate }) {
  const category = kinds[update.kind];

  return (
    <a
      href={update.url}
      target="_blank"
      rel="noreferrer"
      className="group rounded-2xl outline-none transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="h-full transition-[box-shadow] duration-150 ease-out group-hover:shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant={category.variant}>{category.label}</Badge>
            <time className="tabular-nums text-xs text-muted-foreground" dateTime={update.date}>
              {dateFormatter.format(new Date(update.date))}
            </time>
          </div>
          <CardTitle className="text-pretty text-base leading-6">{update.title}</CardTitle>
        </CardHeader>
        <CardFooter className="mt-auto justify-between pt-0 text-xs text-muted-foreground">
          <code className="flex items-center gap-1.5"><GitCommitHorizontal className="size-3.5" />{update.sha}</code>
          <span className="flex items-center gap-1 text-foreground">查看提交 <ArrowUpRight className="size-3.5" /></span>
        </CardFooter>
      </Card>
    </a>
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
    <section id="updates" className="scroll-mt-24 border-y bg-muted/40 px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {updates.map((update) => <UpdateCard key={update.sha} update={update} />)}
        </div>
      </div>
    </section>
  );
}
