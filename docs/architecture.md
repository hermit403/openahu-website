# 架构说明

## 设计目标

OpenAHU Website 以静态优先、渐进增强和本地资源为核心：首屏应在没有客户端 JavaScript 时仍能阅读，交互能力只在需要时水合，Liquid Glass 保留材质与弹性，但不让框架覆盖内容层。

## 技术边界

| 技术                | 当前职责                                                        | 不承担的职责                   |
| ------------------- | --------------------------------------------------------------- | ------------------------------ |
| Astro 7             | 页面路由、布局、Content Collections、静态输出、View Transitions | 不把所有组件变成客户端应用     |
| React 19            | `LiquidContainer` 交互岛与第三方 React 玻璃组件                 | 不管理页面路由、内容和普通按钮 |
| Tailwind CSS 4      | 组件布局和局部视觉约束                                          | 不承载复杂运行时状态           |
| 原生 CSS            | 主题令牌、折射边缘、空间背景、可访问性降级                      | 不复制组件业务数据             |
| Anime.js 4          | 入场、导航滑块和弹性释放                                        | 不负责主题状态或页面数据       |
| Astro Content       | 项目与成员数据                                                  | 不把展示数据硬编码进组件       |
| Iconify Skill Icons | 构建期技术图标解析                                              | 不在浏览器中请求外部图标服务   |

这种分工已经落实在源码中：普通页面和卡片内容由 Astro 输出，Header 使用 `client:load`，项目与成员玻璃卡片使用 `client:visible`，其余组件保持零水合。

## 运行流程

```text
Markdown / Astro components
          ↓ build
静态 HTML + CSS + 本地字体/图标
          ↓ browser
Header 立即水合 ── 导航、主题、玻璃指针反馈
可见卡片水合 ── Liquid Glass 弹性与尺寸同步
Anime.js      ── 入场与路由指示器动画
```

首页与关于页通过 Astro Client Router 切换。Header 使用持久化过渡，导航指示器先完成玻璃滑动，再触发客户端导航；页面内容使用独立的 `page-content` View Transition。

## 资源策略

- Inter 与 Maple Mono 字体随构建或 `public/` 本地提供。
- 主页字标仅对 `OpenAHU` 使用 Maple Mono Bold Italic；其渐变通过 OKLab 计算浅色基色，并在深色模式统一增加感知明度。
- 技术栈图标在构建时从 `@iconify-json/skill-icons` 解析成独立 SVG Data URL，避免国内网络环境下的第三方 CDN 依赖和 SVG ID 冲突。
- 图片放在 `public/images/`，内容文件只保存稳定的站内绝对路径。
- `liquid-glass-react` 的重复 `feImage` ID 通过 pnpm patch 做最小修复，补丁保存在 `patches/`。

## 质量边界

- TypeScript 使用 Astro strict 配置。
- `pnpm verify` 串行执行 Astro 检查、ESLint 和生产构建。
- `prefers-reduced-motion` 会关闭非必要动画、噪声漂移和指针光效。
- 页面滚动条仅隐藏视觉轨道，不设置 `overflow: hidden`；滚轮、触控、键盘和程序化滚动继续可用。
- `dist/`、`.astro/` 与历史根目录构建产物均不属于源码。

## 当前审计结论

截至 2026-08-24，依赖均有直接用途，Astro 与 React 的边界合理，目录规模适合当前站点。维护复杂度主要集中在三个位置：

1. `src/styles/global.css` 同时包含令牌、主题、过渡、Liquid Glass 和 Markdown 样式，仍可阅读，但已是后续最适合按领域拆分的文件。
2. `src/components/ui/LiquidContainer.tsx` 需要兼容第三方玻璃组件的尺寸和指针状态，是必要但集中的交互复杂度。
3. `Card.astro`、`SocialLinks.astro` 与 `public/images/team/github.jpg` 当前没有被页面或内容引用；若近期没有使用计划，可以在独立清理提交中移除。此次文档更新不擅自删除预留文件。

卡片首次进入视口时，`client:visible` 水合和 Anime.js 入场可能在同一窗口触发；这解释了首次滚到卡片时的轻微卡顿。它不会在第二次进入时重复。后续优化应优先把水合提前到视觉动画之前，而不是削弱移动端 Liquid Glass。

## 扩展原则

- 新内容优先加入 Content Collections，而不是复制页面组件。
- 新交互优先保持为小型岛，不提升到全站 React 状态。
- 新动画统一走 Anime.js，并尊重 `prefers-reduced-motion`。
- 新技术图标只增加内容数据；只有图标集缺失时才扩展解析层。
- 只有在职责边界确实独立时才新增抽象，避免为了目录整齐制造一次性组件。
