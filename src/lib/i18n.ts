import type {
  MetricId,
  ReviewId,
  SidebarMenuId,
} from "@/lib/mock-data";
import type {
  GoalCategory,
  GoalDirection,
  GoalMetric,
  GoalPeriodType,
  GoalStatus,
  GoalUnit,
} from "@/lib/goal-types";
import type { NoteLink, NoteStatus, NoteType } from "@/lib/note-types";
import type { PlaybookStatus } from "@/lib/playbook-types";
import type { ReviewEmotion } from "@/lib/review-types";
import type { TradeSetup, TradeSide, TradeStatus } from "@/lib/trade-types";

export type Locale = "zh" | "en";

export const LANGUAGE_STORAGE_KEY = "trade-journal-locale";

export interface Dictionary {
  appTitle: string;
  pageTitle: string;
  appSubtitle: string;
  basedOnCurrentTrades: string;
  monthlyLabel: string;
  allAccounts: string;
  allMarkets: string;
  allStrategies: string;
  addTrade: string;
  chooseMetric: string;
  lineChart: string;
  emptyState: string;
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
  calendarPage: {
    title: string;
    subtitle: string;
    previousMonth: string;
    nextMonth: string;
    monthlyPnl: string;
    tradingDays: string;
    winningDays: string;
    losingDays: string;
    reviewedDays: string;
    monthlyInsights: string;
    bestDay: string;
    worstDay: string;
    avgDailyPnl: string;
    reviewCompletion: string;
    reviewed: string;
    notReviewed: string;
    noTrades: string;
    trades: string;
    tradeCount: string;
    dailyStats: string;
    tradesOnThisDay: string;
    noTradesOnThisDay: string;
    dailyReview: string;
    saveReview: string;
    deleteReview: string;
    clear: string;
    deleteReviewConfirm: string;
    rulesFollowed: string;
    mainMistake: string;
    marketCondition: string;
    tomorrowFocus: string;
    emotion: string;
    executionScore: string;
    notes: string;
    rulesFollowedPlaceholder: string;
    mainMistakePlaceholder: string;
    marketConditionPlaceholder: string;
    tomorrowFocusPlaceholder: string;
    noDailyReview: string;
    editReview: string;
    noDataForMonth: string;
    winRate: string;
    profitFactor: string;
    avgR: string;
    dailyPnl: string;
    close: string;
    emotions: Record<ReviewEmotion, string>;
  };
  analyticsPage: {
    title: string;
    subtitle: string;
    month: string;
    allSymbols: string;
    setupPerformance: string;
    longVsShort: string;
    symbolPerformance: string;
    weekdayPerformance: string;
    rMultipleDistribution: string;
    tagImpact: string;
    reviewBehaviorInsights: string;
    topWinnersLosers: string;
    topWinners: string;
    topLosers: string;
    avgR: string;
    maxDrawdown: string;
    trades: string;
    tag: string;
    noTagData: string;
    noReviewData: string;
    reviewedTradingDays: string;
    unreviewedTradingDays: string;
    reviewedDaysPnl: string;
    unreviewedDaysPnl: string;
    averageExecutionScore: string;
    emotion: string;
    reviewedDays: string;
    avgDailyPnl: string;
    avgScore: string;
    rMultipleInsight: string;
    noTradeData: string;
    noFilterData: string;
    noWinningTrades: string;
    noLosingTrades: string;
    weekdays: string[];
  };
  reportsPage: {
    title: string;
    subtitle: string;
    weekly: string;
    monthly: string;
    reportType: string;
    period: string;
    saveReport: string;
    copyMarkdown: string;
    downloadMarkdown: string;
    copied: string;
    saved: string;
    reportPreview: string;
    copyMarkdownHint: string;
    noTradeData: string;
    summary: string;
    keyWins: string;
    keyMistakes: string;
    lessons: string;
    nextActions: string;
    useSuggestions: string;
    clear: string;
    dailyBreakdown: string;
    setupPerformance: string;
    tagImpact: string;
    savedReports: string;
    noSavedReports: string;
    open: string;
    delete: string;
    deleteConfirm: string;
    type: string;
    titleColumn: string;
    updated: string;
    actions: string;
    corePerformance: string;
    periodReview: string;
    setupBreakdown: string;
    tagBreakdown: string;
    noData: string;
    tradingWeeklyReport: string;
    tradingMonthlyReport: string;
    reviewCompletion: string;
    topWinningTrades: string;
    topLosingTrades: string;
    autoSuggestions: string;
    reviewed: string;
    notReviewed: string;
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
  playbookStatus: Record<PlaybookStatus, string>;
  noteTypes: Record<NoteType, string>;
  noteStatus: Record<NoteStatus, string>;
  noteLinkTypes: Record<NoteLink["type"], string>;
  goalCategories: Record<GoalCategory, string>;
  goalMetrics: Record<GoalMetric, string>;
  goalStatus: Record<GoalStatus, string>;
  goalDirections: Record<GoalDirection, string>;
  goalUnits: Record<GoalUnit, string>;
  goalPeriodTypes: Record<GoalPeriodType, string>;
  playbookPage: {
    title: string;
    subtitle: string;
    newPlaybook: string;
    editPlaybook: string;
    playbook: string;
    playbookPerformance: string;
    noPlaybooksYet: string;
    noLinkedTradesYet: string;
    deletedPlaybook: string;
    none: string;
    activePlaybooks: string;
    archived: string;
    linkedTrades: string;
    avgWinRate: string;
    searchPlaceholder: string;
    allSetups: string;
    allStatuses: string;
    active: string;
    archive: string;
    restore: string;
    view: string;
    edit: string;
    delete: string;
    playbookName: string;
    setupType: string;
    market: string;
    marketPlaceholder: string;
    timeframes: string;
    timeframesPlaceholder: string;
    description: string;
    entryRules: string;
    exitRules: string;
    riskRules: string;
    avoidConditions: string;
    executionChecklist: string;
    required: string;
    savePlaybook: string;
    saveChanges: string;
    nameRequired: string;
    oneRulePerLine: string;
    oneChecklistItemPerLine: string;
    recentLinkedTrades: string;
    topWinningTrade: string;
    topLosingTrade: string;
    deleteConfirm: string;
    archiveConfirm: string;
    selectPlaybook: string;
    tagsPlaceholder: string;
  };
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
    playbook: string;
    notes: string;
    tags: string;
    symbolPlaceholder: string;
    tagsPlaceholder: string;
    enterSymbol: string;
    enterValidNumber: string;
    requiredFields: string;
    deleteConfirm: string;
  };
  tradesPage: {
    title: string;
    subtitle: string;
    totalTrades: string;
    totalPnl: string;
    avgR: string;
    searchSymbol: string;
    allSides: string;
    allSetups: string;
    allResults: string;
    winners: string;
    losers: string;
    startDate: string;
    endDate: string;
    reset: string;
    resetFilters: string;
    noFilterResults: string;
    viewDetails: string;
    actions: string;
    close: string;
    editTrade: string;
    deleteTrade: string;
    notes: string;
    tags: string;
    noNotes: string;
    noTags: string;
    filteredResults: string;
    tradeCountLabel: string;
  };
  notesPage: {
    title: string;
    subtitle: string;
    newNote: string;
    editNote: string;
    saveNote: string;
    saveChanges: string;
    totalNotes: string;
    pinnedNotes: string;
    archived: string;
    linkedNotes: string;
    noNotesYet: string;
    noFilterResults: string;
    searchPlaceholder: string;
    allTypes: string;
    allStatuses: string;
    allLinks: string;
    allTags: string;
    linkedEntity: string;
    titleField: string;
    content: string;
    type: string;
    status: string;
    tags: string;
    pinned: string;
    pin: string;
    unpin: string;
    pinNote: string;
    unpinNote: string;
    archive: string;
    restore: string;
    created: string;
    updated: string;
    linkedTo: string;
    addNote: string;
    noLinkedNotesYet: string;
    deleteConfirm: string;
    deletedTrade: string;
    deletedPlaybook: string;
    trade: string;
    date: string;
    playbook: string;
    selectTrade: string;
    selectPlaybook: string;
    selectDate: string;
    linkType: string;
    tradeNoteTitle: string;
    dateNoteTitle: string;
    playbookNoteTitle: string;
    titleRequired: string;
    linkRequired: string;
  };
  goalsPage: {
    title: string;
    subtitle: string;
    newGoal: string;
    editGoal: string;
    saveGoal: string;
    saveChanges: string;
    totalGoals: string;
    activeGoals: string;
    achieved: string;
    atRisk: string;
    avgProgress: string;
    noGoalsYet: string;
    noFilterResults: string;
    searchPlaceholder: string;
    allCategories: string;
    allStatuses: string;
    allMetrics: string;
    allPeriods: string;
    resetFilters: string;
    pause: string;
    resume: string;
    markComplete: string;
    goalTitle: string;
    category: string;
    metric: string;
    direction: string;
    targetValue: string;
    currentValue: string;
    remaining: string;
    unit: string;
    periodType: string;
    startDate: string;
    endDate: string;
    description: string;
    notes: string;
    manualCurrentValue: string;
    titleRequired: string;
    invalidTargetValue: string;
    startDateRequired: string;
    endDateRequired: string;
    endDateBeforeStart: string;
    goalDetails: string;
    progress: string;
    completed: string;
    notCompleted: string;
    normal: string;
    warning: string;
    exceeded: string;
    riskGuardrails: string;
    noActiveRiskGoals: string;
    deleteConfirm: string;
    periodTrades: string;
    periodNetPnl: string;
    periodWinRate: string;
    periodReviewCompletion: string;
    relatedData: string;
    current: string;
    target: string;
    limit: string;
    status: string;
    view: string;
    edit: string;
    delete: string;
    archive: string;
    restore: string;
    saved: string;
    noData: string;
  };
  settingsPage: {
    title: string;
    subtitle: string;
    preferences: string;
    language: string;
    currency: string;
    startingBalance: string;
    saveSettings: string;
    resetDefaults: string;
    resetPreferencesConfirm: string;
    tradeDefaults: string;
    defaultSymbol: string;
    defaultSide: string;
    defaultSetup: string;
    defaultRiskPercent: string;
    saveDefaults: string;
    localDataOverview: string;
    currentCurrency: string;
    dataManagement: string;
    exportBackup: string;
    importBackup: string;
    confirmImport: string;
    exportedAt: string;
    invalidBackupFile: string;
    importReplaceConfirm: string;
    exported: string;
    imported: string;
    restoreDemoData: string;
    restoreDemoDataConfirm: string;
    dangerZone: string;
    clearTrades: string;
    clearDailyReviews: string;
    clearPeriodReports: string;
    clearAllData: string;
    clearTradesConfirm: string;
    clearDailyReviewsConfirm: string;
    clearPeriodReportsConfirm: string;
    clearAllDataConfirm: string;
    irreversible: string;
    tradesCount: string;
    dailyReviewsCount: string;
    periodReportsCount: string;
    playbooksCount: string;
    notesCount: string;
    goalsCount: string;
    clearPlaybooks: string;
    clearNotes: string;
    clearGoals: string;
    clearPlaybooksConfirm: string;
    clearNotesConfirm: string;
    clearGoalsConfirm: string;
    backupIncludesPlaybooks: string;
    backupIncludesNotes: string;
    backupIncludesGoals: string;
    chooseBackupFile: string;
    restoreData: string;
    backupAndRestore: string;
    settingsSaved: string;
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
    basedOnCurrentTrades: "基于当前交易数据",
    monthlyLabel: "按月",
    allAccounts: "全部账户",
    allMarkets: "全部市场",
    allStrategies: "全部策略",
    addTrade: "新增交易",
    chooseMetric: "选择指标",
    lineChart: "折线图",
    emptyState: "暂无交易数据",
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
    calendarPage: {
      title: "日历",
      subtitle: "按日期查看盈亏、交易记录和每日复盘。",
      previousMonth: "上个月",
      nextMonth: "下个月",
      monthlyPnl: "月度盈亏",
      tradingDays: "交易天数",
      winningDays: "盈利天数",
      losingDays: "亏损天数",
      reviewedDays: "已复盘天数",
      monthlyInsights: "本月洞察",
      bestDay: "最佳单日",
      worstDay: "最差单日",
      avgDailyPnl: "平均每日盈亏",
      reviewCompletion: "复盘完成率",
      reviewed: "已复盘",
      notReviewed: "未复盘",
      noTrades: "无交易",
      trades: "笔交易",
      tradeCount: "交易笔数",
      dailyStats: "当天统计",
      tradesOnThisDay: "当天交易",
      noTradesOnThisDay: "当天没有交易",
      dailyReview: "每日复盘",
      saveReview: "保存复盘",
      deleteReview: "删除复盘",
      clear: "清空",
      deleteReviewConfirm: "确定要删除这条复盘吗？",
      rulesFollowed: "执行到位",
      mainMistake: "主要问题",
      marketCondition: "市场环境",
      tomorrowFocus: "明日重点",
      emotion: "情绪状态",
      executionScore: "执行评分",
      notes: "其他笔记",
      rulesFollowedPlaceholder: "今天哪些规则执行得好？",
      mainMistakePlaceholder: "今天最大的问题或错误是什么？",
      marketConditionPlaceholder: "今天的市场环境如何？",
      tomorrowFocusPlaceholder: "明天最重要的执行重点是什么？",
      noDailyReview: "还没有填写当日复盘。",
      editReview: "编辑复盘",
      noDataForMonth: "暂无本月数据",
      winRate: "胜率",
      profitFactor: "盈利因子",
      avgR: "平均 R",
      dailyPnl: "当日盈亏",
      close: "关闭",
      emotions: {
        calm: "平静",
        confident: "自信",
        anxious: "焦虑",
        greedy: "贪婪",
        frustrated: "沮丧",
        tired: "疲惫",
        neutral: "中性",
      },
    },
    analyticsPage: {
      title: "数据分析",
      subtitle: "从策略、交易对、方向、时间和行为维度分析交易表现。",
      month: "月份",
      allSymbols: "全部交易对",
      setupPerformance: "按策略表现",
      longVsShort: "做多 vs 做空",
      symbolPerformance: "按交易对表现",
      weekdayPerformance: "按星期表现",
      rMultipleDistribution: "R 倍数分布",
      tagImpact: "标签影响",
      reviewBehaviorInsights: "复盘行为洞察",
      topWinnersLosers: "最大盈利 / 最大亏损",
      topWinners: "最大盈利",
      topLosers: "最大亏损",
      avgR: "平均 R",
      maxDrawdown: "最大回撤",
      trades: "交易数",
      tag: "标签",
      noTagData: "暂无标签数据",
      noReviewData: "暂无复盘数据",
      reviewedTradingDays: "已复盘交易日",
      unreviewedTradingDays: "未复盘交易日",
      reviewedDaysPnl: "已复盘日盈亏",
      unreviewedDaysPnl: "未复盘日盈亏",
      averageExecutionScore: "平均执行评分",
      emotion: "情绪状态",
      reviewedDays: "复盘天数",
      avgDailyPnl: "平均每日盈亏",
      avgScore: "平均评分",
      rMultipleInsight: "检查亏损是否集中在 -1R 以下，盈利是否能覆盖亏损。",
      noTradeData: "暂无交易数据",
      noFilterData: "没有符合筛选条件的数据",
      noWinningTrades: "暂无盈利交易",
      noLosingTrades: "暂无亏损交易",
      weekdays: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    },
    reportsPage: {
      title: "报告",
      subtitle: "自动生成周报和月报，沉淀周期复盘结论。",
      weekly: "周报",
      monthly: "月报",
      reportType: "报告类型",
      period: "周期",
      saveReport: "保存报告",
      copyMarkdown: "复制 Markdown",
      downloadMarkdown: "下载 Markdown",
      copied: "已复制",
      saved: "已保存",
      reportPreview: "报告预览",
      copyMarkdownHint: "可以复制 Markdown 后粘贴到你的复盘文档。",
      noTradeData: "当前周期暂无交易数据。",
      summary: "总结",
      keyWins: "做得好的地方",
      keyMistakes: "主要问题",
      lessons: "经验教训",
      nextActions: "下周期行动计划",
      useSuggestions: "使用自动建议",
      clear: "清空",
      dailyBreakdown: "每日表现",
      setupPerformance: "策略表现",
      tagImpact: "标签影响",
      savedReports: "已保存报告",
      noSavedReports: "暂无已保存报告",
      open: "打开",
      delete: "删除",
      deleteConfirm: "确定要删除这份报告吗？",
      type: "类型",
      titleColumn: "标题",
      updated: "更新时间",
      actions: "操作",
      corePerformance: "核心表现",
      periodReview: "周期复盘",
      setupBreakdown: "策略分解",
      tagBreakdown: "标签分解",
      noData: "暂无数据",
      tradingWeeklyReport: "交易周报",
      tradingMonthlyReport: "交易月报",
      reviewCompletion: "复盘完成率",
      topWinningTrades: "最大盈利交易",
      topLosingTrades: "最大亏损交易",
      autoSuggestions: "使用最新数据生成的自动建议",
      reviewed: "已复盘",
      notReviewed: "未复盘",
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
    playbookStatus: {
      active: "启用",
      archived: "已归档",
    },
    noteTypes: {
      general: "普通笔记",
      marketObservation: "市场观察",
      tradeIdea: "交易想法",
      mistake: "错误记录",
      rule: "交易规则",
      strategy: "策略优化",
      review: "复盘笔记",
    },
    noteStatus: {
      active: "启用",
      archived: "已归档",
    },
    noteLinkTypes: {
      none: "无关联",
      trade: "关联交易",
      date: "关联日期",
      playbook: "关联策略手册",
    },
    goalCategories: {
      performance: "表现",
      risk: "风控",
      process: "流程",
      behavior: "行为",
      custom: "自定义",
    },
    goalMetrics: {
      netPnl: "净盈亏",
      winRate: "胜率",
      profitFactor: "盈利因子",
      avgR: "平均 R",
      maxDrawdownPercent: "最大回撤",
      maxDailyLoss: "最大单日亏损",
      totalTrades: "交易次数",
      reviewCompletionRate: "复盘完成率",
      reviewedDays: "已复盘天数",
      custom: "自定义",
    },
    goalStatus: {
      active: "启用",
      paused: "暂停",
      completed: "已达成",
      archived: "已归档",
    },
    goalDirections: {
      atLeast: "至少达到",
      atMost: "不超过",
    },
    goalUnits: {
      currency: "货币",
      percent: "百分比",
      number: "数字",
      r: "R 倍数",
      trades: "交易笔数",
      days: "天数",
    },
    goalPeriodTypes: {
      weekly: "周度",
      monthly: "月度",
      quarterly: "季度",
      custom: "自定义周期",
    },
    playbookPage: {
      title: "交易手册",
      subtitle: "管理交易策略规则、执行清单，并分析每套策略的真实表现。",
      newPlaybook: "新增策略手册",
      editPlaybook: "编辑策略手册",
      playbook: "策略手册",
      playbookPerformance: "策略手册表现",
      noPlaybooksYet: "暂无策略手册",
      noLinkedTradesYet: "暂无关联交易",
      deletedPlaybook: "已删除手册",
      none: "无",
      activePlaybooks: "启用手册",
      archived: "已归档",
      linkedTrades: "已关联交易",
      avgWinRate: "平均胜率",
      searchPlaceholder: "搜索名称、市场或标签",
      allSetups: "全部策略",
      allStatuses: "全部状态",
      active: "启用",
      archive: "归档",
      restore: "恢复",
      view: "查看",
      edit: "编辑",
      delete: "删除",
      playbookName: "策略名称",
      setupType: "策略类型",
      market: "适用市场",
      marketPlaceholder: "加密货币, 期货, 美股",
      timeframes: "时间周期",
      timeframesPlaceholder: "5分钟, 15分钟, 1小时",
      description: "策略描述",
      entryRules: "入场规则",
      exitRules: "出场规则",
      riskRules: "风控规则",
      avoidConditions: "禁做条件",
      executionChecklist: "执行检查清单",
      required: "必须",
      savePlaybook: "保存手册",
      saveChanges: "保存修改",
      nameRequired: "手册名称不能为空",
      oneRulePerLine: "每行一条规则",
      oneChecklistItemPerLine: "每行一条检查项",
      recentLinkedTrades: "最近关联交易",
      topWinningTrade: "最大盈利交易",
      topLosingTrade: "最大亏损交易",
      deleteConfirm:
        "确定要删除这个策略手册吗？交易记录不会被删除，但会失去手册关联。",
      archiveConfirm: "确定要归档这个策略手册吗？",
      selectPlaybook: "选择策略手册",
      tagsPlaceholder: "动量, A+",
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
      playbook: "策略手册",
      notes: "复盘笔记",
      tags: "标签",
      symbolPlaceholder: "请输入交易对",
      tagsPlaceholder: "趋势, 突破",
      enterSymbol: "请输入交易对",
      enterValidNumber: "请输入有效数字",
      requiredFields: "请填写所有必填项",
      deleteConfirm: "确定要删除这笔交易吗？",
    },
    tradesPage: {
      title: "交易记录",
      subtitle: "查看、筛选和复盘所有已记录的交易。",
      totalTrades: "总交易数",
      totalPnl: "总盈亏",
      avgR: "平均 R",
      searchSymbol: "搜索交易对",
      allSides: "全部方向",
      allSetups: "全部策略",
      allResults: "全部结果",
      winners: "只看盈利",
      losers: "只看亏损",
      startDate: "开始日期",
      endDate: "结束日期",
      reset: "重置筛选",
      resetFilters: "重置筛选",
      noFilterResults: "没有符合筛选条件的交易",
      viewDetails: "查看详情",
      actions: "操作",
      close: "关闭",
      editTrade: "编辑交易",
      deleteTrade: "删除交易",
      notes: "复盘笔记",
      tags: "标签",
      noNotes: "无笔记",
      noTags: "无标签",
      filteredResults: "筛选结果",
      tradeCountLabel: "笔交易",
    },
    notesPage: {
      title: "笔记",
      subtitle: "记录交易想法、市场观察、执行问题和策略优化。",
      newNote: "新增笔记",
      editNote: "编辑笔记",
      saveNote: "保存笔记",
      saveChanges: "保存修改",
      totalNotes: "全部笔记",
      pinnedNotes: "置顶笔记",
      archived: "已归档",
      linkedNotes: "关联笔记",
      noNotesYet: "暂无笔记",
      noFilterResults: "没有符合筛选条件的笔记",
      searchPlaceholder: "搜索标题、内容或标签",
      allTypes: "全部类型",
      allStatuses: "全部状态",
      allLinks: "全部关联",
      allTags: "全部标签",
      linkedEntity: "关联对象",
      titleField: "标题",
      content: "正文",
      type: "类型",
      status: "状态",
      tags: "标签",
      pinned: "置顶",
      pin: "置顶",
      unpin: "取消置顶",
      pinNote: "置顶笔记",
      unpinNote: "取消置顶笔记",
      archive: "归档",
      restore: "恢复",
      created: "创建时间",
      updated: "更新时间",
      linkedTo: "关联到",
      addNote: "添加笔记",
      noLinkedNotesYet: "暂无关联笔记",
      deleteConfirm: "确定要删除这条笔记吗？",
      deletedTrade: "已删除交易",
      deletedPlaybook: "已删除手册",
      trade: "交易",
      date: "日期",
      playbook: "策略手册",
      selectTrade: "选择交易",
      selectPlaybook: "选择策略手册",
      selectDate: "选择日期",
      linkType: "关联类型",
      tradeNoteTitle: "交易笔记",
      dateNoteTitle: "日期笔记",
      playbookNoteTitle: "策略手册笔记",
      titleRequired: "标题不能为空",
      linkRequired: "请选择关联对象",
    },
    goalsPage: {
      title: "目标",
      subtitle: "设定交易目标、风控限制，并跟踪执行进度。",
      newGoal: "新增目标",
      editGoal: "编辑目标",
      saveGoal: "保存目标",
      saveChanges: "保存修改",
      totalGoals: "全部目标",
      activeGoals: "启用目标",
      achieved: "已达成",
      atRisk: "有风险",
      avgProgress: "平均进度",
      noGoalsYet: "暂无目标",
      noFilterResults: "没有符合筛选条件的目标",
      searchPlaceholder: "搜索目标标题或说明",
      allCategories: "全部分类",
      allStatuses: "全部状态",
      allMetrics: "全部指标",
      allPeriods: "全部周期",
      resetFilters: "重置筛选",
      pause: "暂停",
      resume: "恢复",
      markComplete: "标记完成",
      goalTitle: "目标标题",
      category: "分类",
      metric: "指标",
      direction: "方向",
      targetValue: "目标值",
      currentValue: "当前值",
      remaining: "剩余差距",
      unit: "单位",
      periodType: "周期类型",
      startDate: "开始日期",
      endDate: "结束日期",
      description: "说明",
      notes: "备注",
      manualCurrentValue: "自定义当前值",
      titleRequired: "目标标题不能为空",
      invalidTargetValue: "请输入有效数字",
      startDateRequired: "请选择开始日期",
      endDateRequired: "请选择结束日期",
      endDateBeforeStart: "结束日期不能早于开始日期",
      goalDetails: "目标详情",
      progress: "进度",
      completed: "已完成",
      notCompleted: "未完成",
      normal: "正常",
      warning: "警告",
      exceeded: "已超限",
      riskGuardrails: "风控限制",
      noActiveRiskGoals: "暂无启用的风控目标",
      deleteConfirm: "确定要删除这个目标吗？",
      periodTrades: "周期交易数",
      periodNetPnl: "周期净盈亏",
      periodWinRate: "周期胜率",
      periodReviewCompletion: "周期复盘完成率",
      relatedData: "相关数据摘要",
      current: "当前",
      target: "目标",
      limit: "限制",
      status: "状态",
      view: "查看",
      edit: "编辑",
      delete: "删除",
      archive: "归档",
      restore: "恢复",
      saved: "已保存",
      noData: "暂无数据",
    },
    settingsPage: {
      title: "设置",
      subtitle: "配置交易日志偏好、默认交易参数和本地数据备份。",
      preferences: "偏好设置",
      language: "语言",
      currency: "货币显示",
      startingBalance: "初始资金",
      saveSettings: "保存设置",
      resetDefaults: "重置默认",
      resetPreferencesConfirm: "确定要重置偏好设置吗？",
      tradeDefaults: "交易默认值",
      defaultSymbol: "默认交易对",
      defaultSide: "默认方向",
      defaultSetup: "默认策略",
      defaultRiskPercent: "默认风险比例",
      saveDefaults: "保存默认值",
      localDataOverview: "本地数据概览",
      currentCurrency: "当前货币",
      dataManagement: "数据管理",
      exportBackup: "导出备份",
      importBackup: "导入备份",
      confirmImport: "确认导入",
      exportedAt: "导出时间",
      invalidBackupFile: "备份文件无效",
      importReplaceConfirm: "导入会覆盖当前本地数据，确定继续吗？",
      exported: "已导出",
      imported: "已导入",
      restoreDemoData: "恢复演示数据",
      restoreDemoDataConfirm:
        "确定要恢复演示数据吗？这会覆盖当前交易、每日复盘、策略手册、笔记和目标数据。",
      dangerZone: "危险操作",
      clearTrades: "清空交易数据",
      clearDailyReviews: "清空每日复盘",
      clearPeriodReports: "清空周期报告",
      clearAllData: "清空全部数据",
      clearTradesConfirm: "确定要清空所有交易数据吗？此操作不可撤销。",
      clearDailyReviewsConfirm: "确定要清空所有每日复盘吗？此操作不可撤销。",
      clearPeriodReportsConfirm: "确定要清空所有周期报告吗？此操作不可撤销。",
      clearAllDataConfirm:
        "确定要清空全部本地数据吗？这会删除交易、每日复盘、周期报告、策略手册、笔记和目标并重置设置。",
      irreversible: "此操作不可撤销",
      tradesCount: "交易数量",
      dailyReviewsCount: "每日复盘数量",
      periodReportsCount: "周期报告数量",
      playbooksCount: "策略手册数量",
      notesCount: "笔记数量",
      goalsCount: "目标数量",
      clearPlaybooks: "清空策略手册",
      clearNotes: "清空笔记",
      clearGoals: "清空目标",
      clearPlaybooksConfirm: "确定要清空所有策略手册吗？此操作不可撤销。",
      clearNotesConfirm: "确定要清空所有笔记吗？此操作不可撤销。",
      clearGoalsConfirm: "确定要清空所有目标吗？此操作不可撤销。",
      backupIncludesPlaybooks: "策略手册数据会包含在备份文件中",
      backupIncludesNotes: "笔记数据会包含在备份文件中",
      backupIncludesGoals: "目标数据会包含在备份文件中",
      chooseBackupFile: "请选择备份文件",
      restoreData: "恢复数据",
      backupAndRestore: "备份与恢复",
      settingsSaved: "设置已保存",
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
    basedOnCurrentTrades: "Based on current trades",
    monthlyLabel: "Monthly",
    allAccounts: "All Accounts",
    allMarkets: "All Markets",
    allStrategies: "All Strategies",
    addTrade: "Add Trade",
    chooseMetric: "Choose metric",
    lineChart: "Line",
    emptyState: "No trade data yet",
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
    calendarPage: {
      title: "Calendar",
      subtitle: "Review P&L, trades, and daily notes by date.",
      previousMonth: "Previous Month",
      nextMonth: "Next Month",
      monthlyPnl: "Monthly P&L",
      tradingDays: "Trading Days",
      winningDays: "Winning Days",
      losingDays: "Losing Days",
      reviewedDays: "Reviewed Days",
      monthlyInsights: "Monthly Insights",
      bestDay: "Best Day",
      worstDay: "Worst Day",
      avgDailyPnl: "Avg Daily P&L",
      reviewCompletion: "Review Completion",
      reviewed: "Reviewed",
      notReviewed: "Not reviewed",
      noTrades: "No trades",
      trades: "trades",
      tradeCount: "Trades",
      dailyStats: "Daily Stats",
      tradesOnThisDay: "Trades on This Day",
      noTradesOnThisDay: "No trades on this day",
      dailyReview: "Daily Review",
      saveReview: "Save Review",
      deleteReview: "Delete Review",
      clear: "Clear",
      deleteReviewConfirm: "Delete this review?",
      rulesFollowed: "Rules Followed",
      mainMistake: "Main Mistake",
      marketCondition: "Market Condition",
      tomorrowFocus: "Tomorrow Focus",
      emotion: "Emotion",
      executionScore: "Execution Score",
      notes: "Notes",
      rulesFollowedPlaceholder: "Which rules did you follow well today?",
      mainMistakePlaceholder: "What was the biggest mistake today?",
      marketConditionPlaceholder: "What was the market condition today?",
      tomorrowFocusPlaceholder: "What is the key focus for tomorrow?",
      noDailyReview: "No daily review yet.",
      editReview: "Edit Review",
      noDataForMonth: "No data for this month",
      winRate: "Win Rate",
      profitFactor: "Profit Factor",
      avgR: "Avg R",
      dailyPnl: "Daily P&L",
      close: "Close",
      emotions: {
        calm: "Calm",
        confident: "Confident",
        anxious: "Anxious",
        greedy: "Greedy",
        frustrated: "Frustrated",
        tired: "Tired",
        neutral: "Neutral",
      },
    },
    analyticsPage: {
      title: "Analytics",
      subtitle: "Analyze performance by setup, symbol, side, timing, and behavior.",
      month: "Month",
      allSymbols: "All Symbols",
      setupPerformance: "Setup Performance",
      longVsShort: "Long vs Short",
      symbolPerformance: "Symbol Performance",
      weekdayPerformance: "Weekday Performance",
      rMultipleDistribution: "R-Multiple Distribution",
      tagImpact: "Tag Impact",
      reviewBehaviorInsights: "Review Behavior Insights",
      topWinnersLosers: "Top Winners & Losers",
      topWinners: "Top Winners",
      topLosers: "Top Losers",
      avgR: "Avg R",
      maxDrawdown: "Max Drawdown",
      trades: "Trades",
      tag: "Tag",
      noTagData: "No tag data yet",
      noReviewData: "No review data yet",
      reviewedTradingDays: "Reviewed Trading Days",
      unreviewedTradingDays: "Unreviewed Trading Days",
      reviewedDaysPnl: "Reviewed Days P&L",
      unreviewedDaysPnl: "Unreviewed Days P&L",
      averageExecutionScore: "Avg Execution Score",
      emotion: "Emotion",
      reviewedDays: "Reviewed Days",
      avgDailyPnl: "Avg Daily P&L",
      avgScore: "Avg Score",
      rMultipleInsight:
        "Check whether losses cluster below -1R and whether winners cover them.",
      noTradeData: "No trade data yet",
      noFilterData: "No data matches your filters",
      noWinningTrades: "No winning trades",
      noLosingTrades: "No losing trades",
      weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    reportsPage: {
      title: "Reports",
      subtitle: "Generate weekly and monthly reports to capture review insights.",
      weekly: "Weekly",
      monthly: "Monthly",
      reportType: "Report Type",
      period: "Period",
      saveReport: "Save Report",
      copyMarkdown: "Copy Markdown",
      downloadMarkdown: "Download Markdown",
      copied: "Copied",
      saved: "Saved",
      reportPreview: "Report Preview",
      copyMarkdownHint:
        "Copy the Markdown report and paste it into your review document.",
      noTradeData: "No trade data for this period.",
      summary: "Summary",
      keyWins: "What Went Well",
      keyMistakes: "Main Issues",
      lessons: "Lessons",
      nextActions: "Next Actions",
      useSuggestions: "Use Suggestions",
      clear: "Clear",
      dailyBreakdown: "Daily Breakdown",
      setupPerformance: "Setup Performance",
      tagImpact: "Tag Impact",
      savedReports: "Saved Reports",
      noSavedReports: "No saved reports yet",
      open: "Open",
      delete: "Delete",
      deleteConfirm: "Delete this report?",
      type: "Type",
      titleColumn: "Title",
      updated: "Updated",
      actions: "Actions",
      corePerformance: "Core Performance",
      periodReview: "Period Review",
      setupBreakdown: "Setup Breakdown",
      tagBreakdown: "Tag Breakdown",
      noData: "No data",
      tradingWeeklyReport: "Trading Weekly Report",
      tradingMonthlyReport: "Trading Monthly Report",
      reviewCompletion: "Review Completion",
      topWinningTrades: "Top Winning Trades",
      topLosingTrades: "Top Losing Trades",
      autoSuggestions: "Auto suggestions generated from the latest data",
      reviewed: "Reviewed",
      notReviewed: "Not reviewed",
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
    playbookStatus: {
      active: "Active",
      archived: "Archived",
    },
    noteTypes: {
      general: "General",
      marketObservation: "Market Observation",
      tradeIdea: "Trade Idea",
      mistake: "Mistake",
      rule: "Rule",
      strategy: "Strategy",
      review: "Review",
    },
    noteStatus: {
      active: "Active",
      archived: "Archived",
    },
    noteLinkTypes: {
      none: "No Link",
      trade: "Linked Trade",
      date: "Linked Date",
      playbook: "Linked Playbook",
    },
    goalCategories: {
      performance: "Performance",
      risk: "Risk",
      process: "Process",
      behavior: "Behavior",
      custom: "Custom",
    },
    goalMetrics: {
      netPnl: "Net P&L",
      winRate: "Win Rate",
      profitFactor: "Profit Factor",
      avgR: "Avg R",
      maxDrawdownPercent: "Max Drawdown",
      maxDailyLoss: "Max Daily Loss",
      totalTrades: "Total Trades",
      reviewCompletionRate: "Review Completion",
      reviewedDays: "Reviewed Days",
      custom: "Custom",
    },
    goalStatus: {
      active: "Active",
      paused: "Paused",
      completed: "Completed",
      archived: "Archived",
    },
    goalDirections: {
      atLeast: "At least",
      atMost: "At most",
    },
    goalUnits: {
      currency: "Currency",
      percent: "Percent",
      number: "Number",
      r: "R-Multiple",
      trades: "Trades",
      days: "Days",
    },
    goalPeriodTypes: {
      weekly: "Weekly",
      monthly: "Monthly",
      quarterly: "Quarterly",
      custom: "Custom Period",
    },
    playbookPage: {
      title: "Playbook",
      subtitle: "Manage strategy rules, execution checklists, and real performance.",
      newPlaybook: "New Playbook",
      editPlaybook: "Edit Playbook",
      playbook: "Playbook",
      playbookPerformance: "Playbook Performance",
      noPlaybooksYet: "No playbooks yet",
      noLinkedTradesYet: "No linked trades yet",
      deletedPlaybook: "Deleted playbook",
      none: "None",
      activePlaybooks: "Active Playbooks",
      archived: "Archived",
      linkedTrades: "Linked Trades",
      avgWinRate: "Avg Win Rate",
      searchPlaceholder: "Search name, market, or tags",
      allSetups: "All Setups",
      allStatuses: "All Statuses",
      active: "Active",
      archive: "Archive",
      restore: "Restore",
      view: "View",
      edit: "Edit",
      delete: "Delete",
      playbookName: "Playbook Name",
      setupType: "Setup Type",
      market: "Market",
      marketPlaceholder: "Crypto, Futures, US Stocks",
      timeframes: "Timeframes",
      timeframesPlaceholder: "5m, 15m, 1h",
      description: "Description",
      entryRules: "Entry Rules",
      exitRules: "Exit Rules",
      riskRules: "Risk Rules",
      avoidConditions: "Avoid Conditions",
      executionChecklist: "Execution Checklist",
      required: "Required",
      savePlaybook: "Save Playbook",
      saveChanges: "Save Changes",
      nameRequired: "Playbook name is required",
      oneRulePerLine: "One rule per line",
      oneChecklistItemPerLine: "One checklist item per line",
      recentLinkedTrades: "Recent Linked Trades",
      topWinningTrade: "Top Winning Trade",
      topLosingTrade: "Top Losing Trade",
      deleteConfirm:
        "Delete this playbook? Trades will not be deleted, but their playbook link may no longer resolve.",
      archiveConfirm: "Archive this playbook?",
      selectPlaybook: "Select Playbook",
      tagsPlaceholder: "momentum, A+",
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
      playbook: "Playbook",
      notes: "Notes",
      tags: "Tags",
      symbolPlaceholder: "Enter symbol",
      tagsPlaceholder: "trend, breakout",
      enterSymbol: "Enter symbol",
      enterValidNumber: "Enter a valid number",
      requiredFields: "Fill all required fields",
      deleteConfirm: "Delete this trade?",
    },
    tradesPage: {
      title: "Trades",
      subtitle: "Review, filter, and manage all recorded trades.",
      totalTrades: "Total Trades",
      totalPnl: "Total P&L",
      avgR: "Avg R",
      searchSymbol: "Search symbol",
      allSides: "All Sides",
      allSetups: "All Setups",
      allResults: "All Results",
      winners: "Winners",
      losers: "Losers",
      startDate: "Start Date",
      endDate: "End Date",
      reset: "Reset",
      resetFilters: "Reset filters",
      noFilterResults: "No trades match your filters",
      viewDetails: "View Details",
      actions: "Actions",
      close: "Close",
      editTrade: "Edit Trade",
      deleteTrade: "Delete Trade",
      notes: "Notes",
      tags: "Tags",
      noNotes: "No notes",
      noTags: "No tags",
      filteredResults: "Filtered Results",
      tradeCountLabel: "trades",
    },
    notesPage: {
      title: "Notes",
      subtitle:
        "Capture trade ideas, market observations, execution issues, and strategy improvements.",
      newNote: "New Note",
      editNote: "Edit Note",
      saveNote: "Save Note",
      saveChanges: "Save Changes",
      totalNotes: "Total Notes",
      pinnedNotes: "Pinned Notes",
      archived: "Archived",
      linkedNotes: "Linked Notes",
      noNotesYet: "No notes yet",
      noFilterResults: "No notes match your filters",
      searchPlaceholder: "Search title, content, or tags",
      allTypes: "All Types",
      allStatuses: "All Statuses",
      allLinks: "All Links",
      allTags: "All Tags",
      linkedEntity: "Linked Entity",
      titleField: "Title",
      content: "Content",
      type: "Type",
      status: "Status",
      tags: "Tags",
      pinned: "Pinned",
      pin: "Pin",
      unpin: "Unpin",
      pinNote: "Pin Note",
      unpinNote: "Unpin Note",
      archive: "Archive",
      restore: "Restore",
      created: "Created",
      updated: "Updated",
      linkedTo: "Linked To",
      addNote: "Add Note",
      noLinkedNotesYet: "No linked notes yet",
      deleteConfirm: "Delete this note?",
      deletedTrade: "Deleted trade",
      deletedPlaybook: "Deleted playbook",
      trade: "Trade",
      date: "Date",
      playbook: "Playbook",
      selectTrade: "Select Trade",
      selectPlaybook: "Select Playbook",
      selectDate: "Select Date",
      linkType: "Link Type",
      tradeNoteTitle: "Trade Note",
      dateNoteTitle: "Date Note",
      playbookNoteTitle: "Playbook Note",
      titleRequired: "Title is required",
      linkRequired: "Select a linked entity",
    },
    goalsPage: {
      title: "Goals",
      subtitle: "Set trading goals, risk limits, and track execution progress.",
      newGoal: "New Goal",
      editGoal: "Edit Goal",
      saveGoal: "Save Goal",
      saveChanges: "Save Changes",
      totalGoals: "Total Goals",
      activeGoals: "Active Goals",
      achieved: "Achieved",
      atRisk: "At Risk",
      avgProgress: "Avg Progress",
      noGoalsYet: "No goals yet",
      noFilterResults: "No goals match your filters",
      searchPlaceholder: "Search goal title or description",
      allCategories: "All Categories",
      allStatuses: "All Statuses",
      allMetrics: "All Metrics",
      allPeriods: "All Periods",
      resetFilters: "Reset filters",
      pause: "Pause",
      resume: "Resume",
      markComplete: "Mark Complete",
      goalTitle: "Goal Title",
      category: "Category",
      metric: "Metric",
      direction: "Direction",
      targetValue: "Target Value",
      currentValue: "Current Value",
      remaining: "Remaining",
      unit: "Unit",
      periodType: "Period Type",
      startDate: "Start Date",
      endDate: "End Date",
      description: "Description",
      notes: "Notes",
      manualCurrentValue: "Manual Current Value",
      titleRequired: "Goal title is required",
      invalidTargetValue: "Enter a valid number",
      startDateRequired: "Select a start date",
      endDateRequired: "Select an end date",
      endDateBeforeStart: "End date cannot be earlier than start date",
      goalDetails: "Goal Details",
      progress: "Progress",
      completed: "Completed",
      notCompleted: "Not Completed",
      normal: "Normal",
      warning: "Warning",
      exceeded: "Exceeded",
      riskGuardrails: "Risk Guardrails",
      noActiveRiskGoals: "No active risk goals",
      deleteConfirm: "Delete this goal?",
      periodTrades: "Period Trades",
      periodNetPnl: "Period Net P&L",
      periodWinRate: "Period Win Rate",
      periodReviewCompletion: "Period Review Completion",
      relatedData: "Related Data",
      current: "Current",
      target: "Target",
      limit: "Limit",
      status: "Status",
      view: "View",
      edit: "Edit",
      delete: "Delete",
      archive: "Archive",
      restore: "Restore",
      saved: "Saved",
      noData: "No data",
    },
    settingsPage: {
      title: "Settings",
      subtitle: "Configure preferences, trade defaults, and local data backups.",
      preferences: "Preferences",
      language: "Language",
      currency: "Currency",
      startingBalance: "Starting Balance",
      saveSettings: "Save Settings",
      resetDefaults: "Reset Defaults",
      resetPreferencesConfirm: "Reset preferences to defaults?",
      tradeDefaults: "Trade Defaults",
      defaultSymbol: "Default Symbol",
      defaultSide: "Default Side",
      defaultSetup: "Default Setup",
      defaultRiskPercent: "Default Risk %",
      saveDefaults: "Save Defaults",
      localDataOverview: "Local Data Overview",
      currentCurrency: "Current Currency",
      dataManagement: "Data Management",
      exportBackup: "Export Backup",
      importBackup: "Import Backup",
      confirmImport: "Confirm Import",
      exportedAt: "Exported At",
      invalidBackupFile: "Invalid backup file",
      importReplaceConfirm: "Importing will replace your current local data. Continue?",
      exported: "Exported",
      imported: "Imported",
      restoreDemoData: "Restore Demo Data",
      restoreDemoDataConfirm:
        "Restore demo data? This will replace current trades, daily reviews, playbooks, notes, and goals.",
      dangerZone: "Danger Zone",
      clearTrades: "Clear Trades",
      clearDailyReviews: "Clear Daily Reviews",
      clearPeriodReports: "Clear Period Reports",
      clearAllData: "Clear All Data",
      clearTradesConfirm: "Clear all trades? This cannot be undone.",
      clearDailyReviewsConfirm: "Clear all daily reviews? This cannot be undone.",
      clearPeriodReportsConfirm: "Clear all period reports? This cannot be undone.",
      clearAllDataConfirm:
        "Clear all local data? This will delete trades, daily reviews, period reports, playbooks, notes, goals, and reset settings.",
      irreversible: "This action cannot be undone",
      tradesCount: "Trades Count",
      dailyReviewsCount: "Daily Reviews Count",
      periodReportsCount: "Period Reports Count",
      playbooksCount: "Playbooks Count",
      notesCount: "Notes Count",
      goalsCount: "Goals Count",
      clearPlaybooks: "Clear Playbooks",
      clearNotes: "Clear Notes",
      clearGoals: "Clear Goals",
      clearPlaybooksConfirm: "Clear all playbooks? This cannot be undone.",
      clearNotesConfirm: "Clear all notes? This cannot be undone.",
      clearGoalsConfirm: "Clear all goals? This cannot be undone.",
      backupIncludesPlaybooks: "Playbook data will be included in backup files",
      backupIncludesNotes: "Notes data will be included in backup files",
      backupIncludesGoals: "Goals data will be included in backup files",
      chooseBackupFile: "Choose backup file",
      restoreData: "Restore Data",
      backupAndRestore: "Backup & Restore",
      settingsSaved: "Settings saved",
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
