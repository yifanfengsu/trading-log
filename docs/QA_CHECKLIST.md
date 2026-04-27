# 交易日志网站 QA 验收清单

## 1. 启动项目
- 执行 `npm install`（首次）和 `npm run dev`。
- 打开本地地址，确认页面无红屏、无 hydration mismatch。

## 2. 全站路由
- 依次访问 `/`、`/trades`、`/calendar`、`/analytics`、`/reports`、`/playbook`、`/notes`、`/goals`、`/settings`。
- 确认每页都有 Sidebar、TopBar，Sidebar 当前菜单高亮正确。

## 3. 中英文切换
- 在任意页面切换中文 / English。
- 检查菜单、按钮、表头、空状态、抽屉标题、确认文案是否同步切换。

## 4. 交易记录
- 新增、编辑、删除一笔交易。
- 检查金额、百分比、R 倍数、盈利因子显示无 `NaN`、`Infinity`、`undefined`。

## 5. 每日复盘
- 在 `/calendar` 点击日期，新增、编辑、删除当日复盘。
- 确认无交易日期也可以填写复盘。

## 6. Analytics 筛选
- 切换月份、交易对、策略筛选。
- 检查无数据和无筛选结果状态。

## 7. Reports
- 切换周报 / 月报，保存报告。
- 测试复制 Markdown 和下载 Markdown。

## 8. Playbook
- 新增、编辑、归档、恢复策略手册。
- 删除手册后检查关联交易显示“已删除手册 / Deleted playbook”。

## 9. Notes
- 新增、编辑、归档、恢复、置顶笔记。
- 测试关联交易、日期、策略手册；删除关联对象后不应崩溃。

## 10. Goals
- 新增、编辑、暂停、恢复、完成、归档目标。
- 清空交易或复盘后检查自动进度仍显示 0 或合理空状态。

## 11. Settings
- 修改货币和初始资金，确认全站金额立即更新。
- 修改默认交易参数后新增交易，检查默认值。

## 12. 备份与恢复
- 导出备份，确认 JSON 包含 settings、trades、dailyReviews、periodReports、playbooks、notes、goals。
- 导入备份前确认有预览，取消不覆盖，确认导入后本地概览立即更新。
- 测试恢复演示数据和清空全部数据。

## 13. 空状态
- 清空全部数据后访问所有路由。
- 确认页面不崩溃，不出现 `NaN`、`undefined`、`null`、`Infinity` 原样文本。

## 14. 响应式
- 分别检查 1440px、1280px、1024px、768px 以下宽度。
- 确认 TopBar 不溢出，表格可横向滚动，Drawer 不超出屏幕。

## 15. 构建检查
- 执行 `npm run lint`。
- 执行 `npm run build`。
