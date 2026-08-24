# 部署到自有服务器

仓库通过 GitHub Actions 将 Astro 静态产物部署到自有 Linux 服务器。工作流位于 `.github/workflows/deploy.yml`，在推送到 `main` 或手动触发时运行。

## 发布流程

```text
pnpm install --frozen-lockfile
        ↓
pnpm verify
        ↓
打包 dist/
        ↓ SCP
服务器 releases/<commit>-<attempt>/
        ↓ atomic switch
DEPLOY_PATH → 新 release
```

每次部署创建不可变 release，文件全部解压后才切换站点软链接。构建、上传或解压失败不会覆盖当前线上版本。同一次 workflow 的重试通过 `GITHUB_RUN_ATTEMPT` 获得不同目录。

切换前会确认首页与关于页产物存在；切换后会从公网请求这两个路由。任一路由不可访问时，工作流会失败并保留日志供排查。

## GitHub Environment

在仓库的 **Settings → Environments** 中创建 `production`，并配置：

| 类型     | 名称                 | 说明                                            |
| -------- | -------------------- | ----------------------------------------------- |
| Secret   | `DEPLOY_HOST`        | 服务器域名或 IP                                 |
| Secret   | `DEPLOY_PORT`        | SSH 端口，例如 `22`                             |
| Secret   | `DEPLOY_USER`        | 仅拥有站点目录权限的部署用户                    |
| Secret   | `DEPLOY_SSH_KEY`     | 专用 Ed25519 私钥                               |
| Secret   | `DEPLOY_KNOWN_HOSTS` | 经可信渠道核验的服务器 host key                 |
| Variable | `DEPLOY_PATH`        | 当前版本软链接，例如 `/var/www/openahu/current` |

可以为 `production` 增加 required reviewers，避免未经确认的生产部署。

## 服务器要求

- Nginx、Caddy 或 Apache 的站点根目录指向 `DEPLOY_PATH`。
- 部署用户可以写入 `DEPLOY_PATH` 的父目录。
- 第一次部署时 `DEPLOY_PATH` 必须不存在；后续必须是工作流创建的符号链接。
- 服务器提供 `bash`、`tar`、`ssh` 及支持 `mv -T` 的 GNU coreutils。
- `DEPLOY_PATH` 不得为 `/`。

Release 保存在 `DEPLOY_PATH` 同级的 `releases/` 目录。当前工作流不会自动清理旧版本，应按服务器容量单独制定保留策略。

## SSH 安全

工作流启用 `BatchMode=yes` 与 `StrictHostKeyChecking=yes`，不会在运行时盲目信任 `ssh-keyscan`。请在可信网络中生成并人工核对 host key：

```bash
ssh-keyscan -p 22 example.com
```

将核对后的完整输出保存到 `DEPLOY_KNOWN_HOSTS`。不要把私钥、服务器地址或 host key 直接写进 workflow。

## 首次部署检查

1. 在服务器创建最小权限部署用户。
2. 创建站点父目录并授予部署用户写权限。
3. 确认 `DEPLOY_PATH` 尚不存在。
4. 配置 Web 服务器指向 `DEPLOY_PATH`。
5. 配置 `production` Environment 的 Secrets 和 Variable。
6. 手动运行 `Deploy to production server` 工作流。
7. 确认 `DEPLOY_PATH` 指向新 release，并访问站点。

## 回滚

回滚不需要重新构建：从同级 `releases/` 选择一个已验证版本，将 `DEPLOY_PATH` 原子切换回该目录即可。操作前应先读取当前软链接目标并保留记录；不要删除当前或目标 release。完成后验证首页、关于页和项目详情页，再决定是否清理失败版本。
