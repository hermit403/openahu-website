# OpenAHU-Website

OpenAHU 的官方展示网站

![Tech Stack](https://skillicons.dev/icons?i=pnpm,typescript,astro,vite,react,tailwindcss)

## 项目结构

```
openahu-website/
├── public/                 # 静态资源
│   └── favicon.svg
├── src/
│   ├── assets/styles/      # 全局样式
│   ├── components/        # 组件
│   │   ├── ui/           # UI 组件
│   │   ├── layout/       # 布局组件
│   │   ├── sections/     # 页面区块组件
│   │   └── common/      # 通用组件
│   ├── content/         # 内容集合
│   │   ├── team/          # 团队成员数据
│   │   └── projects/      # 项目数据
│   ├── layouts/         # 页面布局
│   └── pages/           # 页面
├── astro.config.mjs     # Astro 配置
├── tsconfig.json        # TypeScript 配置
├── package.json        # 项目依赖
└── README.md           # 项目说明
```

## Quickstart

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

## 添加内容

### 添加团队成员

在 `src/content/team/` 目录下创建新的 Markdown 文件：

```markdown
---
name: "Name"
desc: "成员描述"
avatar: "/images/team/new-member.jpg"
website: "https://example.com"
github: "github-username"
---
```

### 添加项目

在 `src/content/projects/` 目录下创建新的 Markdown 文件：

```markdown
---
title: "项目名称"
slug: "project-slug"
desc: "项目描述"
screenshots:
  - "/images/projects/screenshot1.jpg"
techstack:
  - "技术1"
  - "技术2"
links:
  - name: "GitHub"
    url: "https://github.com/..."
---
```
