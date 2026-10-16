# OpenAHU

OpenAHU 官方网站

[![Tech Stack](https://skillicons.dev/icons?i=astro,react,ts,tailwind,vite,pnpm&theme=light)](https://skillicons.dev)

## Development

需要 Node.js `>=22.12.0` 与 pnpm `11.23.0`。

```bash
pnpm install
pnpm dev
```

提交前运行完整校验：

```bash
pnpm verify
```

## Add new content

- 团队成员：复制 `src/content/team/_template.md`，填写内容并设置 `published: true`。
- 项目：在 `src/content/projects/` 中新增 Markdown；技术图标由名称在构建期生成。

## 安大通安装与体验页面

- `/projects/ahutong/`：项目介绍、Android 下载与 iOS 入口。
- `/projects/ahutong/ios/`：Sideloadly 自签教程。
- `/waitlist/`：团队签名体验意向页。
- `/projects/ahutong/changelog/`：近期 Android 版本与 iOS 修复预览。

复制 `.env.example` 为 `.env`，按需配置 `PUBLIC_IOS_WAITLIST_FORM_URL`（外部收集表）和 `PUBLIC_AHUTONG_IOS_IPA_URL`（公开 IPA 下载地址）。两项均只接受 HTTPS；它们会进入公开页面，不应包含私密下载令牌。未配置时，申请按钮禁用且标注“即将开放”，IPA 入口引导到体验计划，不生成虚假下载或表单链接。

生产环境在 GitHub `production` Environment 中设置同名 Variables，再重新部署。版本摘要维护在 `src/data/ahutong-releases.ts`，每条记录保留版本来源；iOS 未合并改动应保持预览标记。历史 Android 日志仍在项目 Markdown 中。

## Docs

- [架构说明](docs/architecture.md)
- [服务器部署](docs/deployment.md)

提交信息请遵循 [Conventional Commits](https://www.conventionalcommits.org/)，如 `feat(site): refine liquid glass experience`。

## License

[GPL-3.0 license](LICENSE)
