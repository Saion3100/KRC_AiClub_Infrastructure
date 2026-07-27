import Link from "next/link";
import type { CSSProperties } from "react";
import { requireAuth } from "../../lib/auth";
import {
  getAppData,
  type AppData,
  type TaskRow,
} from "../../lib/supabase-data";
import { AdminDashboard } from "./admin-dashboard";
import styles from "./dashboard.module.css";

export default async function DashboardPage() {
  const [currentUser, data] = await Promise.all([requireAuth(), getAppData()]);
  const today = formatDateOnly(new Date());

  if (currentUser.appRole === "admin") {
    return <AdminDashboard data={data} today={today} />;
  }

  return <MemberDashboard data={data} today={today} userId={currentUser.id} />;
}

function MemberDashboard({ data, today, userId }: { data: AppData; today: string; userId: number }) {
  const myTasks = getMyTasks(data, userId);
  const taskStats = getMyTaskStats(myTasks, today);

  return (
    <div className={styles.memberPage}>
      <h1 className={styles.title}>ダッシュボード</h1>
      <p className={styles.subtitle}>現在のプロジェクト状況と本日のスケジュールを確認しましょう</p>
      <div className={styles.statsGrid}>
        <Stat label="今日が期限のタスク" value={String(taskStats.dueToday)} note="件" danger={taskStats.dueToday > 0} />
        <Stat label="未完了のタスク" value={String(taskStats.incomplete)} note="件" />
        <Stat label="期限超過したタスク" value={String(taskStats.overdue)} note="件" danger={taskStats.overdue > 0} />
      </div>
      <div className={styles.contentGrid}>
        <section className={styles.card}>
          <h3 className={styles.cardHeader}>タスク管理</h3>
          {myTasks.length ? (
            <div className={styles.memberTaskList}>
              {myTasks.map((task) => (
                <TaskItem data={data} task={task} today={today} key={task.id} />
              ))}
            </div>
          ) : data.error ? (
            <EmptyState title="タスクを読み込めませんでした" text="時間をおいて、もう一度お試しください。" />
          ) : (
            <EmptyState title="担当タスクはありません" text="タスクが割り当てられると、ここに表示されます。" />
          )}
        </section>
        <aside className={styles.sidebar}>
          <section className={`${styles.card} ${styles.progressCard}`}>
            <h3 className={styles.plainCardHeader}>進捗管理</h3>
            <ProgressChart
              total={myTasks.length}
              completed={taskStats.completed}
              inProgress={taskStats.inProgress}
            />
          </section>
          <section className={`${styles.card} ${styles.memberActivityCard}`}>
            <h3 className={styles.memberActivityTitle}>稼働状況</h3>
            <EmptyState title="稼働データは未接続です" />
          </section>
        </aside>
      </div>
    </div>
  );
}

function TaskItem({ data, task, today }: { data: AppData; task: TaskRow; today: string }) {
  const project = data.projects.find((item) => item.id === task.project_id);
  const isOverdue = task.status !== 2 && Boolean(task.due_date) && task.due_date! < today;

  return (
    <Link
      href={`/tasks?projectId=${task.project_id}`}
      className={styles.taskLink}
      aria-label={`${task.title}のカンバンボードを開く`}
    >
      <article className={styles.taskItem}>
        <div className={styles.taskHeading}>
          <h4 className={styles.taskTitle}>{task.title}</h4>
          <time
            dateTime={task.due_date ?? undefined}
            className={`${styles.taskDueDate} ${isOverdue ? styles.dangerText : ""}`}
          >
            期限：{formatDisplayDate(task.due_date)}
          </time>
        </div>
        <p className={styles.taskDescription}>
          {task.description || "概要なし"}
        </p>
        <p className={styles.taskProject}>
          {project?.title ?? "プロジェクト未設定"}
        </p>
      </article>
    </Link>
  );
}

function ProgressChart({
  total,
  completed,
  inProgress,
}: {
  total: number;
  completed: number;
  inProgress: number;
}) {
  const completedRate = total > 0 ? (completed / total) * 100 : 0;
  const progress = Math.round(completedRate);
  const inProgressRate = total > 0 ? (inProgress / total) * 100 : 0;
  const inProgressEnd = completedRate + inProgressRate;
  const notStarted = Math.max(0, total - completed - inProgress);
  const chartStyle = {
    "--completed-rate": `${completedRate}%`,
    "--in-progress-end": `${inProgressEnd}%`,
  } as CSSProperties;

  return (
    <div className={styles.progressBody}>
      <div
        className={styles.chart}
        style={chartStyle}
        role="img"
        aria-label={`タスク進捗率 ${progress}%`}
      >
        <div className={styles.chartInner}>
          <strong className={styles.chartValue}>{progress}%</strong>
        </div>
      </div>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <i className={`${styles.legendDot} ${styles.completedDot}`} />
          完了 {completed}件
        </span>
        <span className={styles.legendItem}>
          <i className={`${styles.legendDot} ${styles.inProgressDot}`} />
          進行中 {inProgress}件
        </span>
        <span className={styles.legendItem}>
          <i className={`${styles.legendDot} ${styles.notStartedDot}`} />
          未着手 {notStarted}件
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value, note, danger }: { label: string; value: string; note: string; danger?: boolean }) {
  return (
    <div className={styles.stat}>
      <small className={styles.statLabel}>{label}</small>
      <strong className={`${styles.statValue} ${danger ? styles.statDanger : ""}`}>{value}</strong>
      <span className={styles.statNote}>{note}</span>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className={styles.emptyState}>
      <b>{title}</b>
      {text ? <small>{text}</small> : null}
    </div>
  );
}

function getMyTaskStats(myTasks: TaskRow[], today: string) {
  return {
    completed: myTasks.filter((task) => task.status === 2).length,
    inProgress: myTasks.filter((task) => task.status === 1).length,
    dueToday: myTasks.filter((task) => task.status !== 2 && task.due_date === today).length,
    incomplete: myTasks.filter((task) => task.status !== 2).length,
    overdue: myTasks.filter((task) => {
      return task.status !== 2 && Boolean(task.due_date) && task.due_date! < today;
    }).length,
  };
}

function getMyTasks(data: AppData, userId: number) {
  return data.tasks
    .filter((task) => task.assigned_user_id === userId)
    .sort((left, right) => {
      if (!left.due_date && !right.due_date) {
        return left.created_at.localeCompare(right.created_at);
      }
      if (!left.due_date) return 1;
      if (!right.due_date) return -1;
      return left.due_date.localeCompare(right.due_date);
    });
}

function formatDisplayDate(value: string | null) {
  const normalized = dateOnly(value);
  if (!normalized) return "期限なし";
  const [year, month, day] = normalized.split("-");
  if (!year || !month || !day) return value;
  return `${year}/${month}/${day}`;
}

function dateOnly(value: string | null) {
  if (!value) return null;
  const normalized = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null;
}

function formatDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
