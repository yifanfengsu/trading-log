import type { Note } from "@/lib/note-types";

export const seedNotes: Note[] = [
  {
    id: "seed-note-discipline",
    title: "交易纪律笔记",
    content:
      "每笔交易只承担计划内风险。连续亏损后降低仓位，不在情绪波动时加仓或追单。",
    type: "rule",
    status: "active",
    pinned: true,
    tags: ["discipline", "risk"],
    link: { type: "none" },
    createdAt: "2025-05-20T09:00:00.000Z",
    updatedAt: "2025-05-31T18:30:00.000Z",
  },
  {
    id: "seed-note-btc-breakout",
    title: "BTC 突破观察",
    content:
      "BTC 在关键压力区放量突破，回踩时买盘承接较强。后续需要观察成交量是否持续放大。",
    type: "marketObservation",
    status: "active",
    pinned: false,
    tags: ["BTC", "breakout"],
    link: { type: "date", date: "2025-05-31" },
    createdAt: "2025-05-31T10:45:00.000Z",
    updatedAt: "2025-05-31T11:10:00.000Z",
  },
  {
    id: "seed-note-early-exit",
    title: "提前止盈问题",
    content:
      "盈利后过早关注浮盈回撤，导致没有按计划持有到目标位。下次需要把移动止损规则写清楚。",
    type: "mistake",
    status: "active",
    pinned: false,
    tags: ["exit", "psychology"],
    link: { type: "date", date: "2025-05-31" },
    createdAt: "2025-05-31T13:15:00.000Z",
    updatedAt: "2025-05-31T13:15:00.000Z",
  },
  {
    id: "seed-note-trend-optimization",
    title: "趋势跟随优化",
    content:
      "趋势跟随策略可以加入更明确的分批止盈规则，并把无效回踩的退出条件前置。",
    type: "strategy",
    status: "active",
    pinned: false,
    tags: ["trend", "improvement"],
    link: { type: "none" },
    createdAt: "2025-05-28T16:20:00.000Z",
    updatedAt: "2025-05-30T09:40:00.000Z",
  },
  {
    id: "seed-note-weekly-review-draft",
    title: "周期复盘草稿",
    content:
      "本周执行质量比上周更稳定，但在突破行情中的持仓耐心仍不足。重点复盘 BTC 和 ETH 的出场。",
    type: "review",
    status: "active",
    pinned: false,
    tags: ["weekly", "review"],
    link: { type: "none" },
    createdAt: "2025-05-31T17:20:00.000Z",
    updatedAt: "2025-05-31T17:20:00.000Z",
  },
];
