import type { Playbook } from "@/lib/playbook-types";

const seedTimestamp = "2025-05-01T00:00:00.000Z";

export const seedPlaybooks: Playbook[] = [
  {
    id: "seed-playbook-trend-following",
    name: "趋势跟随策略",
    setup: "trendFollowing",
    market: "Crypto Perpetuals",
    timeframes: ["1h", "4h", "1D"],
    description: "顺着高周期主趋势，只在回踩或突破确认后介入，避免在震荡末端追单。",
    entryRules: [
      "价格位于 4H 均线组上方，结构保持更高高点和更高低点。",
      "回踩关键支撑后出现放量反转 K 线。",
      "入场前确认 BTC 或主流市场方向一致。",
    ],
    exitRules: [
      "第一目标到达 1.5R 后减仓并移动止损到成本。",
      "趋势线或关键均线有效跌破时退出剩余仓位。",
      "出现连续放量反向 K 线时主动止盈。",
    ],
    riskRules: [
      "单笔风险不超过账户权益 1%。",
      "止损必须放在结构低点或高点外侧。",
      "同方向相关品种最多同时持有 2 笔。",
    ],
    invalidationRules: [
      "高周期趋势不清晰时不交易。",
      "价格远离均线超过 3 倍 ATR 时不追单。",
      "重大新闻公布前 30 分钟不新开仓。",
    ],
    checklist: [
      {
        id: "seed-trend-checklist-1",
        text: "高周期方向明确",
        required: true,
      },
      {
        id: "seed-trend-checklist-2",
        text: "入场点接近结构支撑或压力",
        required: true,
      },
      {
        id: "seed-trend-checklist-3",
        text: "止损和目标已提前写下",
        required: true,
      },
    ],
    tags: ["趋势", "波段", "A+"],
    status: "active",
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "seed-playbook-breakout",
    name: "突破策略",
    setup: "breakout",
    market: "Crypto, US Stocks",
    timeframes: ["15m", "1h", "4h"],
    description: "等待价格突破明确区间，并通过成交量和回踩确认过滤假突破。",
    entryRules: [
      "突破前至少形成 3 次有效测试的清晰区间。",
      "突破 K 线实体收在区间外，成交量高于近期均值。",
      "优先等待回踩区间边界不破后入场。",
    ],
    exitRules: [
      "目标一设置在区间高度的 1 倍投射位置。",
      "回踩失败并重新跌回区间时立即退出。",
      "盈利超过 2R 后使用结构止盈。",
    ],
    riskRules: [
      "假突破高发时段降低仓位。",
      "止损放在突破 K 线另一侧或回踩结构外。",
      "如果滑点导致风险超过计划，放弃入场。",
    ],
    invalidationRules: [
      "区间过窄或流动性不足时不交易。",
      "突破没有量能配合时不追。",
      "连续两次假突破后暂停同品种交易。",
    ],
    checklist: [
      {
        id: "seed-breakout-checklist-1",
        text: "区间边界清晰",
        required: true,
      },
      {
        id: "seed-breakout-checklist-2",
        text: "突破有量能确认",
        required: true,
      },
      {
        id: "seed-breakout-checklist-3",
        text: "回踩或收盘确认完成",
        required: true,
      },
    ],
    tags: ["突破", "动量", "区间"],
    status: "active",
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "seed-playbook-scalping",
    name: "短线剥头皮",
    setup: "scalping",
    market: "Crypto Perpetuals",
    timeframes: ["1m", "5m", "15m"],
    description: "只做高流动性时段的短线动量，快速确认、快速止损，不持仓过久。",
    entryRules: [
      "盘口流动性充足，点差稳定。",
      "1m 与 5m 方向一致，并出现短线动量突破。",
      "入场位置距离止损足够近，至少具备 1.2R 空间。",
    ],
    exitRules: [
      "达到 0.8R 至 1.2R 可分批止盈。",
      "动量停滞超过 3 根 1m K 线时退出。",
      "触发预设止损必须立即执行。",
    ],
    riskRules: [
      "单笔风险不超过 0.5% 至 0.75%。",
      "连续两笔亏损后暂停 30 分钟。",
      "禁止摊平亏损仓位。",
    ],
    invalidationRules: [
      "点差异常扩大时不交易。",
      "市场快速插针但无结构时不追。",
      "情绪急躁或想追回亏损时不交易。",
    ],
    checklist: [
      {
        id: "seed-scalp-checklist-1",
        text: "点差和深度正常",
        required: true,
      },
      {
        id: "seed-scalp-checklist-2",
        text: "短周期方向一致",
        required: true,
      },
      {
        id: "seed-scalp-checklist-3",
        text: "亏损上限已确认",
        required: true,
      },
    ],
    tags: ["短线", "动量", "纪律"],
    status: "active",
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "seed-playbook-mean-reversion",
    name: "均值回归",
    setup: "meanReversion",
    market: "Crypto, Index Futures",
    timeframes: ["5m", "15m", "1h"],
    description: "在明确震荡环境中交易极端偏离后的回归，避免在强趋势中逆势硬扛。",
    entryRules: [
      "高周期处于区间或低斜率震荡状态。",
      "价格触及区间边界并出现衰竭信号。",
      "RSI 或偏离指标显示短线过热或过冷。",
    ],
    exitRules: [
      "第一目标为区间中轴或均线。",
      "回归速度放缓时主动减仓。",
      "价格有效突破区间边界时止损。",
    ],
    riskRules: [
      "逆势交易必须使用更小仓位。",
      "止损不能因为价格继续偏离而外移。",
      "只在有明确区间边界时执行。",
    ],
    invalidationRules: [
      "单边趋势强劲时不做均值回归。",
      "消息驱动的快速行情不接反向刀口。",
      "区间边界被放量突破后暂停策略。",
    ],
    checklist: [
      {
        id: "seed-mean-checklist-1",
        text: "市场处于震荡环境",
        required: true,
      },
      {
        id: "seed-mean-checklist-2",
        text: "价格触及区间极值",
        required: true,
      },
      {
        id: "seed-mean-checklist-3",
        text: "反转信号和止损位置明确",
        required: true,
      },
    ],
    tags: ["震荡", "回归", "低追高抛"],
    status: "active",
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
];
