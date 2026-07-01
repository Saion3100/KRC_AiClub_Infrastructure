export const projectStatuses = {
  0: "設計",
  1: "進行中",
  2: "レビュー中",
  3: "完了",
  4: "停止",
} as const;

export const projectRoles = {
  0: "閲覧者",
  1: "メンバー",
  2: "リーダー",
  3: "オーナー",
} as const;

export const taskStatuses = {
  0: "未着手",
  1: "進行中",
  2: "完了",
} as const;

export type TaskStatus = keyof typeof taskStatuses;

export type TaskDraft = {
  title: string;
  description?: string;
  projectId?: number;
  assigneeId?: number;
  dueDate?: string;
  status: TaskStatus;
};

export type ProgressSnapshot = {
  projectId: number;
  completedTasks: number;
  totalTasks: number;
  progressRate: number;
  measuredAt: string;
};

export type LtDraft = {
  speaker: string;
  date: string;
  title: string;
  materialUrl?: string;
  category?: string;
  summary: string;
};
