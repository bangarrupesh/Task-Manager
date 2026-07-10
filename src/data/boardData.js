export const PRIORITY = {
  urgent: { label: "Urgent", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  high: { label: "High", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  medium: { label: "Medium", color: "#eab308", bg: "rgba(234,179,8,0.12)" },
  low: { label: "Low", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
};

export const COL_META = {
  todo: { title: "To Do", accent: "#94a3b8" },
  inprogress: { title: "In Progress", accent: "#3b82f6" },
  inreview: { title: "In Review", accent: "#a855f7" },
  done: { title: "Done", accent: "#10b981" },
};

export const LABEL_META = {
  Design: { text: "#a78bfa", bg: "rgba(167,139,250,0.15)" },
  Engineering: { text: "#60a5fa", bg: "rgba(96,165,250,0.15)" },
  Research: { text: "#34d399", bg: "rgba(52,211,153,0.15)" },
  Marketing: { text: "#f472b6", bg: "rgba(244,114,182,0.15)" },
  QA: { text: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
  DevOps: { text: "#fb923c", bg: "rgba(251,146,60,0.15)" },
};

export const SEED_DATA = {
  columnOrder: ["todo", "inprogress", "inreview", "done"],
  columns: {
    todo: {
      id: "todo",
      tasks: [],
    },
    inprogress: {
      id: "inprogress",
      tasks: [],
    },
    inreview: {
      id: "inreview",
      tasks: [],
    },
    done: {
      id: "done",
      tasks: [],
    },
  },
};
