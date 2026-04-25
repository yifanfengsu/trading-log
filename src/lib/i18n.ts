import type {
  MetricId,
  ReviewId,
  SidebarMenuId,
} from "@/lib/mock-data";
import type { TradeSetup, TradeSide, TradeStatus } from "@/lib/trade-types";

export type Locale = "zh" | "en";

export const LANGUAGE_STORAGE_KEY = "trade-journal-locale";

export interface Dictionary {
  appTitle: string;
  pageTitle: string;
  appSubtitle: string;
  periodRange: string;
  previousPeriod: string;
  basedOnCurrentTrades: string;
  monthLabel: string;
  monthlyLabel: string;
  allAccounts: string;
  allMarkets: string;
  allStrategies: string;
  addTrade: string;
  chooseMetric: string;
  lineChart: string;
  emptyState: string;
  reviewDate: string;
  promo: {
    title: string;
    subtitle: string;
  };
  menu: Record<SidebarMenuId, string>;
  metrics: Record<
    MetricId,
    {
      label: string;
      helper: string;
    }
  >;
  calendar: {
    title: string;
    weekdays: string[];
    summary: {
      totalPnl: string;
      winningDays: string;
      losingDays: string;
      bestDay: string;
    };
  };
  review: {
    title: string;
    pnlSummary: {
      daily: string;
      weekly: string;
      monthly: string;
    };
    items: Record<
      ReviewId,
      {
        label: string;
        body: string;
      }
    >;
  };
  equityCurve: {
    title: string;
    xAxisTicks: Record<string, string>;
  };
  strategyPerformance: {
    title: string;
    subtitle: string;
    viewAll: string;
    strategy: string;
    netPnl: string;
    winRate: string;
    profitFactor: string;
  };
  recentTrades: {
    title: string;
    subtitle: string;
    viewAll: string;
    columns: {
      time: string;
      symbol: string;
      side: string;
      setup: string;
      entry: string;
      exit: string;
      risk: string;
      pnl: string;
      rMultiple: string;
      status: string;
      actions: string;
    };
    edit: string;
    delete: string;
  };
  strategies: Record<TradeSetup, string>;
  side: Record<TradeSide, string>;
  status: Record<TradeStatus, string>;
  tradeForm: {
    addTitle: string;
    editTitle: string;
    saveTrade: string;
    saveChanges: string;
    cancel: string;
    closeTime: string;
    symbol: string;
    side: string;
    setup: string;
    entryPrice: string;
    exitPrice: string;
    riskPercent: string;
    netPnl: string;
    rMultiple: string;
    notes: string;
    tags: string;
    symbolPlaceholder: string;
    tagsPlaceholder: string;
    enterSymbol: string;
    enterValidNumber: string;
    requiredFields: string;
    deleteConfirm: string;
  };
  language: {
    zh: string;
    en: string;
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  zh: {
    appTitle: "交易日志",
    pageTitle: "个人交易日志 Dashboard",
    appSubtitle: "个人交易仪表盘",
    periodRange: "2025年5月1日 - 2025年5月31日",
    previousPeriod: "较 4月1日 - 4月30日",
    basedOnCurrentTrades: "基于当前交易数据",
    monthLabel: "2025年5月",
    monthlyLabel: "按月",
    allAccounts: "全部账户",
    allMarkets: "全部市场",
    allStrategies: "全部策略",
    addTrade: "新增交易",
    chooseMetric: "选择指标",
    lineChart: "折线图",
    emptyState: "暂无交易数据",
    reviewDate: "2025年5月31日",
    promo: {
      title: "稳定一致，才有优势。",
      subtitle: "复盘、优化、重复。",
    },
    menu: {
      dashboard: "仪表盘",
      trades: "交易记录",
      calendar: "日历",
      analytics: "数据分析",
      reports: "报告",
      playbook: "交易手册",
      notes: "笔记",
      goals: "目标",
      settings: "设置",
    },
    metrics: {
      netPnl: {
        label: "净盈亏",
        helper: "本月已实现收益表现",
      },
      winRate: {
        label: "胜率",
        helper: "盈利交易占比",
      },
      profitFactor: {
        label: "盈利因子",
        helper: "毛利润 / 毛亏损",
      },
      maxDrawdown: {
        label: "最大回撤",
        helper: "周期内权益回撤峰值",
      },
    },
    calendar: {
      title: "月度盈亏日历",
      weekdays: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      summary: {
        totalPnl: "总盈亏",
        winningDays: "盈利天数",
        losingDays: "亏损天数",
        bestDay: "最佳单日",
      },
    },
    review: {
      title: "今日复盘",
      pnlSummary: {
        daily: "当日盈亏",
        weekly: "本周盈亏",
        monthly: "本月盈亏",
      },
      items: {
        rulesFollowed: {
          label: "执行到位",
          body: "风险控制到位，无报复交易，耐心等待符合计划的机会。",
        },
        mainMistake: {
          label: "主要问题",
          body: "过早平仓 BTC 短线头寸，错失后续行情。",
        },
        marketCondition: {
          label: "市场环境",
          body: "震荡区间，低波动，方向不明，需谨慎。",
        },
        tomorrowFocus: {
          label: "明日重点",
          body: "保持耐心，只做 A+ 级别机会，让盈利奔跑。",
        },
      },
    },
    equityCurve: {
      title: "资金曲线",
      xAxisTicks: {
        "2025-05-01": "5月1日",
        "2025-05-08": "5月8日",
        "2025-05-15": "5月15日",
        "2025-05-22": "5月22日",
        "2025-05-31": "5月31日",
      },
    },
    strategyPerformance: {
      title: "策略表现",
      subtitle: "按策略拆分的月度表现",
      viewAll: "查看全部",
      strategy: "策略",
      netPnl: "净盈亏",
      winRate: "胜率",
      profitFactor: "盈利因子",
    },
    recentTrades: {
      title: "最近交易",
      subtitle: "最近 6 笔已完成交易",
      viewAll: "查看全部交易",
      columns: {
        time: "时间",
        symbol: "交易对",
        side: "方向",
        setup: "策略",
        entry: "入场",
        exit: "出场",
        risk: "风险",
        pnl: "盈亏",
        rMultiple: "R倍数",
        status: "状态",
        actions: "操作",
      },
      edit: "编辑",
      delete: "删除",
    },
    strategies: {
      trendFollowing: "趋势跟随",
      breakout: "突破策略",
      scalping: "剥头皮",
      meanReversion: "均值回归",
      other: "其他",
    },
    side: {
      long: "做多",
      short: "做空",
    },
    status: {
      closed: "已平仓",
    },
    tradeForm: {
      addTitle: "新增交易",
      editTitle: "编辑交易",
      saveTrade: "保存交易",
      saveChanges: "保存修改",
      cancel: "取消",
      closeTime: "平仓时间",
      symbol: "交易对",
      side: "方向",
      setup: "策略",
      entryPrice: "入场价",
      exitPrice: "出场价",
      riskPercent: "风险比例",
      netPnl: "净盈亏",
      rMultiple: "R 倍数",
      notes: "复盘笔记",
      tags: "标签",
      symbolPlaceholder: "请输入交易对",
      tagsPlaceholder: "趋势, 突破",
      enterSymbol: "请输入交易对",
      enterValidNumber: "请输入有效数字",
      requiredFields: "请填写所有必填项",
      deleteConfirm: "确定要删除这笔交易吗？",
    },
    language: {
      zh: "中文",
      en: "EN",
    },
  },
  en: {
    appTitle: "Trade Journal",
    pageTitle: "Trade Journal Dashboard",
    appSubtitle: "Personal trading workspace",
    periodRange: "May 1 - May 31, 2025",
    previousPeriod: "vs Apr 1 - Apr 30",
    basedOnCurrentTrades: "Based on current trades",
    monthLabel: "May 2025",
    monthlyLabel: "Monthly",
    allAccounts: "All Accounts",
    allMarkets: "All Markets",
    allStrategies: "All Strategies",
    addTrade: "Add Trade",
    chooseMetric: "Choose metric",
    lineChart: "Line",
    emptyState: "No trade data yet",
    reviewDate: "May 31, 2025",
    promo: {
      title: "Consistency is an edge.",
      subtitle: "Review. Improve. Repeat.",
    },
    menu: {
      dashboard: "Dashboard",
      trades: "Trades",
      calendar: "Calendar",
      analytics: "Analytics",
      reports: "Reports",
      playbook: "Playbook",
      notes: "Notes",
      goals: "Goals",
      settings: "Settings",
    },
    metrics: {
      netPnl: {
        label: "Net P&L",
        helper: "Realized performance for the month",
      },
      winRate: {
        label: "Win Rate",
        helper: "Share of profitable trades",
      },
      profitFactor: {
        label: "Profit Factor",
        helper: "Gross profit / gross loss",
      },
      maxDrawdown: {
        label: "Max Drawdown",
        helper: "Peak-to-trough equity decline",
      },
    },
    calendar: {
      title: "Monthly P&L Calendar",
      weekdays: [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
      ],
      summary: {
        totalPnl: "Total P&L",
        winningDays: "Winning Days",
        losingDays: "Losing Days",
        bestDay: "Best Day",
      },
    },
    review: {
      title: "Today Review",
      pnlSummary: {
        daily: "Daily P&L",
        weekly: "Weekly P&L",
        monthly: "Monthly P&L",
      },
      items: {
        rulesFollowed: {
          label: "Rules Followed",
          body: "Risk controlled, no revenge trading, waited for planned setups.",
        },
        mainMistake: {
          label: "Main Mistake",
          body: "Exited BTC scalp too early and missed continuation.",
        },
        marketCondition: {
          label: "Market Condition",
          body: "Range-bound, low volatility, unclear direction.",
        },
        tomorrowFocus: {
          label: "Tomorrow Focus",
          body: "Stay patient, take only A+ setups, let winners run.",
        },
      },
    },
    equityCurve: {
      title: "Equity Curve",
      xAxisTicks: {
        "2025-05-01": "May 1",
        "2025-05-08": "May 8",
        "2025-05-15": "May 15",
        "2025-05-22": "May 22",
        "2025-05-31": "May 31",
      },
    },
    strategyPerformance: {
      title: "Strategy Performance",
      subtitle: "Monthly breakdown by setup",
      viewAll: "View all",
      strategy: "Strategy",
      netPnl: "Net P&L",
      winRate: "Win Rate",
      profitFactor: "Profit Factor",
    },
    recentTrades: {
      title: "Recent Trades",
      subtitle: "Latest 6 completed trades",
      viewAll: "View all trades",
      columns: {
        time: "Time",
        symbol: "Symbol",
        side: "Side",
        setup: "Setup",
        entry: "Entry",
        exit: "Exit",
        risk: "Risk",
        pnl: "P&L",
        rMultiple: "R-Multiple",
        status: "Status",
        actions: "Actions",
      },
      edit: "Edit",
      delete: "Delete",
    },
    strategies: {
      trendFollowing: "Trend Following",
      breakout: "Breakout",
      scalping: "Scalping",
      meanReversion: "Mean Reversion",
      other: "Other",
    },
    side: {
      long: "Long",
      short: "Short",
    },
    status: {
      closed: "Closed",
    },
    tradeForm: {
      addTitle: "Add Trade",
      editTitle: "Edit Trade",
      saveTrade: "Save Trade",
      saveChanges: "Save Changes",
      cancel: "Cancel",
      closeTime: "Close Time",
      symbol: "Symbol",
      side: "Side",
      setup: "Setup",
      entryPrice: "Entry Price",
      exitPrice: "Exit Price",
      riskPercent: "Risk %",
      netPnl: "Net P&L",
      rMultiple: "R-Multiple",
      notes: "Notes",
      tags: "Tags",
      symbolPlaceholder: "Enter symbol",
      tagsPlaceholder: "trend, breakout",
      enterSymbol: "Enter symbol",
      enterValidNumber: "Enter a valid number",
      requiredFields: "Fill all required fields",
      deleteConfirm: "Delete this trade?",
    },
    language: {
      zh: "中文",
      en: "EN",
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
