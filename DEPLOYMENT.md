# Cloudflare Pages 部署

本站使用 Cloudflare Pages 的 **Direct Upload** 模式，不会在 Git push 后自动部署。

- Pages 项目：`xingchao`
- 生产分支：`main`
- 正式域名：<https://xingchao.dev>
- Pages 域名：<https://xingchao-e7u.pages.dev>
- Node.js：22（见 `.nvmrc`）

## 快速部署

在仓库根目录执行：

```bash
git pull --ff-only origin main
npx wrangler whoami
npm ci
npm run build
npx wrangler pages deploy dist --project-name=xingchao --branch=main
```

首次使用或 `wrangler whoami` 显示未登录时，先执行：

```bash
npx wrangler login
```

浏览器完成 Cloudflare 授权后，再重新运行快速部署命令。

## 验证

```bash
npx wrangler pages deployment list --project-name=xingchao
curl -I https://xingchao.dev
```

部署列表中最新一条应为 `Production / main`，`Source` 应与本次提交一致；正式域名应返回 `HTTP 200`。

Cloudflare 控制台路径：**Workers & Pages → xingchao → Deployments**。

## 注意

- 部署前先提交并推送代码，确保部署记录能关联正确的 Git commit。
- 只上传 `npm run build` 生成的 `dist/`，不要上传源码目录。
- 当前项目显示 `Git Provider: No` 是正常状态；发布必须手动执行 Wrangler 命令。
