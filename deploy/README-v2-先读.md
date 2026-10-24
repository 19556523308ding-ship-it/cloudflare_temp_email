# Jinzhai Mail v2 源码复核与修复包

日期：2026-10-24。基线：本次上传 v2 包内的 `cloudflare_temp_email-fork` 快照。
状态：源码修复、行为检查和构建验证；没有发布生产、没有修改 GitHub、没有删除线上邮箱。

## 1. v2 更正了什么

上一轮“定制前端源码缺失”说得过宽，现更正为：品牌定制 fork 已在 v2 中补齐，但线上后续改造仍未完全回归这个源码快照。

| 层次 | v2 实际内容 | 本次结论 |
|---|---|---|
| 上游底座 | `cloudflare_temp_email-upstream` | 仅作对照，不用它覆盖线上品牌站 |
| 品牌 fork | 品牌组件、设计 tokens、插画、AddressBar 创建/登录弹窗、API_BASE 配置 | 可以直接进行源代码修复，本次以它为基线 |
| 当前线上产物 | live-dist，入口 index-BnaRHjD7.js | 与上一轮入口 SHA-256 相同；上一轮热修复仍适用 |
| 尚未回归的代码 | SEO 注入、Help/Privacy/Tools 路由、以及新版收件工作区相关组件 | 不能宣称 fork 重建后等价于当前线上 |

包内说明将缺口称为后续 SEO 轮次；实际代码对比还能看到工作区差异：fork 的 Index.vue 是 AddressBar 加 n-tabs，线上产物 Index 是独立首页加新版收件工作区。因而缺口不止几个 meta 标签。

## 2. 这次交付的两条路径

### A. 当前线上快速修复：pages-hotfix

直接部署 `pages-hotfix/`。这是上一轮已验证的保留线上布局的热修复，随 v2 重新提供，核心内容相同，不是假装重新编译出了遗失的定制源码。

- 创建/登录成功关闭首页弹窗。
- 删除按钮连接真实 `/api/delete_address`，先确认、后请求。
- 删除失败保留邮箱，成功清理当前凭证及同地址缓存。
- 修复未定义的新建按钮处理函数，补充窄屏删除入口。
- 改名入口及关联 JS 分块，减少旧缓存引用旧入口。
- 补齐原包缺失的根目录 Workbox 依赖，移除误抓成 HTML 的伪 JS。
- 保留原有品牌、现行页面、API_BASE、SEO 与静态资源。

配置文件 `wrangler.toml` 与 `functions/` 放在包根目录。进入此目录，先预览：

```bash
node --test tests/hotfix.test.cjs
npx wrangler@4.131.1 pages deploy pages-hotfix --project-name tempmail --branch fix-mailbox-v2
```

预览仍连接现有后端，验收只使用新建的专用测试邮箱。预览通过后，在 Cloudflare 控制台确认真实生产分支，用该分支名替换下面的占位符：

```bash
npx wrangler@4.131.1 pages deploy pages-hotfix --project-name tempmail --branch PRODUCTION_BRANCH
```

不要只拖拽静态文件并假定 Functions/绑定自动存在。BACKEND 服务名依据 v2 说明为 `cloudflare-temp-email`。当前前端运行时实际直连 `https://api-mail.jinzhai.icu`，保持该配置。上一轮同源接口的 1101 应另查 Pages Functions 日志，不要把它当作当前按钮缺陷的唯一原因。

发布前记录旧 deployment ID。回滚用 Pages 旧 deployment；无需数据库迁移。用户已确认的永久邮箱删除不能靠前端回滚恢复。

### B. 可维护源码修复：source-overlay

这是本轮新增的重点，针对 v2 的品牌 fork，包含 13 个新增/修改文件及统一 diff。只合并源码，不直接替代当前线上布局。

```bash
python scripts/apply-source-overlay.py /你的路径/cloudflare_temp_email-fork
cd /你的路径/cloudflare_temp_email-fork/frontend
pnpm install --frozen-lockfile
pnpm test
pnpm run build:pages
```

应使用仓库声明的 pnpm 版本。应用脚本先验证全部原文件哈希与补丁完整性，创建源码备份，再应用；若目标有其他修改则停止，不覆盖。已应用时可安全重复运行。也可由工程师审阅 `source-fixes-v2.patch` 后手工合并。

**此处构建出的 frontend/dist 是 fork 预览版，不是线上完整替代版。** 本包不附这个预览 dist，避免误传导致 Help/Privacy/Tools 和新版工作区回退。生产应先用 A 路径，待缺失源码补齐后再合并部署。

## 3. 源码具体修复

| 文件/模块 | 修改 |
|---|---|
| Login.vue | 创建及两种登录方式统一完成处理；成功同步发出 authenticated；阻止重复提交；失败刷新 Turnstile |
| mailbox-lifecycle.js | 创建已成功与后续绑定/刷新失败分开处理，后者只提示；封装删除及缓存清理 |
| AddressBar.vue | 创建、登录、管理弹窗监听完成事件并关闭；收件头部加入明确的新建/删除入口 |
| DeleteMailboxDialog.vue | 共用删除确认窗；显示目标地址；请求期间禁用重复操作；删除功能关闭时不发请求 |
| AccountSettings.vue | 使用共用确认窗，避免两套删除逻辑产生差异 |
| api/index.js | 在异步指纹采集前固定邮箱凭证，支持 addressJwt 参数；显示后端 JSON error 文本 |
| LocalAddress/TelegramAddress/AddressManagement | 将创建/登录完成事件传递给外层弹窗；本地列表不插入空 JWT、不显示无效凭证全文 |
| MailAddressCard.vue | 窄屏头部操作换行，长邮箱可换行，复制按钮至少 44px 高 |
| CHANGELOG.md / CHANGELOG_EN.md | 双语修复记录 |

删除时使用“用户打开确认窗时的邮箱凭证”，并在后端确认 success:true 后才清理。等待期间如果切换到 B 邮箱，删除 A 成功不会清空 B；浏览器缓存写入异常也不会被误报为服务端删除失败。用户账号凭证不被清除。

API 地址权限校验继续由原 Worker 负责，没有以邮箱明文代替认证，没有开放管理员权限。源码只做前端修复，不改 Worker 或 D1 schema。

## 4. 必须完成的上线验收

1. 首页创建专用邮箱：创建窗口关闭，地址正确。
2. 原邮箱凭证登录与密码登录：成功后登录窗口关闭。
3. 管理弹窗内创建：外层管理弹窗也关闭；不是只切换标签页。
4. 创建成功但后续刷新失败：保留已生成凭证，明确提示刷新失败，不诱导再次创建。
5. 删除取消：邮箱和邮件保留。
6. 删除确认：Network 中真实 DELETE 请求及 success:true；旧凭证不能再访问设置/邮件。
7. 保留另一个邮箱 B，删除 A：B 仍可访问，用户账号仍登录。
8. 模拟 401/403/500/网络失败：不显示删除成功，不清理凭证。
9. 360、390、430px：创建/确认窗可操作，长邮箱与头部按钮不挤出视口，软键盘打开后能看到操作区。
10. 现有 /help、/privacy、/tools 及其语言版本仍可访问；robots、sitemap 与关键静态资源正确。

测试数量、构建结果和限制见 `CHECKS-v2.md`。生产创建、收信、删除端到端流程仍待实际验收，本轮没有以静态分析冒充线上操作成功。

## 5. 下一阶段正确收敛方式

- 先将本次 fork 修复提交至你的实际仓库；本轮没有替你推送。
- 找回后续定制源文件，或以当前路由与构建产物为对照重建缺失部分。必须覆盖首页、新版工作区、邮件详情、Help/Privacy/Tools、SEO 与多语言，不要只补 sitemap。
- 在仓库里固定构建脚本、Pages/Worker 分工、API_BASE、提交版本和 deployment ID，禁止手改 dist 后不回写源码。
- Worker 当前按多条 SQL 顺序删除相关数据；后续应单独设计批处理一致性及 Telegram/KV 的失败补偿并测试。不要在本次前端热修复中顺便执行未知 SQL 或轮换 JWT_SECRET。
- 统计真实创建/收信/删除成功率与 UV/PV，不记录邮箱 JWT、正文或验证码；静态首页 200 不等于业务成功。

本包不包含生产密钥，也不需要你提供用户邮箱密码。
