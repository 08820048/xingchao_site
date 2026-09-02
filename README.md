# 星潮官网 Xingchao Site

[xingchao.dev](https://xingchao.dev) 的源码：星潮（开源、自托管、懂分寸的 QQ 群助手）的官方网站。

独立于主仓库 [`xingchao`](https://github.com/08820048/xingchao) 维护；官网与管理面板共用机器人容器的 8080 端口，
由主项目的 Docker 多阶段构建在**构建时克隆本仓库**并编译，最终挂载到 `/`。
主仓库的 `web/` 目录只保留管理面板（挂载在 `/panel`）。

技术栈：Vite + React 19 + TypeScript + Tailwind CSS v4 + [coss ui](https://coss.com/ui/)（Base UI）。

## 本地开发

```bash
npm ci
npm run dev      # 开发服务器
npm run build    # 构建到 dist/
npm run preview  # 预览构建产物
```

## 部署

无需单独部署。在主仓库目录执行：

```bash
docker compose up -d --build
```

bot 镜像构建时会自动克隆本仓库 `main` 分支并编译，产物随 `xingchao-bot` 容器一起运行。

> 若本仓库设为私有，需在构建时提供可读权限（或改为 public）。也可用构建参数指向其他地址：
> `docker compose build --build-arg SITE_REPO_URL=https://github.com/you/xingchao_site.git`

## License

[Apache License 2.0](LICENSE)
