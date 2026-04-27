import type { Note } from "@/lib/note-types";
import {
  getCurrentMonthKey,
  getMonthRangeFromMonthKey,
  pad2,
} from "@/lib/utils";

function getSeedDateKey(baseMonthKey: string, day: number) {
  const range = getMonthRangeFromMonthKey(baseMonthKey);
  const monthKey = range.startDate.slice(0, 7);
  const endDay = Number(range.endDate.slice(8, 10));

  return `${monthKey}-${pad2(Math.min(day, endDay))}`;
}

export function getSeedNotes(baseMonthKey = getCurrentMonthKey()): Note[] {
  const day20 = getSeedDateKey(baseMonthKey, 20);
  const day28 = getSeedDateKey(baseMonthKey, 28);
  const day30 = getSeedDateKey(baseMonthKey, 30);
  const monthEnd = getMonthRangeFromMonthKey(baseMonthKey).endDate;

  return [
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
      createdAt: `${day20}T09:00:00.000`,
      updatedAt: `${monthEnd}T18:30:00.000`,
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
      link: { type: "date", date: monthEnd },
      createdAt: `${monthEnd}T10:45:00.000`,
      updatedAt: `${monthEnd}T11:10:00.000`,
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
      link: { type: "date", date: monthEnd },
      createdAt: `${monthEnd}T13:15:00.000`,
      updatedAt: `${monthEnd}T13:15:00.000`,
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
      createdAt: `${day28}T16:20:00.000`,
      updatedAt: `${day30}T09:40:00.000`,
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
      createdAt: `${monthEnd}T17:20:00.000`,
      updatedAt: `${monthEnd}T17:20:00.000`,
    },
  ];
}

export const seedNotes: Note[] = getSeedNotes();
