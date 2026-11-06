import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { parseGitHubCommits, projectUpdates, type ProjectUpdate, type UpdateKind } from "@/lib/github-updates";

const commitsUrl = "https://github.com/08820048/xingchao/commits/main";
const apiUrl = "https://api.github.com/repos/08820048/xingchao/commits?per_page=12";
const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Shanghai",
});

const kinds: Record<UpdateKind, { label: string; accent: boolean }> = {
  feature: { label: "新功能", accent: true },
  fix: { label: "修复", accent: false },
  improvement: { label: "优化", accent: false },
  docs: { label: "文档", accent: false },
  maintenance: { label: "维护", accent: false },
  update: { label: "更新", accent: false },
};

function UpdateRow({ update }: { update: ProjectUpdate }) {
  const category = kinds[update.kind];

  return (
    <li className="index-row grid gap-x-8 gap-y-1.5 border-b border-line py-6 md:grid-cols-[9rem_6rem_1fr_auto] md:items-baseline">
      <time className="font-mono text-xs tabular-nums text-mist" dateTime={update.date}>
        {dateFormatter.format(new Date(update.date)).replaceAll("/", ".")}
      </time>
      <span className={`font-mono text-xs ${category.accent ? "text-tide" : "text-mist"}`}>{category.label}</span>
      <h2 className="index-name text-pretty font-serif text-lg font-semibold leading-8 tracking-tight">{update.title}</h2>
      <a
        href={update.url}
        target="_blank"
        rel="noreferrer"
        className="link-sweep inline-flex w-fit items-center gap-1 font-mono text-xs text-mist hover:text-pearl"
        aria-label={`查看提交 ${update.sha}`}
      >
        {update.sha}
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
    <section id="updates" className="pb-28 pt-20 lg:pt-32">
      <div className="shell">
        <p className="label">更新</p>
        <h1 className="display mt-6 text-[clamp(2.8rem,8vw,6.5rem)]">每一次变化，都有迹可循。</h1>
        <p className="prose-quiet mt-6 max-w-xl text-base">
          直接读取 GitHub 上最近的提交，按新功能、修复与优化归类。
        </p>

        <ol className="mt-16 border-t border-line">
          {updates.map((update) => <UpdateRow key={update.sha} update={update} />)}
        </ol>

        <a
          href={commitsUrl}
          target="_blank"
          rel="noreferrer"
          className="link-sweep mt-10 inline-flex items-center gap-1.5 text-[15px]"
        >
          查看全部提交 <ArrowUpRight className="size-4" />
        </a>
      </div>
    </section>
  );
}
