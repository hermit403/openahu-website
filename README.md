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

## Docs

- [架构说明](docs/architecture.md)
- [服务器部署](docs/deployment.md)

提交信息请遵循 [Conventional Commits](https://www.conventionalcommits.org/)，如 `feat(site): refine liquid glass experience`。

## License

[GPL-3.0 license](LICENSE)
