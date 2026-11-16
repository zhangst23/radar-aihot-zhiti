# 部署到 Dokploy

Dokploy 用 Traefik 管域名和 HTTPS，本项目的 `docker-compose.yml` 同时保留两种运行方式：

| 方式 | 谁做反向代理 | `.env` 关键配置 |
|---|---|---|
| 本机 / VPS 直接用 Caddy | Caddy（`https` profile） | `COMPOSE_PROFILES=https`、`PORT=3000` |
| Dokploy | Dokploy 的 Traefik | `COMPOSE_PROFILES=`（留空）、`PORT=127.0.0.1:3010`（或其它空闲端口） |

两种方式都保留 `db`、`setup`、`api`、`worker`、`web` 五个服务；Caddy 服务也保留，只是 Dokploy 下不启动。数据库和 API 不发布端口。

## 1. 创建服务

1. Dokploy 里新建 Project（例如 `ingredient-radar`）和 Environment（`production`）。
2. **Create Service → Docker Compose**，不要选 Application 或 Docker Stack。
3. 连接仓库并选择分支；Compose Path 用仓库根目录的 `docker-compose.yml`。

Dokploy 会在项目目录写 `.env`，Compose 的 `env_file: .env` 和 `${变量}` 都从这里取值。

## 2. 环境变量

最少填这些（其余保持 `.env.example` 的默认值）：

```dotenv
SITE_URL=https://hot.example.com
TRUST_PROXY=true

# Dokploy 模式：不启动 Caddy；网页端口只监听本机，Traefik 从容器网络访问 3000
# 3000 被宿主机上别的项目占用时，换成空闲端口，例如 127.0.0.1:3010
COMPOSE_PROFILES=
PORT=127.0.0.1:3010

POSTGRES_PASSWORD=<32 位以上随机串>
ADMIN_PASSWORD=<至少 12 位>
SESSION_SECRET=<openssl rand -hex 32>
IMG_PROXY_SIGN_SECRET=<openssl rand -hex 32>

LLM_BASE_URL=https://api.deepseek.com/v1
LLM_API_KEY=<模型 Key>
LLM_MODEL=deepseek-flash
LLM_EXTRA_JSON={"thinking":{"type":"disabled"}}

# 首次部署建议先关着，确认站点和数据库正常后再开
COLLECT_ENABLED=false
MODEL_CALLS_ENABLED=false
```

几个容易出错的点：

- `COMPOSE_PROFILES` 必须是空值。如果写成 `https`，Caddy 会抢占 80/443，和 Dokploy 的 Traefik 冲突。
- `PORT=127.0.0.1:3010`（或其它空闲端口） 仍然保留端口映射，但只绑定本机；Dokploy 的 Traefik 通过 Compose 网络访问 `web:3000`，不依赖这个发布端口。
- 站点在 HTTPS 后面，`SITE_URL` 必须写 `https://`，`TRUST_PROXY=true`，否则后台登录 cookie 和限流取到的客户端地址会不对。
- 安全阀（`COLLECT_ENABLED`、`MODEL_CALLS_ENABLED`、`FEISHU_*`、`INDEXNOW_*`、`BAIDU_PUSH_*`）只有写成 `true` 才打开。

## 3. 配置域名

部署成功后，在 Dokploy 的 Compose 服务里添加 Domain：

- Service：`web`
- Container Port：`3000`
- Domain：`hot.example.com`
- HTTPS：开启，证书用 Let's Encrypt

Dokploy 会把 Traefik 的 labels 和网络接到 `web` 上。不要同时在 compose 里再手写一套相同 Host 的 Traefik labels，两个 router 抢同一个域名会报错。

Cloudflare 先把记录设为 **DNS only**，等 Dokploy 签发证书、站点能打开后，再按需要打开橙色云朵；SSL/TLS 模式用 **Full (strict)**。API 和 RSS 不要套缓存规则，页面本身已经带 `Cache-Control`。

## 4. 首次部署检查

| 检查项 | 预期 |
|---|---|
| `db` | Healthy |
| `setup` | 跑完迁移和种子后退出（退出码 0） |
| `api` | Running |
| `worker` | Running |
| `web` | Running |
| 首页 | 能打开，标题是站名 |
| `/admin` | 能用 `ADMIN_PASSWORD` 登录 |
| `/api/health` | 返回 JSON |
| `/api/site/events` | 返回展会日历 |
| Worker 日志 | 没有反复重启或数据库连接错误 |

`setup` 每次部署都会重跑迁移和种子；已有数据不会被覆盖。

## 5. 数据与备份

Compose 用了三个命名卷：

- `db`：PostgreSQL 数据
- `data`：站点数据目录（图片、缓存、本地备份等）
- `caddy`：Caddy 证书（Dokploy 模式下不使用）

重新部署不会删命名卷，但 `docker compose down -v` 会。Dokploy 里不要执行带 `-v` 的 down。

数据库每天自动备份到 S3 兼容存储（Cloudflare R2、AWS S3、腾讯云 COS 等），在 `.env` 里配置：

```dotenv
DB_BACKUP_STORE_SECRET_ID=<R2 Access Key ID>
DB_BACKUP_STORE_SECRET_KEY=<R2 Secret Access Key>
DB_BACKUP_STORE_BUCKET=ingredient-radar-backup
DB_BACKUP_STORE_REGION=auto
DB_BACKUP_STORE_DOMAIN=<account>.r2.cloudflarestorage.com
```

备份任务在 worker 的 `ops.backup` 定时任务里；worker 的停止宽限是 515 秒，Dokploy 的停止超时不要改得比它短。

## 6. 资源和端口

- 最低 2 核 4 GB；Dokploy 与站点同机时建议 4 核 8 GB 起。
- 不发布 `5432`（数据库）和 `3001`（API）；Compose 里本来就没有这两个端口的映射，不要为了调试加到公网。
- 需要临时连数据库时用 Dokploy 的终端或 SSH 隧道，不要加 `ports`。

## 7. 与 Caddy 模式互相切换

- 切回 Caddy：`.env` 改 `COMPOSE_PROFILES=https`、`PORT=3000`，重新部署，并在 Dokploy 里停用该域名的 Traefik 路由（或直接改用非 Dokploy 的机器）。
- 切到 Dokploy：`.env` 改 `COMPOSE_PROFILES=`、`PORT=127.0.0.1:3010`（或其它空闲端口），重新部署。

Caddy 的服务定义、`profiles` 和网页端口映射都保留在 `docker-compose.yml` 里，不需要删。

## 8. 常见错误

- **`failed to bind host port for 127.0.0.1:3000 ... address already in use`**：宿主机 3000 已被别的项目占用（Dokploy 的项目列表里能看到）。把 `.env` 的 `PORT` 换成另一个空闲端口，例如 `127.0.0.1:3010`，重新部署。容器内端口和 Dokploy 域名配置仍是 3000，不需要改。
- **域名 502**：先确认 `web` 容器是 Running；再确认 Dokploy 的 Domain 指向 `web` 的 3000 端口；如果 Dokploy 没自动接入网络，把 `web` 服务加入 `dokploy-network`。
- **`setup` 退出但 api/worker 没起来**：看 `setup` 的日志，通常是数据库密码或迁移失败；`setup` 必须以 0 退出，后面的服务才会启动。
