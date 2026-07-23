export const projectAffiliations = ["個人", "学校", "会社"] as const;

export const projectStatuses = {
  0: "設計",
  1: "コーディング",
  2: "テスト",
  3: "リリース",
  4: "終了",
  5: "中断",
} as const;

export const projectRoles = {
  0: "リーダー",
  1: "メンバー",
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
