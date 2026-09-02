import assert from "node:assert/strict";

import { classifyCommit, parseGitHubCommits, projectUpdates } from "../src/lib/github-updates.ts";

assert.deepEqual(classifyCommit("feat(panel): 新增模型列表"), { kind: "feature", title: "新增模型列表" });
assert.deepEqual(classifyCommit("fix: 修复敏感词导入"), { kind: "fix", title: "修复敏感词导入" });
assert.deepEqual(classifyCommit("refactor: 拆分官网"), { kind: "improvement", title: "拆分官网" });
assert.equal(projectUpdates.length, 6);
assert.equal(new Set(projectUpdates.map(({ sha }) => sha)).size, projectUpdates.length);
assert.equal(parseGitHubCommits({ invalid: true }).length, 0);
