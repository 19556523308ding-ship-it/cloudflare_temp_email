# Jinzhai Mail v3 热修复与施工交付说明

日期：2026-10-24（北京时间）
依据：《Jinzhai Mail v3 热修复施工单（P1-A / P1-B）》与《内容炉接入 mail.jinzhai.icu — 执行方案 v2（定版）》

## 1. 本次修复与基线收敛说明

- **基线版本**：当前生产 Pages 项目 `tempmail`（deployment ID `7e64c628`），生产入口 `index-mailfix-80b6ae91092b.js`。
- **新生产产物**：入口 `index-mailfix-70fb56447010.js`（SHA-256 `4ceace802c86d76f8fd4fc3ad679432bf7e203275830d55daa0c28ff17d57eb8`）。
- **P1-A 实现**：在创建接口返回凭证后，立即保存 `jwt` 并派发 `authenticated` 事件关闭创建窗。后续 `getSettings()` 与 `bindUserAddress()` 异步执行，失败仅弹出非阻塞警告并支持重试，绝不重复调用 `new_address`；同时引入 `mailBusy` 互斥锁，杜绝并发连击导致的多次建址。
- **P1-B 实现**：在打开删除模态框瞬间通过 `mailOpenDelete` 锁定 `target = { address, credential }`，弹窗展示固定的 `target.address`；API 请求包装器底层支持 `addressJwt` 参数，在指纹采集前完成 Authorization 头锁定；删除成功后仅清理 target 对应的凭证与缓存，保留当前活动邮箱与用户主账号。

## 2. 部署指南

```bash
cd deploy
# 1. 运行回归测试（14项全过）
node --test tests/hotfix.test.cjs

# 2. 部署至 Cloudflare Pages 预览分支
npx wrangler@4.131.1 pages deploy pages-hotfix --project-name tempmail --branch fix-mailbox-v3

# 3. 验收通过后发布生产分支
npx wrangler@4.131.1 pages deploy pages-hotfix --project-name tempmail --branch main
```

## 3. 回滚方案

- 若上线后需回滚，在 Cloudflare Pages 控制台中将活动部署回滚到上一个稳定 deployment `7e64c628`。
- 注：用户已确认删除的邮箱无法通过前端回滚恢复。
