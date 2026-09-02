export type UpdateKind = "feature" | "fix" | "improvement" | "docs" | "maintenance" | "update";

export type ProjectUpdate = {
  sha: string;
  title: string;
  date: string;
  url: string;
  kind: UpdateKind;
};

export const projectUpdates: ProjectUpdate[] = [
  { sha: "63b8fbe", title: "官网独立部署至 Cloudflare Pages，Bot 镜像不再包含官网", date: "2026-09-02T04:12:10Z", url: "https://github.com/08820048/xingchao/commit/63b8fbe57de5135a61b5b8cfd3bffe851dd4a046", kind: "improvement" },
  { sha: "481c7b9", title: "官网拆分至独立仓库，Web 目录仅保留管理面板", date: "2026-09-02T04:02:36Z", url: "https://github.com/08820048/xingchao/commit/481c7b9b43ba32b01f16b2aee202d05855d88662", kind: "improvement" },
  { sha: "7702f58", title: "官网新增聊天演示、架构图、环境变量示例与数据概览", date: "2026-09-02T03:42:20Z", url: "https://github.com/08820048/xingchao/commit/7702f581a731c86780b4b9c98c68f73dc17543fe", kind: "feature" },
  { sha: "eefa9d8", title: "部署文档补充实战排查与常见问题", date: "2026-09-02T03:13:49Z", url: "https://github.com/08820048/xingchao/commit/eefa9d8f7745cfca78d0dc0174651be40fbdb168", kind: "docs" },
  { sha: "b43f95d", title: "AI 页面新增获取模型列表与下拉选择", date: "2026-09-02T02:39:34Z", url: "https://github.com/08820048/xingchao/commit/b43f95d60425a8135e4bf62b3f91d391ef477978", kind: "feature" },
  { sha: "73354a8", title: "修复敏感词插件导入与 AI 环境变量配置", date: "2026-09-02T01:56:05Z", url: "https://github.com/08820048/xingchao/commit/73354a8cb7b71e04c1847c15097b7eebea275f5b", kind: "fix" },
];

const kinds: Record<string, UpdateKind> = {
  feat: "feature",
  fix: "fix",
  perf: "improvement",
  refactor: "improvement",
  docs: "docs",
  build: "maintenance",
  chore: "maintenance",
  ci: "maintenance",
  test: "maintenance",
};

export function classifyCommit(subject: string) {
  const match = subject.match(/^([a-z]+)(?:\([^)]*\))?!?:\s*(.+)$/i);
  return {
    kind: match ? (kinds[match[1].toLowerCase()] ?? "update") : "update",
    title: match?.[2] ?? subject,
  };
}

export function parseGitHubCommits(value: unknown): ProjectUpdate[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const commit = record.commit;
    if (!commit || typeof commit !== "object") return [];
    const details = commit as Record<string, unknown>;
    const author = details.author;
    const sha = record.sha;
    const message = details.message;
    const date = author && typeof author === "object" ? (author as Record<string, unknown>).date : null;
    const url = record.html_url;

    if ([sha, message, date, url].some((field) => typeof field !== "string")) return [];
    if (!(url as string).startsWith("https://github.com/08820048/xingchao/commit/")) return [];

    const subject = (message as string).split("\n", 1)[0].trim();
    if (!subject || Number.isNaN(Date.parse(date as string))) return [];

    return [{
      sha: (sha as string).slice(0, 7),
      date: date as string,
      url: url as string,
      ...classifyCommit(subject),
    }];
  });
}
