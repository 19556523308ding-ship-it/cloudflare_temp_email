# Jinzhai Mail v3 验证结果

日期：2026-10-24（北京时间）
基线 deployment ID：`7e64c628`（入口 `index-mailfix-80b6ae91092b.js`，SHA-256 `f07f45429292ab228b75edb7760cff37cf6f643cbd543fc3c15eb8d2e1b24284`）
新产物入口：`index-mailfix-70fb56447010.js`（SHA-256 `4ceace802c86d76f8fd4fc3ad679432bf7e203275830d55daa0c28ff17d57eb8`）

| 检查项 | 测试范围 | 结果 |
|---|---|---|
| 完成通知关闭弹窗 | 创建及登录成功派发 authenticated 并关闭弹窗 | ✔ 通过 |
| 真实删除接口与缓存清理 | 调用 DELETE /api/delete_address，仅清理目标邮箱缓存 | ✔ 通过 |
| 服务端拒绝保持凭据与弹窗 | 403 / 500 报错时保留凭证与删除窗 | ✔ 通过 |
| 假成功不清理状态 | success: false 时不误报、不清空凭证 | ✔ 通过 |
| 重复确认防抖 | 并发点击只产生 1 次网络请求 | ✔ 通过 |
| 功能禁用不发请求 | enableUserDeleteEmail: false 时不调用 API | ✔ 通过 |
| 删除等待期间切换邮箱 | 异步等待时不误清当前新选中的邮箱 | ✔ 通过 |
| 产物接线完整性 | 无未定义事件处理器，正确绑定 mailDelete / mailDone | ✔ 通过 |
| 编译产物创建完成派发 | 真实提取编译产物函数，测试创建成功通知 | ✔ 通过 |
| 编译产物创建失败处理 | 真实提取编译产物函数，测试失败不误报成功 | ✔ 通过 |
| **T-A1 (P1-A)** | 创建 200 + getSettings 500：凭据保留、弹窗关闭、提示刷新失败 | ✔ 通过 |
| **T-A2 (P1-A)** | 创建操作独立互斥（mailBusy）：并发点击只发 1 次 new_address 请求 | ✔ 通过 |
| **T-B1 (P1-B)** | 异步指纹延迟期间切换全局 JWT：DELETE Authorization 仍为目标 A 凭证 | ✔ 通过 |
| **T-B2 (P1-B)** | 确认窗固定 target A：删除 A 成功后当前选中 B 保持完好，账号保留 | ✔ 通过 |

全量 14 项自动化回归测试全部通过（14/14 pass, 0 fail）。
