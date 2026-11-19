<p align="center">
  <img src="site/brand/logo.svg" width="72" alt="全球原料雷达">
</p>

<h1 align="center">全球原料雷达</h1>

<p align="center">
  <b>盯住全球原料、食品添加剂、API 与化妆品原料的公开信源，<br>挑出影响采购、配方和合规的动态，每天出一份原料日报。</b>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-176b75?style=flat-square" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Node.js-24-176b75?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js 24">
  <img src="https://img.shields.io/badge/PostgreSQL-17-176b75?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL 17">
  <img src="https://img.shields.io/badge/Docker-Compose-176b75?style=flat-square&logo=docker&logoColor=white" alt="Docker Compose">
</p>

<p align="center">
  <a href="#跑起来">跑起来</a> ·
  <a href="#它是怎么工作的">它是怎么工作的</a> ·
  <a href="#站点内容">站点内容</a> ·
  <a href="#配置">配置</a> ·
  <a href="#文档">文档</a>
</p>

<br>

## 这是什么

全球原料雷达是一个面向原料行业的 B2B 情报站：采集全球监管机构、原料企业和行业媒体的公开信源，用模型判断一条消息对采购、配方和合规有没有用；把不同来源报道的同一件事归成一个事件，按参与报道的独立来源排出热点；每天 08:00 出一份原料日报，周一和每月 1 日汇编周报、月报。

站点对外提供网页、RSS、公开 API、MCP 和 Agent Markdown；读者匿名访问，不需要注册。后台只允许管理员登录。

## 站点内容

### 12 个一级分类，9 个日报分节

| 分类 | 内容 |
|---|---|
| 法规监管 | 新食品原料、化妆品原料、药用辅料与食品添加剂的批准、限量、禁限用和安全通报 |
| 研究与临床 | 临床、功效、安全性与检测方法的新研究 |
| 天然与植物原料 | 植物提取物、中药材、天然色素与甜味剂、精油 |
| 香料香精 | 香辛料、精油、天然与合成香料、香精配方 |
| 食品添加剂 | 防腐、抗氧化、乳化、增稠、甜味、酶制剂 |
| 功能成分与营养 | 蛋白与肽、益生菌、纤维、维生素、Omega-3 |
| 化妆品原料 | 美白、抗衰、防晒、保湿等活性成分与 INCI 新原料 |
| 原料药与医药 | 原料药、中间体、药用辅料、CDMO、GMP/DMF/CEP |
| 生物制造与创新 | 合成生物、精准发酵、替代蛋白、新型原料 |
| 供应链与贸易 | 价格、产地、产能、关税、物流与可持续采购 |
| 企业与市场 | 并购、融资、合作、财报、扩产与经营风险 |
| 展会与活动 | 全球原料与配料展会、会议与现场发布 |

日报按 9 个分节排版：法规与科学 / 研究与临床 / 天然与草本 / 食品与营养 / 化妆品原料 / 原料药与医药 / 生物制造 / 市场与供应链 / 展会与活动。

### 主题与二级分类

- 31 个主题页：12 家原料企业（ADM、Cargill、DSM-Firmenich、Givaudan、IFF、Symrise、BASF、Croda、Lonza、Kerry、Indena、Sabinsa）、11 个原料品类、8 种内容形态。
- 品类目录 `/categories`，每个一级分类下有若干二级入口，例如 `/category/natural/botanical-extracts`、`/category/functional/probiotics`。
- 二级页只在该分类下有实际报道时允许索引、才在目录里给链接；空页面不索引，也不进 sitemap。

### 首页模块

首页除了精选信息流，还展示：

- 全球原料脉搏：今日更新、近 7 天、法规动向、供应风险、原料发布、即将开展
- 重大行业新闻：标题、摘要、分类、原料标签、公司标签、来源、评分与重要性
- 法规雷达、供应链观察、创新雷达、企业动态、热门原料
- 展会日历：最近 4 场

所有数字都来自已收录的公开报道；没有数据时显示空态，不用示例数字填充。

### 展会日历

`/events` 是已核实的国际原料展会日历，可以按月份、国家、行业和状态筛选，页面带 schema.org `Event` 结构化数据。

目前收录 15 场（2026-11-16 核对）：Fi Europe、CPHI India、PMEC India、Pharmapack Europe、Natural Products Expo West、in-cosmetics Global / Korea / Latin America / Asia、CPHI Japan / Middle East / Americas / China、Hi & Fi Asia-China、Fi Asia Thailand。

日期、城市和场馆来自主办方页面；没有核实到确切日期的展会不写入。日历在后台“专题 · 展会”里维护（首次启动按 `industry/events.json` 导入），新增前先核对官网。

### 信源

`industry/sources.json` 带 16 个 RSS 示范信源：

- 监管机构：EFSA News、EFSA Publications
- 原料企业：Givaudan、Indena、Sabinsa、BENEO
- 行业媒体：Food Dive、Just Food、Nutritional Outlook、Perfumer & Flavorist、GCI Magazine、Pharmaceutical Technology、BioPharm International、PharmaTimes、BioPharma Dive、New Hope Network

2026-11-16 从开发机实测：16 个 feed 都能访问；15 个有可用条目，Sabinsa 返回合法空 feed。企业官网历史条目可能夹带旧闻，采集端有时间窗和首次回填上限。

信源只是配置，不代表已经采集。首次部署时 `COLLECT_ENABLED=false`，确认站点正常后再打开。

## 它是怎么工作的

一条资料从信源进来，先判重、再预筛；可能重要的独立打两次分，写好中文标题、摘要和关注理由；结构抽取给出分类、标签、主体和事实；同一件事的多篇报道归成一个事件，算进热度。分数过了门槛、又不是已有新闻的重复，才进精选；日报按规则编出当天要闻，周报、月报再从日报汇编。

- **评分**：7 种内容类型（法规、供应、企业动作、原料发布、研究、展会、市场分析），5 个维度（实质份量、信息增量、证据强度、共振面、可用性）加权成 0–100。T1 / T1_5 / T2 门槛分别是 60 / 65 / 76，监管机构和企业官方发布另有门槛下限。
- **行业判断**：什么算重要、什么是噪声写在 `industry/prompts/selection-score.md`；分类边界写在 `structure.md`。改标准不用改代码。
- **防张冠李戴**：标题和摘要里出现的公司必须在原文里出现过，否则退回原题；身份词典在 `industry/taxonomy.ts`。
- **归组与热点**：同一事实归成一个事件，代表稿按信源权威、全文、分数和时间选；热度按独立来源计数，重复转载不多算。
- **安全边界**：材料里的提示词和指令一律视为不可信输入，不执行。

每一步的提示词都在 [`industry/prompts/`](industry/prompts/)，入选门槛在 [`industry/selection.ts`](industry/selection.ts)。详见 [精选与校准](docs/selection.md)。

## 跑起来

需要 Docker、Node.js 24（生成配置用），以及一个 OpenAI 兼容的模型 API Key。默认按 DeepSeek 配置；换服务商时改 `.env` 的 `LLM_BASE_URL`、`LLM_MODEL` 和 `LLM_EXTRA_JSON`。

```bash
git clone https://github.com/zhangst23/radar-aihot-zhiti.git
cd radar-aihot-zhiti
node scripts/init-env.ts --llm-key <你的模型 API Key>
docker compose up -d --build
```

打开 <http://localhost:3000>，后台在 `/admin`，密码是 `.env` 里的 `ADMIN_PASSWORD`。

首次部署的安全阀默认关闭：

```dotenv
COLLECT_ENABLED=false
MODEL_CALLS_ENABLED=false
```

确认首页、后台和数据库都正常后，再把它们改成 `true` 并重启 worker。第一次导入会处理一批历史条目，模型费用取决于信源数量和回填上限。

### 部署到 Dokploy

项目同时保留两种部署方式，用 `.env` 切换，不需要删 Caddy 或端口映射：

- **本机 / VPS 用 Caddy**：`COMPOSE_PROFILES=https`、`PORT=3000`
- **Dokploy（Traefik 管域名和 HTTPS）**：`COMPOSE_PROFILES=` 留空、`PORT=127.0.0.1:3010`（换成宿主机上空闲的端口；容器内仍是 3000）

完整步骤见 [部署到 Dokploy](docs/deploy-dokploy.md)；Docker、域名、HTTPS、备份和直接跑 Node 见 [部署](docs/deploy.md)。

## 配置

配置都在 `.env`，不要提交到 Git。

| 变量 | 作用 |
|---|---|
| `SITE_URL` | 站点对外地址，生成的链接、RSS、分享图、MCP 都用它 |
| `ADMIN_PASSWORD` | 后台登录密码，至少 12 位 |
| `SESSION_SECRET`、`IMG_PROXY_SIGN_SECRET` | 会话与图片代理签名密钥，各填随机串 |
| `POSTGRES_PASSWORD` | Compose 里 PostgreSQL 的密码 |
| `LLM_BASE_URL`、`LLM_API_KEY`、`LLM_MODEL` | 模型接口；OpenAI 兼容即可 |
| `TRUST_PROXY` | 在 Caddy、Nginx、Dokploy Traefik 后面设为 `true` |
| `PORT` | 网页发布地址；反向代理后面用 `127.0.0.1:3000` |
| `COMPOSE_PROFILES` | 本机 Caddy 用 `https`，Dokploy 留空 |
| `INGEST_RATE_LIMIT` | 外部推送接口的限流，默认 10 次/分钟 |
| `COLLECT_ENABLED`、`MODEL_CALLS_ENABLED` | 采集和模型调用的总开关，默认关闭 |

模型调用经过回执和预算熔断；预算在后台“设置”里按服务配置，任何一项为 0 就停用该服务。

## 数据与真实性

- 价格、产能、日期、展会地点这类数字只展示原文写明的，不补全、不推算。
- 展会日期必须来自主办方页面；无法核实的活动不写进日历。
- 没有收录到内容时，首页和分类页显示空态，不生成示例数据。
- 信源展示默认只给摘要和原文链接（`site_fulltext` 关闭），来源明确允许时才打开全文。

## 测试

```bash
npm run typecheck
DATABASE_URL=postgres://127.0.0.1:5432/radar_test npm test
npm run build -w @aihot/web && npm run test:web
node scripts/smoke.ts --base http://localhost:3000
```

`npm test` 需要一个可建库的 PostgreSQL 账号，数据库名以 `_test` 或 `_ci` 结尾。浏览器测试需要先 `npx playwright install chromium webkit`。

## 目录

| 路径 | 内容 |
|---|---|
| `site/` | 站名、文案、每一步的模型、品牌图、条款模板、更新日志 |
| `industry/` | 分类、标签、主题、信源、提示词、门槛、展会日历、示例金标 |
| `apps/api` | Fastify 接口 |
| `apps/worker` | 采集、模型处理、归组、报告、备份等后台任务 |
| `apps/web` | React Router 服务端渲染的网站 |
| `packages/backend` | 公开读取层、发布、报告、任务、模型调用 |
| `packages/contracts` | 前后端共享的类型与词表 |
| `modules/` | 只属于本站的扩展模块 |

## 文档

| 文档 | 内容 |
|---|---|
| [把它改成你的行业](docs/customize.md) | 站名、分类、主题、信源、提示词、门槛、品牌 |
| [信源](docs/sources.md) | 六种信源怎么配、分级与全文、抓取频率、外部推送 |
| [精选与校准](docs/selection.md) | 一条资料怎么变成精选、怎么编进日报周报月报 |
| [事件归组与关系评测](docs/grouping.md) | 事件关系判断与成对样本评测 |
| [综述评测](docs/story-digest-evaluation.md) | 事件综述提示词的并排比较 |
| [部署](docs/deploy.md) | Docker、域名与 HTTPS、中国大陆、更新、备份 |
| [部署到 Dokploy](docs/deploy-dokploy.md) | Dokploy + Traefik + Cloudflare 的完整步骤 |
| [架构](docs/architecture.md) | 三个进程、目录、数据库迁移、对外出口、测试 |

技术栈：Node.js 24 · TypeScript · React Router（服务端渲染）· Fastify · PostgreSQL 17 · pg-boss · Tailwind CSS · Docker Compose。

## 许可与来源

代码使用 [MIT 许可证](LICENSE)。字体有自己的许可，见 [NOTICE](NOTICE)。

本站的引擎来自 [AIHOT](https://github.com/KKKKhazix/AIHOT) 开源项目（MIT）。站名、Logo、信源名单、分类体系和行业内容均为本站自己的配置；上游项目的名字和 Logo 不属于本站品牌，也不在本站使用。
