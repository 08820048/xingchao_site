# 星潮官网 Xingchao Site

[xingchao.dev](https://xingchao.dev) 的源码：星潮（开源、自托管、懂分寸的 QQ 群助手）的官方网站，纯静态展示站。

- 独立仓库，独立部署（Cloudflare Pages），与机器人项目无关
- 机器人项目在 [`xingchao`](https://github.com/08820048/xingchao)（管理面板由 bot 容器提供，地址 `panel.xingchao.dev`）
- 技术栈：Vite + React 19 + TypeScript + Tailwind CSS v4 + [coss ui](https://coss.com/ui/)（Base UI）

## 本地开发

```bash
npm ci
npm run dev      # 开发服务器
npm run build    # 构建到 dist/
npm run preview  # 预览构建产物
```

## 部署（Cloudflare Pages）

当前 `xingchao` Pages 项目使用 Direct Upload，不会随 Git push 自动部署：

```bash
npm ci && npm run build
npx wrangler pages deploy dist --project-name=xingchao --branch=main
```

完整步骤与验证方式见 [DEPLOYMENT.md](DEPLOYMENT.md)。

## License

[Apache License 2.0](LICENSE)
