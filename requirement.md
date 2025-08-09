# PRD：AI 应用一键部署与共享平台（代号：LaunchPad）

**版本**：v1.0（草案）
**文档所有者**：产品
**最后更新**：2025-08-09
**状态**：评审中

---

## 1. 背景与目标

### 1.1 背景

大模型普及后，个人与小团队能快速产出 Demo / 工具，但**部署、分享与规模化运营**门槛依然高：

* 不懂网络与运维导致“自嗨式应用”无法上线共享；
* 缺少**公平的曝光与排名**机制，优质应用难以脱颖而出；
* 成本与安全不可控，平台难以可持续。

### 1.2 目标（What）

打造一个**傻瓜化一键部署 + 公共访问 + 排名发现**的平台：

* 任何人可在 5 分钟内把 AI 应用部署到线上并分享；
* 通过**时间衰减 + 质量估计（Wilson 置信区间）**的混合模型，让优质应用稳定上榜，同时给新应用持续的首屏机会；
* 提供成本、风控与观测闭环，平台可持续发展。

### 1.3 非目标（Out of Scope for MVP）

* 企业私有化部署（Roadmap）；
* 移动端原生 App；
* 复杂商业市场（抽成、广告竞价、订阅分发）的全量能力。

---

## 2. 目标用户与场景

### 2.1 画像

* **创客/学生**：能写基础代码，不懂 DevOps，想发作品。
* **独立开发者**：有能力做功能迭代，想要省心部署与增长渠道。
* **产品/设计**：用低代码模板快速验证点子。
* **普通访客**：想尝鲜/找好玩且可用的 AI 应用。

### 2.2 核心场景

* 新用户上传代码 → 一键部署 → 自动生成应用页 → 分享链接；
* 访客浏览首页/分类/榜单 → 体验 → 投票/评论/收藏；
* 优质新应用通过“新作池 + 排名”快速获得首批用户与票；
* 开发者通过日志/观测面板排障、控制预算，安全运行。

---

## 3. 价值主张（UVP）

* **零运维部署**：上传仓库或选择模板，自动容器化与分域托管。
* **公平曝光**：结合热度与质量的**可解释**排名模型，避免先发垄断。
* **可持续**：预算、限流与缓存策略控制成本；风控与审核兜底。

---

## 4. 产品范围（MVP）

1. **一键部署**：Git 导入/Zip 上传/模板发布；自动构建、运行健康检查、独立子域 URL。
2. **应用页**：描述、标签、截图/自动录屏、运行入口、评论/评分、收藏。
3. **发现与榜单**：首页（热榜 + 新作池）、分类页、周/月/年/总榜。
4. **投票机制**：点赞/点踩、Wilson 置信区间质量系数；反作弊（速率限制、信誉分）。
5. **新作池**：前 X 小时新应用保证首屏占位（配额可调）。
6. **安全隔离**：最小权限容器、出站白名单、密钥管控、日志脱敏。
7. **成本控制**：租户预算上限、请求排队、响应缓存。
8. **观测面板**：应用日志、错误聚合、请求采样；平台状态页。
9. **合规模块**：基础内容审核、举报与下架流程、ToS/隐私/DMCA 页。

> 备注：支付与结算、模板商店、Fork/Remix 可作为 P1/P2 迭代。

---

## 5. 用户旅程与流程

### 5.1 首次发布流程

1. 登录/注册 → 2) 选择“新建应用” → 3) 选择来源（Git/Zip/模板）
2. 设置运行命令/端口/环境变量（向导式） → 5) 构建与部署
3. 健康检查通过 → 7) 生成应用页（可编辑信息） → 8) 公布并进入新作池。

**验收标准**：90% 构建可在 <10 分钟完成；失败有清晰错误与重试指引。

### 5.2 浏览与投票流程

首页 → 浏览“热榜 + 新作” → 点进应用页 → 体验运行 → 点赞/点踩/评论/收藏。
异常：同一用户对同一应用**一天只能一次计权投票**（可配置）。

### 5.3 预算与限流流程

达到开发者设置的**日/周预算** → 自动降级（排队、返回温和降级信息） → 通知开发者 → 控制台可一键提升限额或暂停。

### 5.4 审核与举报

访客举报 → 进入审核队列 → 机器初审（模型 + 规则）→ 人工复核 → 结果通知作者；严重违规立刻下线并封禁。

### 5.5 版本管理与回滚

部署自动生成**快照（代码+依赖+模型配置）** → 支持灰度 5\~10% → 异常自动回滚到上一版本。

---

## 6. 详细功能需求

### 6.1 一键部署

* **来源**：Git（GitHub/GitLab/自托管）、Zip 上传、官方模板库。
* **运行时**：Node/Python 优先；容器基线镜像只读，rootless；端口/启动命令由向导生成。
* **域名**：`{app-id}.{user}.apps.example.com` 独立子域，隔离同源策略。
* **健康检查**：/healthz HTTP 200；失败自动回滚与告警。

**验收**：

* 首次部署成功率 ≥ 90%；
* P95 首次可访问时间（TTFA）≤ 10 分钟；
* 失败信息可定位到依赖/构建/启动阶段。

### 6.2 应用页

* 元信息：名称、图标、简介、长描述、标签、版本、更新日志。
* 媒体：自动首屏截图与 10–20s 演示录屏（可手动替换）。
* 互动：点赞/点踩、评论、收藏、举报。
* 统计：近 7/30 天访问、转化、错误率、预算使用情况。

### 6.3 排名与榜单

* **综合分**：`Score_total = Score_hot × Score_quality`。
* **热度（Hacker News 体）**：`Score_hot = (up - down) / (t_hours + 2)^G`，默认 `G ∈ [1.5, 1.8]`（平台可调）。
* **质量（Wilson 下置信界）**：对二项分布 `p = up/n`，样本数 `n = up + down`，置信系数 `z = 1.96`：
  `Score_quality = (p + z^2/(2n) - z * sqrt( (p(1-p) + z^2/(4n))/n )) / (1 + z^2/n)` 的下界。
* **周期榜**：周/月/年榜按窗口内投票 + 浏览加权，仅统计窗口内事件；总榜统计全量但按时间衰减。
* **新作池**：发布后 `X` 小时内保证首页 `Y%` 卡位（如 20%），并进入分类“新作”位。

**验收**：

* 新应用在发布 1 小时内获得 ≥N 次自然曝光；
* 刷票场景下，质量分/Wilson 下界抑制异常冲顶；
* 排名曲线可解释（调参前后离线回放 A/B 验证）。

### 6.4 反作弊与公平性

* **账号信誉分**：账户年龄、历史行为、被举报率、通过 KYC/绑定邮箱/手机号；低信誉投票权重降低。
* **速率限制**：IP/设备/账号维度；指数退避。
* **相关性识别**：同网段/同时间段/强相关账号的团伙投票降权。
* **可申诉**：公开规则与复核路径。

### 6.5 安全与隔离

* 容器：rootless、只读 FS、seccomp、no-new-privileges、最小 Cap；CPU/内存/文件数/带宽配额。
* **出站白名单**：阻断内网探测与数据外泄；禁止明文访问本地元数据地址。
* **Secrets 管理**：KMS 托管；注入短期令牌；日志与崩溃报告自动脱敏。
* **SSRF/模板注入/提示注入**：网关层协议/域名白名单，LLM 输出过滤与提示注入拦截模板。
* **供应链**：依赖锁定、镜像签名、SBOM 与漏洞扫描，阻断 `curl | bash`。

### 6.6 成本与容量

* **预算**：按日/周上限；触发后降级与通知；作者可一键提升或暂停。
* **排队**：优先级队列；超时降级（静态预览/缓存结果）。
* **缓存**：对幂等请求（prompt+参数归一化）提供结果缓存，防止重复花费；缓存加盐防提示泄漏。
* **带宽**：媒体内容限速与 CDN；大对象外链封装防盗链。

### 6.7 观测与支持

* **开发者面板**：结构化日志（默认脱敏）、错误聚合、请求采样、慢请求追踪。
* **状态页**：平台 SLA、事故时间线、根因与改进。
* **反馈回路**：评分/留存/崩溃回传进入排序特征，负面权重有时效性（修复后衰减）。

### 6.8 合规与审核

* ToS/隐私/DMCA/DPA 页面；
* 内容审核：成人/仇恨/违法/医疗金融高风险自动+人工双层；地域差异支持（地理屏蔽）。

---

## 7. 非功能性需求（NFR）

* **可靠性**：平台可用性 99.9%；RPO ≤ 15min，P1 事故 RTO ≤ 60min。
* **性能**：P95 应用冷启动 ≤ 5s（二次访问）；P95 接口延迟 ≤ 300ms（控制面）。
* **安全**：通过渗透测试与依赖扫描；密钥零明文落盘。
* **可访问性**：WCAG 2.2 AA；键盘可用、对比度达标、替代文本。
* **国际化**：i18n 框架，货币/时区友好；SEO 具备站点地图与结构化数据。

---

## 8. 数据模型（核心表）

> 仅列出 MVP 必要字段，实际以迁移文件为准。

**users**(id, email, handle, reputation, created\_at, status)

**apps**(id, owner\_id, name, slug, description, readme, icon\_url, status, created\_at, updated\_at)

**deployments**(id, app\_id, version, image\_ref, status, health, created\_at, rolled\_back\_from)

**votes**(id, app\_id, user\_id, value, created\_at, ip\_hash, device\_id)

**scores**(app\_id, window, up, down, wilson\_lower, hot\_score, total\_score, updated\_at)

**budgets**(id, app\_id, period(day/week), limit\_cents, spent\_cents, status, reset\_at)

**events**(id, app\_id, type, payload\_json, created\_at)

**reports**(id, app\_id, reporter\_id, reason, detail, status, created\_at, resolved\_by)

**tags**(id, name)  /  **app\_tags**(app\_id, tag\_id)

**comments**(id, app\_id, user\_id, body\_md, status, created\_at)

索引建议：

* votes(app\_id, created\_at)、scores(window, total\_score DESC)、deployments(app\_id, created\_at DESC)。

---

## 9. 排名实现细节

### 9.1 计算策略

* 每 5 分钟增量计算一次 `scores` 物化视图；
* `hot_score` 用 HN 公式（按小时），`wilson_lower` 按窗口内投票；
* `total_score = hot_score * max(wilson_lower, ε)`，`ε` 防零；
* 周/月/年榜的 `t_hours` 在窗口内重置，`up/down` 与 `n` 仅统计窗口内事件；
* 首页混排策略：Top-K（例如 12 个卡片）中保留 `Y%` 来自“新作池”。

### 9.2 伪 SQL

```sql
-- Wilson 下置信界\ nWITH t AS (
  SELECT app_id,
         SUM(CASE WHEN value=1 THEN 1 ELSE 0 END) AS up,
         SUM(CASE WHEN value=-1 THEN 1 ELSE 0 END) AS down
  FROM votes
  WHERE created_at >= NOW() - INTERVAL '7 days'
  GROUP BY app_id
)
SELECT app_id,
       up, down,
       /* wilson_lower */
       (
         (p + z2/(2*n) - z*sqrt((p*(1-p) + z2/(4*n))/n)) / (1 + z2/n)
       ) AS wilson_lower
FROM (
  SELECT app_id, up, down, (up+down) AS n,
         CASE WHEN (up+down)=0 THEN 0 ELSE up::float/(up+down) END AS p,
         1.96 AS z, 1.96*1.96 AS z2
  FROM t
) s;
```

---

## 10. KPI 与度量

* **供给侧**：日新增应用数、首次部署成功率、构建失败率。
* **消费侧**：DAU/WAU、UV → 运行转化率、留存（D7/D30）。
* **质量**：平均评分、举报率、违规命中率、误杀率。
* **性能**：P95 首屏时间、错误率、冷启动耗时。
* **成本**：平均每应用成本、预算触发次数、缓存命中率。
* **公平**：新应用首小时曝光中位数、进入 Top N 的新应用占比。

**上线门槛（Launch Criteria）**：

* 首次部署成功率 ≥ 90%；
* 新应用首小时曝光 ≥ 100（中位数）；
* 误杀率 ≤ 2%；
* P95 控制面 API 延迟 ≤ 300ms。

---

## 11. 路线图与分期

**Phase 0（内测）**：部署与隔离、应用页、基础投票与周榜、观测面板、预算上限。
**Phase 1（公测）**：Wilson+HN 混合排名、新作池、分类榜、内容审核与举报。
**Phase 2**：模板库、Fork/Remix、灰度发布/回滚、状态页完善。
**Phase 3**：支付与结算、开发者主页/关注、个性化推荐。
**Phase 4**：企业空间、私有化与团队权限。

---

## 12. 风险与对策

* **刷票/团伙**：信誉分、速率限制、相关性降权、离线回放验参。
* **成本失控**：预算阈值 + 排队 + 缓存；热门应用冷静期。
* **安全事件**：rootless 容器 + 白名单 + SBOM；密钥零明文；应急回滚。
* **内容合规**：高风险类目强审核；地域屏蔽；申诉通道。
* **冷启动**：新作池与主题挑战赛；分类榜单扶持。

---

## 13. 运维与应急

* **分级**：P0（大面积不可用）、P1（核心功能异常）、P2（局部问题）。
* **指标**：错误率/健康检查失败/预算触发异常告警。
* **流程**：值班 → 通告（状态页）→ 回滚/扩容 → 复盘（含根因、改进项、跟进人）。

---

## 14. 法务与政策

* ToS、AUP、隐私政策、DPA、DMCA 页面模板；
* 许可与版权：模板与应用需选择 license（MIT/Apache/禁商用等），Fork 需保留声明；
* 导出管制与地区合规：特定模型/功能地区禁用开关。

---

## 15. 依赖与资源

* **技术栈**：前端 Next.js；后端 Node.js/FastAPI；Docker；PostgreSQL；对象存储（S3 兼容）；日志/追踪（OpenTelemetry）。
* **第三方**：CDN、邮件/短信、支付（Stripe/等）。
* **人力**（MVP 预估）：前端 1–2、后端 2–3、平台工程 1–2、设计 1、内容审核 兼职、PM 1。
* **成本**：按环境（Dev/Prod）与请求量估算，设置预算护栏。

---

## 16. 未来方向（非 MVP）

* 个性化首页（协同/重排）、应用合集与挑战赛、开发者勋章体系；
* 私有化部署与团队空间；
* 市场化变现：订阅、一次性付费、分成、赞助位但不破坏公平排序。

---

## 17. 附录

### 17.1 排名公式说明

* **Hacker News 热度**：`score = (up - down) / (t_hours + 2)^G`，`G` 可调 1.5–1.8。
* **Wilson 下置信界**（下界）：`(p + z^2/(2n) - z * sqrt((p(1-p) + z^2/(4n))/n)) / (1 + z^2/n)`，`p = up/n, n=up+down, z=1.96`。
* **综合**：`total = hot × max(wilson_lower, ε)`；首页混排保留 `Y%` 新作位。

### 17.2 API（示例，MVP 子集）

* `POST /apps` 创建应用；`POST /apps/{id}/deploy` 部署；`GET /apps/{id}` 应用详情。
* `POST /apps/{id}/votes` 投票（value ∈ {1,-1}）；`GET /leaderboard?window=week` 榜单。
* `GET /apps/{id}/logs` 开发者日志（需鉴权）。
* `POST /reports` 举报；`POST /budgets` 设置预算。
* Webhook：`deployment.succeeded/failed`、`budget.threshold_reached`。

### 17.3 权限矩阵（节选）

* 访客：浏览、运行、点赞/点踩、评论、举报；
* 注册用户：同上 + 收藏；
* 作者：管理应用、查看日志、设置预算、回滚版本；
* 审核员：处理举报、下架、封禁；
* 管理员：系统配置、参数调优、查看全量观测。

### 17.4 审核政策（节选）

* 禁止违法、成人、仇恨、医疗/金融误导；
* 对生成式媒体需标注；
* 违规分级与处理时效：P0（立即下线）、P1（24h 内）、P2（72h 内）。

---

**附注**：本文档为评审草案，目标是指导 MVP 设计与开发，参数与阈值均可通过 A/B 与离线回放进一步校准。

---

## 18. 详细功能设计（全覆盖）

> 说明：以下为 MVP+P1 的完整功能设计，覆盖业务规则、字段校验、状态流转、边界与异常。若与前文范围有冲突，以本节为准；Roadmap 功能将显式标注。

### 18.1 账户与认证

* **注册/登录**：邮箱+密码（BCrypt ≥10）、第三方 OAuth（GitHub/Google）。
* **MFA**（P1）：TOTP；备份代码 10 枚；受信设备 30 天。
* **邮箱验证**：发送一次性链接（15 分钟有效）；未验证用户仅可浏览，不可发布/投票。
* **密码策略**：≥8 位，含字母与数字；连续 5 次失败锁定 15 分钟（指数退避）。
* **会话**：JWT（短令牌 15min）+ Refresh Token（7 天，可撤销）；同设备最多 5 个会话；注销全部会话。
* **角色**：`visitor` / `user` / `author` / `moderator` / `admin`；权限细则见 17.3。
* **设备与安全日志**：记录登录 IP、UA、指纹 Hash；异常登录邮件提醒；可手动移除会话。

### 18.2 用户与组织（P1）

* **个人资料**：头像、昵称、handle（3–20 字母数字与`-`，唯一）、简介、社媒链接。
* **组织空间**（P2）：成员角色（owner/admin/contributor/viewer），应用归属可迁移。

### 18.3 应用管理

* **来源**：Git（HTTPS/SSH）、Zip 上传（最大 200MB）、模板库。
* **构建**：

  * 方式：Dockerfile 自动发现；无 Dockerfile 时使用 Buildpacks（Node/Python）。
  * 参数：启动命令、监听端口（默认 3000）、健康检查路径 `/healthz`。
  * 缓存：依赖缓存（分语言）；失败重试 2 次，退避 1/4 分钟。
* **环境与密钥**：

  * 环境变量：普通变量（可见）与 Secret（不可见、仅可轮转），作用域（build/run）。
  * Secret 轮转：版本化；引用历史保留 30 天；使用审计日志。
* **部署流水线**：`queued → building → deploying → health_check → live | failed | rolled_back`；可手动回滚至任一快照。
* **域名**：`{app-id}.{user}.apps.example.com`；（P1）自定义域 CNAME 绑定与 ACME 证书自动签发。
* **可见性**：public / unlisted / private（仅作者与协作者）；默认 public。
* **资源配额**：CPU/内存/并发/磁盘默认配额；（P1）地区选择与多副本。
* **版本**：每次部署生成不可变版本号（时间戳+短 Hash）；变更日志可编辑。

### 18.4 运行隔离与网络

* rootless 容器、只读文件系统；临时可写 `/tmp`；No-new-privileges；seccomp/base capabilities 精简。
* **出站白名单**：默认拒绝；允许 HTTPs 至常用云 API（可申请新增）；禁止访问内网保留网段与云元数据地址。
* **入站**：仅通过网关；WebSocket 透传；静态资源经 CDN。

### 18.5 预算与计费（MVP 只做预算与用量显示）

* **预算上限**：按日/周；触发后进入降级：排队 + 429/替代响应；通知作者（站内+邮件）。
* **用量度量**：请求数、生成时长（如适用）、带宽 egress、存储；T+1 结算快照。
* **费用估算器**（P1）：基于近 7 天均值与参数预测。

### 18.6 发现、搜索与推荐

* **首页编排**：

  * 「热榜」区块：按 `total_score` 排序 Top N；
  * 「新作池」区块：最新 `X` 小时内应用随机/打散展示，占首页卡片 `Y%`（默认 20%）；
  * 「分类/标签」：热门标签 Top 20；
  * 「编辑精选」（P1）：人工置顶，不计入算法权重。
* **搜索**：前缀匹配 + 模糊；权重=标题>标签>描述>作者；筛选：标签、时间窗（24h/7d/30d/All）、排序（相关度/最新/评分/热度）。
* **分页**：无限加载（IntersectionObserver）；支持 `?page=` 回退；每页 24 卡片。

### 18.7 排名与投票规则

* **投票**：注册用户可投 `+1/-1`；同用户同应用 24h 内仅一次计权；可在 10 分钟内撤回（Undo）。
* **权重**：用户信誉分 0.5–1.5 线性映射；新用户（<24h）权重 0.5；被频繁举报的账号权重最低 0.1。
* **反作弊**：同 IP/指纹短时高相关上升触发“冷却”计分；异常模式进入人工复核队列。
* **评分计算**：

  * `Score_hot = (up - down) / (t_hours + 2)^G`，`G=1.6` 初始；
  * `Score_quality = WilsonLower(up, down, z=1.96)`；
  * `Score_total = Score_hot * max(Score_quality, 0.05)`；
  * 计算频率：每 5 分钟增量；榜单窗口（周/月/年）仅统计窗口内事件。
* **Tie-breaker**：并列时按最近互动时间降序；再按创建时间升序。
* **可解释性**：应用页公开近 7 天得分分解与主要因素（匿名聚合）。

### 18.8 评论与互动

* **评论**：Markdown 子集（粗体/斜体/列表/代码/链接）；最多 2 级回复；可编辑 15 分钟；删除保留“已删除”占位。
* **反滥用**：每人每应用 3 条/小时；AKIS/ML 反 spam；含外链需要 ≥信誉阈值或二次确认。
* **排序**：热度（点赞-踩+时间衰减）、最新、作者优先；可折叠低分评论。
* **@提及**（P1）：通知被提及的作者。

### 18.9 举报与审核

* **举报类型**：违法、成人、仇恨、隐私泄露、侵权、诈骗/恶意、误导（医疗/金融）、其他。
* **流程**：举报→机器初审（规则+模型）→人工复核→处置（下架/限流/警告/封禁）→可申诉。
* **SLA**：P0（安全风险）2h、P1 24h、P2 72h；状态可在应用页展示“审核中/已处理”。
* **证据**：允许附截图/运行日志片段（自动打码敏感信息）。

### 18.10 观测与支持

* **开发者面板**：

  * 日志：结构化（JSON），支持字段过滤、搜索、下载；默认脱敏（email/key/手机号）。
  * 错误聚合：按异常签名合并，展示趋势与样例。
  * 追踪：请求采样 1%；慢请求阈值可调。
* **状态页**：服务可用性、事故时间线、根因、改进项与跟进人。

### 18.11 通知

* **站内**：通知中心，已读/未读；保留 90 天。
* **邮件**：

  * 系统：注册验证、密码重置、安全提醒；
  * 应用：部署成功/失败、预算触发、异常峰值、被举报与审核结果；
  * 摘要：周报（用量、评分、排名变化）。
* **频率限制**：同类通知聚合；夜间静默（本地时区 22:00–8:00，紧急除外）。

### 18.12 本地化与可访问性

* i18n：文案 key 化；日期/数字/货币/时区本地化；用户可设置时区（默认浏览器）。
* a11y：语义化标签、键盘可达、焦点管理、ARIA 标签；对比度 AA；动画可减弱（尊重系统偏好）。

### 18.13 SEO 与分享

* 每个应用页静态元数据：`title/description/og:image`；可生成 OpenGraph 截图。
* 站点地图/索引控制：公共页允许、private/unlisted 禁止索引。

### 18.14 API 与 Webhook（摘要）

* **API**（需 token）：

  * `POST /apps`、`POST /apps/{id}/deploy`、`GET /apps/{id}`、`GET /apps/{id}/logs`（分页游标）；
  * `POST /apps/{id}/votes`（{"value":1|-1}）→ 200 返回新分数；
  * 速率上限：用户级 600 rpm；IP 级 1200 rpm。
* **Webhook**：`deployment.succeeded|failed`、`budget.threshold_reached`、`report.opened|resolved`；签名校验（HMAC-SHA256）。
* **错误码**：400 参数、401 鉴权、403 权限、404 资源、409 冲突（并发/版本）、422 校验、429 限流、5xx 服务。

### 18.15 数据保留与备份

* 日志保留 30 天（MVP），可导出；部署镜像保留 90 天；备份每日 1 次，保留 14 份；RPO ≤15 分钟。

### 18.16 审计与风控

* 审计日志：敏感操作（删除、下架、封禁、密钥操作、角色变更）。
* 风控规则：异常流量、刷票、批量注册、同源群体；自动降权并留痕。

### 18.17 实验与配置

* 远程配置：新作池比例 `Y`、G 值、冷却阈值；可灰度发布参数。
* A/B：离线回放 + 线上 bucket，指标：新应用首小时曝光、留存、投诉率。

---

## 19. 页面与交互设计（结构/字段/状态全覆盖）

> 注：以下为低保真信息架构与组件清单，便于设计与前端实现；所有页面需包含：加载、空状态、错误、权限不足、分页/滚动与 SEO 元数据。

### 19.1 全局

* **导航**：顶部导航（Logo、搜索、提交应用、通知、头像菜单）；移动端抽屉导航。
* **页脚**：关于、ToS、隐私、DMCA、状态页、Twitter/GitHub。
* **组件**：按钮（主/次/幽灵/危险）、输入、选择器、标签、徽章、卡片、标签页、表格、分页、模态、抽屉、Toast、Skeleton、空状态插画。

### 19.2 登录/注册/重置

* 字段：邮箱、密码；注册需勾选 ToS/隐私；验证码（风控触发时）。
* 异常：邮箱未验证、密码错误、频率限制；支持“以访客浏览”。

### 19.3 首次引导（Onboarding）

* 步骤：完善资料 → 连接 GitHub（可选）→ 创建首个应用或浏览模板。
* 任务完成提示与快捷入口。

### 19.4 控制台 Dashboard（作者）

* 卡片：我的应用（最近 5 个）、近期用量、预算状态、最近通知。
* 空状态：创建应用 CTA；文档链接。

### 19.5 新建应用向导（多步）

1. 选择来源：Git/Zip/模板；
2. 配置运行：语言、启动命令、端口、健康检查；
3. 环境与密钥：添加 KV，标记 Secret；
4. 资源与预算：并发上限、预算上限；
5. 预览与确认：构建摘要、预计成本；
6. 部署进度页：阶段进度、日志流、出错重试、回滚按钮。

### 19.6 应用详情（作者视图）

* 选项卡：概览｜部署｜日志｜变量与密钥｜预算与用量｜设置。
* 概览：可见性、域名、版本、状态、近 7 天指标、评分分解。
* 部署：历史列表 + 详情（镜像、提交者、变更日志、回滚）。
* 日志：搜索、过滤、导出；采样比例提示。
* 变量与密钥：表格（名称/值/作用域/最后修改/引用次数）；轮转按钮。
* 预算与用量：图表（请求、带宽、缓存命中、预算剩余）。
* 设置：名称、图标、简介、标签、可见性、删除应用（危险区）。

### 19.7 应用公共页（访客视图）

* 头部：名称、作者、标签、评分与票数、收藏、分享、举报。
* 媒体区：自动截图/演示视频；
* 运行入口：内嵌 iframe / 新窗口打开（安全提示与隔离说明）。
* 说明：简介、功能点、版本/更新、许可、模型信息（版本/温度/种子）。
* 互动：点赞/点踩（Undo）、评论（排序切换）、收藏。
* 侧边：相关应用、同标签 Top、本应用得分曲线（近 7 天）。
* 状态：审核中/受限地区提示；预算耗尽时显示“排队/稍后再试”。

### 19.8 首页

* 模块：搜索栏、热榜（可切周/月/年/总）、新作池（横向滚动）、热门标签、编辑精选（P1）。
* 交互：时间窗切换保持滚动位置；卡片悬停展示关键指标。

### 19.9 排行榜页

* 过滤：时间窗、标签、多选标签、排序（默认综合）。
* 列表：卡片布局；支持批量收藏。
* 空状态：给出“新作池”入口与提交 CTA。

### 19.10 分类/标签页

* 头部：标签介绍、订阅按钮（P1）。
* 列表：该标签下的热榜与最新两个分区。

### 19.11 搜索结果页

* 组件：搜索框、面包屑、筛选器（标签/时间/排序）、结果列表、无结果建议（放宽条件、热门标签）。

### 19.12 日志查看器（作者）

* 过滤：级别、时间、关键词、字段（request\_id、user\_id…）。
* 视图：表格 + 展开查看原始 JSON；下载 .ndjson。
* 安全：敏感字段已打码，可解码需二次确认与权限。

### 19.13 部署流水线页

* 时间轴：队列→构建→部署→健康检查→结果；
* 工具：重试、取消、回滚；
* 错误：展示构建日志片段与建议链接。

### 19.14 变量与密钥页

* 表格操作：新增/编辑/删除、批量导入（.env）、作用域切换、轮转历史（谁在何时改动）。

### 19.15 预算与用量页

* 图表：日用量、缓存命中、带宽；
* 控件：日/周预算上限、阈值通知、超限策略（排队/拒绝）。

### 19.16 用户主页（开发者资料）

* 头部：头像、简介、链接、信誉分。
* 列表：TA 的应用（按最新/评分）、收藏、贡献（Fork/PR，P2）。

### 19.17 收藏夹

* 分组（默认/自定义）；批量操作；导出（P1）。

### 19.18 通知中心

* 过滤：全部/系统/部署/审核/互动；一键已读；分页。

### 19.19 举报/审核控制台（版主/管理员）

* 队列：按优先级与时效排序；
* 详情：应用上下文、证据、历史记录、相似案例；
* 操作：下架、限流、警告、封禁、恢复；
* 审计：所有操作留痕，可导出。

### 19.20 审核详情页

* 时间线：举报→机器初审→人工复核→处置→申诉；
* 文本模板：通知作者与举报人（可编辑）。

### 19.21 系统状态页

* 服务组件状态、历史事件、SLA、订阅更新（RSS/Webhook）。

### 19.22 设置（账号/安全/隐私/通知/API）

* 账号：邮箱、handle、头像；
* 安全：密码、MFA、会话管理；
* 隐私：可见性默认、搜索引擎索引偏好；
* 通知：邮件与站内频率；
* API：生成/吊销 Token、速率现况。

### 19.23 法务页

* ToS、隐私政策、DMCA、DPA（下载 PDF）；修订历史与生效日期。

### 19.24 错误与维护页

* 403/404/500 专用插画与返回操作；维护公告页支持倒计时与订阅。

---

## 20. 字段与校验明细（示例节选）

* 应用名称：2–60 字，禁止全符号与保留词；
* Slug：小写字母数字和`-`，2–40 字符，唯一；
* 标签：每个 1–20 字，最多 10 个；
* 描述：≤ 1000 字；
* 运行端口：1–65535，默认 3000；
* URL：必须 https；
* 文件：Zip ≤ 200MB，单文件 ≤ 50MB。

---

## 21. 事件埋点规范（节选）

* `app_create_started|succeeded|failed`、`deploy_started|succeeded|failed`、`vote_cast`（value, weight）、`comment_created`、`budget_threshold_hit`、`report_submitted`、`moderation_action`。属性统一使用 snake\_case，携带 request\_id、user\_id（匿名化）。

---

## 22. 质量保障与验收

* **单测**：关键算法（Wilson/Hot）与权限校验覆盖率 ≥ 90%。
* **集成**：部署与回滚、预算触发与降级、投票冷却与撤回、举报闭环。
* **性能**：P95 控制面 ≤ 300ms；日志检索 10 万行内 P95 ≤ 1s。
* **安全**：渗透测试、依赖扫描、密钥不落盘检查、出站白名单验证。

---

## 23. 开发与设计交付物

* 低保真线框（所有页面）→ 高保真组件库（Figma）→ 交互动效与空状态规范；
* OpenAPI 3.1 规范文件；数据库迁移脚本；灰度与回滚 Runbook；审核与申诉 SOP。

---

## 24. 术语表

* **Wilson 下置信界**：对二项分布成功率的保守估计下界；
* **G 参数**：Hacker News 热度公式的时间衰减指数；
* **新作池**：发布后一定时间内给予首页配额的冷启动机制。

---

## 25. Agent Build Pack（面向 Cursor/代码代理的可执行规范）

> 目的：让代码代理（如 Cursor、Copilot、Codeium 等）在**零口头上下文**下，依据本 PRD 直接生成项目骨架、后端接口、数据库迁移、前端路由与关键脚本。以下提供**明确的技术定案、目录结构、固定版本、脚手架命令、配置清单、样例代码与测试**，尽量减少含糊地带。

### 25.1 架构选型（定案）

* **模式**：单体优先的轻量多进程（Web API + Worker），Monorepo。后期可拆分。
* **前端**：Next.js 14（app router）+ TypeScript 5 + React 18 + React Query + TailwindCSS + shadcn/ui。
* **后端**：Node.js 20 + Fastify 4；TypeScript；Zod 校验；Prisma ORM。
* **数据库**：PostgreSQL 15。
* **消息队列/任务**：Redis 7（BullMQ）。
* **缓存**：Redis 7（LRU + TTL）。
* **日志 & 观测**：Winston + OpenTelemetry（OTLP/HTTP）。
* **身份认证**：JWT + Refresh Token；OAuth（GitHub/Google）采用 NextAuth.js。
* **对象存储**：S3 兼容（MinIO 本地、生产 S3）。
* **CDN**：Cloudflare（开发用本地静态）。
* **网关/反代**：Nginx（dev 用 Node 直接起端口）。
* **容器**：Docker/Compose；生产用容器编排（后续可迁 K8s）。

### 25.2 端口与进程

* Web（Next.js）：`3000`
* API（Fastify）：`4000`
* Worker（BullMQ）：无端口，监听 Redis；排名计算定时任务。
* Redis：`6379`；Postgres：`5432`；MinIO：`9000`/`9001`

### 25.3 Monorepo 目录结构

```
launchpad/
  apps/
    web/          # Next.js 前端
    api/          # Fastify 后端
    worker/       # BullMQ 任务与定时器
  packages/
    ui/           # 共享 UI 组件（shadcn 包装）
    config/       # 共享 tsconfig、eslint、prettier
    types/        # 共享类型定义（DTO/接口模型）
  infra/
    docker/       # Dockerfile 与 compose
    k8s/          # 预留（后续）
    nginx/
  scripts/        # 种子数据、数据修复、迁移工具
  .github/workflows/
  Makefile
  README.md
```

### 25.4 固定版本与包管理

* 包管理：pnpm 9；锁定 `engines`：`node>=20`、`pnpm>=9`。
* 关键依赖：`next@14`、`react@18`、`@tanstack/react-query@5`、`fastify@4`、`zod@3`、`prisma@5`、`bullmq@5`、`ioredis@5`、`winston@3`、`@opentelemetry/api@1`。

### 25.5 环境变量 Schema（.env.example）

```
# 通用
NODE_ENV=development
APP_ORIGIN=http://localhost:3000
API_ORIGIN=http://localhost:4000
JWT_SECRET=change_me
REFRESH_TOKEN_TTL_DAYS=7

# 数据库
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/launchpad

# Redis
REDIS_URL=redis://localhost:6379

# S3/MinIO
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=launchpad

# OAuth（开发占位）
GITHUB_ID=
GITHUB_SECRET=
GOOGLE_ID=
GOOGLE_SECRET=

# 邮件（开发用本地捕获，生产改用供应商）
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=

# 安全
CSP_REPORT_URI=
ALLOWED_OUTBOUND_HOSTS=api.openai.com;huggingface.co
```

### 25.6 Docker 与 Compose（开发）

* `infra/docker/Dockerfile.api`：多阶段构建（builder→runner），非 root，`node:20-slim`；
* `infra/docker/Dockerfile.web`：Next.js 产出 standalone；
* `infra/docker/Dockerfile.worker`：同 API。
* `infra/docker/docker-compose.dev.yml`：

  * 服务：`postgres`、`redis`、`minio`、`api`、`web`、`worker`；
  * 卷：`pgdata`、`minio-data`；
  * 网络：`launchpad-net`。

### 25.7 Makefile & 脚本

```
make init        # 安装依赖、生成 Prisma、准备 .env、启动 compose
make up          # 启动本地服务
make db.reset    # 重建数据库 + 迁移 + 种子
make seed        # 写入演示数据
make test        # 运行所有测试
make score-cron  # 手动触发排名任务
```

### 25.8 数据库模型（Prisma Schema 摘要）

> 字段与 PRD 第8节一致，补充类型、约束与索引。

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  handle       String   @unique
  passwordHash String?
  reputation   Float    @default(1)
  status       String   @default("active")
  createdAt    DateTime @default(now())
  Apps         App[]
}

model App {
  id          String   @id @default(cuid())
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])
  name        String
  slug        String   @unique
  description String
  readme      String?
  iconUrl     String?
  status      String   @default("public")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  Deployments Deployment[]
  Votes       Vote[]
  Scores      Score[]
  Comments    Comment[]
}

model Deployment {
  id         String   @id @default(cuid())
  appId      String
  app        App      @relation(fields: [appId], references: [id])
  version    String
  imageRef   String
  status     String
  health     String?
  createdAt  DateTime @default(now())
  rolledBackFrom String?
}

model Vote {
  id        String   @id @default(cuid())
  appId     String
  userId    String
  value     Int      // 1 or -1
  ipHash    String?
  deviceId  String?
  createdAt DateTime @default(now())
  @@unique([appId, userId, createdAt])
  @@index([appId, createdAt])
}

model Score {
  id          String   @id @default(cuid())
  appId       String
  window      String   // week|month|year|all
  up          Int
  down        Int
  wilsonLower Float
  hotScore    Float
  totalScore  Float
  updatedAt   DateTime @default(now())
  @@index([window, totalScore(sort: Desc)])
}

model Budget {
  id          String   @id @default(cuid())
  appId       String
  period      String   // day|week
  limitCents  Int
  spentCents  Int      @default(0)
  status      String   @default("active")
  resetAt     DateTime
}

model Comment {
  id        String   @id @default(cuid())
  appId     String
  userId    String
  bodyMd    String
  status    String   @default("visible")
  createdAt DateTime @default(now())
}
```

### 25.9 OpenAPI 3.1 规范（精简示例）

```yaml
openapi: 3.1.0
info:
  title: LaunchPad API
  version: 0.1.0
servers:
  - url: http://localhost:4000
paths:
  /apps:
    post:
      summary: Create app
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AppCreate'
      responses:
        '201': { description: Created, content: { application/json: { schema: { $ref: '#/components/schemas/App' } } } }
  /apps/{id}/deploy:
    post:
      summary: Trigger deployment
      security: [{ bearerAuth: [] }]
      parameters:
        - in: path
          name: id
          schema: { type: string }
          required: true
      responses:
        '202': { description: Accepted }
  /apps/{id}:
    get:
      summary: Get app detail
      parameters:
        - in: path
          name: id
          schema: { type: string }
          required: true
      responses:
        '200': { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/App' } } } }
  /apps/{id}/votes:
    post:
      summary: Cast vote
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content: { application/json: { schema: { $ref: '#/components/schemas/VoteCreate' } } }
      responses:
        '200': { description: OK }
  /leaderboard:
    get:
      summary: Leaderboard
      parameters:
        - in: query
          name: window
          schema: { type: string, enum: [week, month, year, all] }
      responses:
        '200': { description: OK }
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer, bearerFormat: JWT }
  schemas:
    AppCreate:
      type: object
      required: [name, slug, description]
      properties:
        name: { type: string, minLength: 2, maxLength: 60 }
        slug: { type: string, pattern: '^[a-z0-9-]{2,40}$' }
        description: { type: string, maxLength: 1000 }
    VoteCreate:
      type: object
      required: [value]
      properties: { value: { type: integer, enum: [1, -1] } }
    App:
      type: object
      properties:
        id: { type: string }
        name: { type: string }
        slug: { type: string }
        description: { type: string }
        status: { type: string }
```

### 25.10 排名计算任务（Worker 伪代码 / TS）

```ts
// worker/src/jobs/recomputeScores.ts
import { prisma } from '../db';
const G = parseFloat(process.env.HN_G ?? '1.6');
function wilsonLower(up: number, down: number, z=1.96){
  const n = Math.max(up+down, 1);
  const p = up / n;
  const z2 = z*z;
  return (p + z2/(2*n) - z * Math.sqrt((p*(1-p) + z2/(4*n))/n)) / (1 + z2/n);
}
export async function recompute(window: 'week'|'month'|'year'|'all'){
  const since = window==='all'? new Date(0) :
    new Date(Date.now() - {week:7, month:30, year:365}[window]*24*3600*1000);
  const apps = await prisma.app.findMany();
  for(const app of apps){
    const votes = await prisma.vote.findMany({
      where: { appId: app.id, createdAt: { gte: since } },
      select: { value: true, createdAt: true }
    });
    const up = votes.filter(v=>v.value===1).length;
    const down = votes.filter(v=>v.value===-1).length;
    const hours = Math.max((Date.now()-app.createdAt.getTime())/3600000, 0);
    const hot = (up - down) / Math.pow(hours + 2, G);
    const quality = Math.max(wilsonLower(up, down), 0.05);
    const total = hot * quality;
    await prisma.score.upsert({
      where: { appId_window: { appId: app.id, window } },
      update: { up, down, wilsonLower: quality, hotScore: hot, totalScore: total, updatedAt: new Date() },
      create: { appId: app.id, window, up, down, wilsonLower: quality, hotScore: hot, totalScore: total }
    });
  }
}
```

* **调度**：CRON `*/5 * * * *`；通过 BullMQ `repeatable jobs` 触发四个窗口任务。

### 25.11 反作弊中间件（API）

* **速率限制**：`fastify-rate-limit`（内存/Redis 存储），用户级 `600 rpm`，IP 级 `1200 rpm`；
* **信誉权重**：投票落库前查询 `User.reputation` 映射为 0.5–1.5 写入 `Vote.weight`（可扩展字段）。
* **相关性**：将 `ipHash/deviceId` 写入，调 worker 离线聚类，触发“冷却”标签，冷却期内对 `Score_total` 乘以 `0.7`。

### 25.12 安全与 CSP（Nginx 片段）

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https: wss:; img-src 'self' data: https:; frame-ancestors 'none'; frame-src https:;";
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header Referrer-Policy strict-origin-when-cross-origin;
```

### 25.13 前端路由与页面映射（Next.js）

```
apps/web/app/
  layout.tsx
  page.tsx                       # 首页
  leaderboard/[window]/page.tsx  # 排行榜
  tag/[slug]/page.tsx            # 标签页
  search/page.tsx
  apps/
    new/page.tsx                 # 新建应用向导
    [id]/page.tsx                # 公共应用页
    [id]/run/page.tsx            # 运行（iframe / 外链）
    [id]/edit/page.tsx           # 作者设置
    [id]/logs/page.tsx           # 日志查看
  dashboard/page.tsx             # 控制台
  settings/*                     # 账号与安全
```

* 数据访问：`@/lib/api` 包装 fetch；React Query 缓存；Zod 校验响应。
* 设计 Token：`/packages/ui/tokens.ts`（颜色、圆角、阴影、间距、字体）。

### 25.14 测试与质量

* **单测**：Vitest（后端/前端共享）；覆盖 `wilsonLower`、`Score_hot`、权限中间件。
* **集成**：Supertest 跑 API；Docker 启动 pg/redis 进行带库测试。
* **E2E**：Playwright；场景：注册→创建应用→部署（模拟成功）→投票→榜单可见。
* **性能**：k6 脚本压测 `/leaderboard` 与 `/apps/{id}`；目标 P95 < 200ms。

### 25.15 开发用种子数据（scripts/seed.ts）

* 3 个用户（含新用户/高信誉）
* 10 个应用（覆盖不同创建时间与票数分布）
* 自动生成 7/30 天投票数据，含异常峰值与冷却标签

### 25.16 CI/CD（GitHub Actions 示例）

```yaml
name: ci
on: [push, pull_request]
jobs:
  build-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env: { POSTGRES_USER: postgres, POSTGRES_PASSWORD: postgres }
        ports: ['5432:5432']
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm i
      - run: pnpm -w run prisma:generate
      - run: pnpm -w run test
  docker:
    needs: build-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -f infra/docker/Dockerfile.api -t launchpad/api:$(git rev-parse --short HEAD) .
```

### 25.17 运行手册（Dev/Prod）

* Dev：`make init && make up` → 打开 [http://localhost:3000](http://localhost:3000)
* Prod：构建镜像→拉起 `docker-compose -f docker-compose.prod.yml up -d`；设置 `APP_ORIGIN`、`API_ORIGIN`、`JWT_SECRET`、数据库与 Redis 地址；接入 OTLP、SMTP、S3 真实配置。

### 25.18 内容审核接入（占位实现）

* 抽象接口 `ModerationProvider`：`check(text|image|url): Verdict`；
* 默认实现：规则引擎（关键词/阈值）+ 本地模型（后续可换第三方）；
* API 钩子：评论发布、应用描述更新、举报复核前。

### 25.19 SEO/OG 自动化

* 构建时/运行时生成 `og:image`（vercel/og 或 satori）；
* Robots：仅 public 页面允许索引；unlisted/private 禁止。

### 25.20 风险旗标与降级策略（可编程）

* `RISK_COOL_DOWN`：触发后 24h 内 `Score_total *= 0.7`；
* `BUDGET_BLOWUP`：返回 429 + 引导页；
* `ABUSE_SUSPECT`：评论区只读、投票显示受限提示。

---

## 26. 前端实现蓝图（组件/状态/交互约定）

### 26.1 设计 Token（/packages/ui/tokens.ts）

* 颜色：`primary, secondary, success, warning, danger, bg, text, muted`；
* 圆角：`xl=16px, 2xl=24px`；阴影：`sm/md/lg`；间距：`4/8/12/16/24`；
* 动画：Framer Motion，卡片悬停、列表进场；尊重 `prefers-reduced-motion`。

### 26.2 状态管理

* React Query：API 层统一封装；失效策略：列表 60s、详情 15s；
* 全局 Store：Zustand（用户、通知、主题）。

### 26.3 通用组件

* `AppCard`、`VoteButton`（支持 Undo）、`ScoreBadge`、`TagPill`、`UserAvatar`、`RiskBanner`、`QuotaGauge`、`LogViewer`、`OgPreview`。

### 26.4 表单与校验

* `react-hook-form` + Zod；字段规则来自 20 节；错误提示与帮助文案。

### 26.5 无障碍与键盘

* 所有交互可 Tab 导航；`aria-live` 用于 Toast；对话框可 Esc 关闭，焦点回退。

---

## 27. 观测与日志 Schema

* **日志字段**：`ts, level, msg, request_id, user_id(anon), app_id, route, latency_ms, status, ip_hash`；敏感字段自动打码。
* **追踪属性（Resource）**：`service.name=api/web/worker, service.version, deployment.environment`。
* 采样：基础 10%，错误 100%。

---

## 28. 安全与限流策略（可直接落地）

* CORS：`Origin` 白名单，允许 `Authorization, Content-Type`；凭据禁用。
* CSRF：仅表单 POST 需要 token（SameSite=Lax 情况下可选）。
* 速率：用户 600 rpm、IP 1200 rpm；投票/评论专线 60 rpm。
* CSP：参见 25.12；
* 会话固定化防护：刷新令牌轮换；登录后重新颁发访问令牌。

---

## 29. 测试计划（细化用例）

* **单测**：

  * `wilsonLower` 边界（n=0、极端比例）、G 调参回归；
  * 权限：未验证邮箱投票被拒；
  * 预算：超限返回 429 并产生事件；
* **集成**：

  * 创建→部署（模拟成功）→健康检查→可见；
  * 投票→榜单刷新→新作池混排；
  * 举报→机器初审→人工复核（模拟）→下架。
* **E2E**：

  * 新用户冷启动：首页保证新作位曝光；
  * 刷票冷却：团伙行为触发降权提示；
  * 预算耗尽：降级页与通知闭环。

---

## 30. 开发数据与演示账号

* 账户：`alice@example.com`（高信誉）、`bob@example.com`（新用户）、`mod@example.com`（审核员）。
* 密码统一：`Password123!`（仅开发环境）。
* Apps：`chat-bot, image-gen, data-cruncher` 等，含不同创建时间与票型。

---

## 31. 部署与回滚 Runbook（摘要）

* 部署：打 Tag → CI 构建镜像 → 推送镜像 → 更新 Compose/K8s 清单 → 健康检查通过即切换；
* 回滚：一键切回上一镜像标签；数据库迁移遵循向前兼容原则（带回滚脚本）。

---

## 32. 未决项与默认值（为代理消除歧义）

* 云商：默认 Render/ Railway（容器即开即用），可切换 AWS。
* 域名：`apps.example.com` 为占位；生产由 `APP_ORIGIN`/`API_ORIGIN` 指定。
* 邮件：开发用 `mailhog`，生产留空需接入供应商（Sendgrid/SES）。
* 审核：默认本地规则引擎；生产可切换第三方。
* GPU：MVP 不提供；Roadmap 提供计算规格 `cpu/basic|cpu/plus|gpu/t4`。
* 预算默认：`day=5 USD`、`week=20 USD`（仅展示于 UI，无真实扣费）。

---

## 33. 代码风格与提交规范

* ESLint + Prettier；`pnpm lint` 必须通过；
* commit message 采用 Conventional Commits（feat/fix/chore/docs/test/refactor等）；
* 分支策略：`main` 受保护；`feat/*`、`fix/*`；PR 需 1 个批准与 CI 绿灯。

---

## 34. 快速开始（代理提示语）

> 给代码代理的系统提示（可复制粘贴到 Cursor）：

```
你是资深全栈工程师。使用本仓库的 Agent Build Pack 实现一个 MVP：
- 生成 Monorepo 结构与 pnpm 工作区；按 25.3 创建目录与模板代码；
- 基于 25.8 Prisma schema 创建迁移；
- 按 25.9 实现 API 路由与 Zod 校验；
- 依据 25.13 创建 Next.js 路由与页面骨架与 shadcn 组件；
- 编写 25.10 排名 worker 与 BullMQ 定时任务；
- 配置 25.12 安全头、28 节限流、CORS；
- 提供 25.7 Makefile、25.6 Compose；
- 实现 29 节测试最小集并确保 CI 通过；
- 使用 25.15 种子数据生成可演示的榜单与新作池效果。
```

---

## 35. 存储方案（MVP 采用本地目录文本文件 FileDB）

> 本节**覆盖并替代**第 25.1 的“数据库/PostgreSQL”描述，改为**可插拔存储**：MVP 默认使用**本地目录文本文件（JSON Lines + 快照）**，后续可无痛切换到 PostgreSQL。其余 API/页面/业务逻辑不变，通过 Repository 接口解耦。

### 35.1 目标与约束

* **单机开发/演示优先**：零安装数据库；随仓库启动即可运行。
* **一致性足够**：单进程写入保证；重启可恢复；崩溃后最多损失最后一条未 fsync 的记录。
* **可迁移**：统一 Repository 接口；稍后可切换到 Postgres 实现。
* **非目标**：不面向高并发与多实例写入（生产请用 DB）。

### 35.2 目录与文件布局（DATA\_DIR=./data）

```
./data/
  users.jsonl          # 事件日志（append-only）
  apps.jsonl
  deployments.jsonl
  votes.jsonl
  scores_all.jsonl     # 物化分数（all）
  scores_week.jsonl    # 物化分数（week）
  scores_month.jsonl
  scores_year.jsonl
  budgets.jsonl
  events.jsonl
  reports.jsonl
  comments.jsonl
  tags.jsonl
  app_tags.jsonl

  snapshots/           # 状态快照（覆盖写）
    users.snapshot.json
    apps.snapshot.json
    ...

  idx/                 # 增量索引（map 缓存）
    votes_by_app_day.json       # {"appId|YYYY-MM-DD": {up, down}}
    comments_by_app.json        # {"appId": [commentId...]}
    apps_by_created.json        # 时间排序缓存

  locks/               # 写入锁（.lock 文件）
  seq/                 # 序列号与去重标识

  media/               # 上传媒体/自动截图（与对象存储替代）
  archive/             # 旧日志滚动归档（按日）
```

### 35.3 记录格式（JSONL 事件）

* 每行一条 UTF-8 JSON，尾随 `
  `。
* 通用字段：

  * `_id`: cuid/nanoid
  * `_ts`: ISO8601 时间戳（UTC）
  * `_op`: `insert | update | delete`
  * `data`: 业务对象（见第 8 节数据模型）
* 删除采用**软删除**：`_op=delete` + `data.id`。

### 35.4 写入与并发控制

* **单进程写**：API 进程内使用 per-collection 互斥（`AsyncMutex`）。
* **多进程（可选）**：基于锁文件 `./data/locks/{collection}.lock`，`fs.open('wx')` 抢占，完成后 `fs.unlink` 释放。
* **原子写**：采用 `fs.appendFile` + `fsync`；快照/索引使用 `write → fsync → rename`（先写 `.tmp` 再 `rename`）。
* **去重与幂等**：写前计算 `idempotency_key`（如 `vote:{userId}:{appId}:{YYYYMMDD}`）并存储在 `seq/seen.json` 以防重复。

### 35.5 读路径与快照

* 启动时加载 `snapshots/*.json` 到内存 map；若不存在，首次**回放**对应 `*.jsonl` 构建。
* 写入后**异步**更新内存态与必要索引；关键路径（投票、创建应用）采用同步更新相关索引。
* **定时快照**：每 5 分钟或日志增长超过 10MB 时，生成对应快照，旧快照保留 2 代。

### 35.6 索引与查询（示例）

* `votes_by_app_day.json`：键 `appId|YYYY-MM-DD` → `{up,down}`（用于 Wilson 与 hot 的窗口聚合）。
* `apps_by_created.json`：按创建时间排序的 appId 列表（用于新作池、时间窗口筛选）。
* `comments_by_app.json`：appId → 排序后的 commentId 列表。
* 索引**增量维护**：事件写入后更新相关键，避免全表扫描。

### 35.7 Repository 接口（TypeScript）

```ts
// packages/types/repo.ts
export interface UsersRepo { findByEmail(email:string):Promise<User|null>; create(u:User):Promise<User>; }
export interface AppsRepo { create(a:App):Promise<App>; update(a:Partial<App>&{id:string}):Promise<App>; get(id:string):Promise<App|null>; getBySlug(slug:string):Promise<App|null>; list(opts:{tag?:string; order?:'created'|'score'; limit:number; offset:number;}):Promise<App[]>; }
export interface VotesRepo { cast(v:{appId:string; userId:string; value:1|-1; ts:Date}):Promise<{accepted:boolean; reason?:string}>; tally(appId:string, window:'week'|'month'|'year'|'all'):Promise<{up:number;down:number}>; }
export interface ScoresRepo { upsert(s:Score):Promise<void>; top(window:'week'|'month'|'year'|'all', limit:number, tag?:string):Promise<Score[]>; }
```

* **FileRepo 实现**：`packages/filedb/*` 提供 adapter；`packages/db/*` 预留 Postgres 实现。
* 应用代码仅依赖 `RepoFactory`：通过 `STORAGE=file` 或 `STORAGE=pg` 切换。

### 35.8 排名任务（适配 FileDB）

* Tally 来源：优先读取 `idx/votes_by_app_day.json`，按窗口聚合；
* `hot_score` 的 `t_hours` 使用 `apps.snapshot.json` 中的 `createdAt`；
* 计算结果写入 `scores_{window}.jsonl` 与 `snapshots/scores_{window}.json`。

### 35.9 迁移与压缩

* **日志滚动**：按天将 `*.jsonl` 移至 `archive/YYYY-MM-DD/*.jsonl`；
* **压缩**：`scripts/compact.ts` 从最新快照 + 当日日志重建快照，删除已合并的日志；
* **导出**：`scripts/export-pg.ts` 将快照导入 PostgreSQL（列名映射见第 8 节）。

### 35.10 备份与恢复

* 备份：`tar -czf backup-$(date).tgz data/`；
* 恢复：解压覆盖；若快照缺失，可全量回放 jsonl 重建状态。

### 35.11 环境变量 & 启动命令

```
STORAGE=file
DATA_DIR=./data
```

* `make init`：创建 `data/{snapshots,idx,locks,seq,media,archive}` 目录并写入空快照。
* `make seed`：写入演示数据与索引。

### 35.12 API 行为不变，约束差异

* 排他写假定**单 API 实例**；多副本部署需使用外部 DB 或引入“写主实例”。
* 规模建议：≤ 50k 用户、≤ 10k 应用、≤ 1M 投票/年（超出建议切换 DB）。
* 并发建议：≤ 300 rps（读多写少场景更高）。

### 35.13 测试与 CI 调整

* 移除 CI 中的 `postgres` 服务；改为 `STORAGE=file`。
* 增加**崩溃恢复测试**：模拟写入中断后，重启回放验证状态正确。

### 35.14 程序片段（Node.js FileRepo 写入示例）

```ts
import { promises as fs } from 'fs';
import path from 'path';
const dir = process.env.DATA_DIR || './data';
async function append(collection:string, record:any){
  const p = path.join(dir, `${collection}.jsonl`);
  const line = JSON.stringify(record) + '
';
  const fh = await fs.open(p, 'a');
  try { await fh.appendFile(line); await fh.sync(); }
  finally { await fh.close(); }
}
```

### 35.15 UI/文案微调

* 设置页新增**存储后端**只读显示：`FileDB (local)`；
* 状态页标注“单机演示模式”。

### 35.16 与既有章节的改动清单

* 覆盖：25.1 的“数据库：PostgreSQL 15”→“可插拔；默认 FileDB”。
* 25.8/25.10/25.16 提到 Prisma/PG 的地方保留为**后续切换**路径；MVP 代码代理优先生成 `FileRepo` 实现（见 35.7/35.14）。
* 8 节“数据模型”不变，仅作为 `data` 对象结构参考。

> 结论：改为 FileDB 后，API/页面/排序/风控等功能无需修改；只需用 Repository 抽象替换 ORM 直接调用，并按 35.3–35.9 实现文件写读、索引与快照即可。