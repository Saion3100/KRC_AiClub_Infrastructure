import Link from "next/link";
import type { CSSProperties } from "react";
import { requireAuth } from "../../lib/auth";
import { projectStatuses } from "../../lib/domain";
import {
  getAppData,
  type AppData,
  type ProjectRow,
  type TaskRow,
  type UserRow,
} from "../../lib/supabase-data";
import styles from "./dashboard.module.css";

export default async function DashboardPage() {
  const [currentUser, data] = await Promise.all([requireAuth(), getAppData()]);
  const today = formatDateOnly(new Date());

  if (currentUser.appRole === "admin") {
    return <AdminDashboard data={data} today={today} />;
  }

  return <MemberDashboard data={data} today={today} userId={currentUser.id} />;
}

function AdminDashboard({ data, today }: { data: AppData; today: string }) {
  const stats = getAdminProjectStats(data, today);
  const projects = getProjectsByReleaseDate(data.projects);
  const inactiveUsers = getInactiveUsers(data);

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.title}>ダッシュボード</h1>
      <p className={styles.subtitle}>全プロジェクトとメンバーの状況を確認しましょう</p>
      <div className={styles.statsGrid}>
        <Stat label="問題なし" value={String(stats.healthy)} note="プロジェクト" />
        <Stat
          label="期限超過タスクあり"
          value={String(stats.withOverdueTasks)}
          note="プロジェクト"
          danger={stats.withOverdueTasks > 0}
        />
        <Stat
          label="リリース日期限超過"
          value={String(stats.withOverdueRelease)}
          note="プロジェクト"
          danger={stats.withOverdueRelease > 0}
        />
      </div>
      <div className={`${styles.contentGrid} ${styles.adminContent}`}>
        <section className={`${styles.card} ${styles.scrollCard}`}>
          <h3 className={styles.cardHeader}>タスク管理</h3>
          {projects.length ? (
            <div className={styles.scrollArea}>
              {projects.map((project) => (
                <ProjectItem project={project} today={today} key={project.id} />
              ))}
            </div>
          ) : data.error ? (
            <EmptyState title="プロジェクトを読み込めませんでした" text="時間をおいて、もう一度お試しください。" />
          ) : (
            <EmptyState title="プロジェクトはありません" text="プロジェクトが作成されると、ここに表示されます。" />
          )}
        </section>
        <aside className={`${styles.sidebar} ${styles.adminSidebar}`}>
          <section className={`${styles.card} ${styles.progressCard}`}>
            <h3 className={styles.plainCardHeader}>進捗管理</h3>
            <AttendancePlaceholder />
          </section>
          <section className={`${styles.card} ${styles.scrollCard} ${styles.activityCard}`}>
            <h3 className={styles.cardHeader}>稼働状況</h3>
            {inactiveUsers.length ? (
              <div className={styles.inactiveUserList}>
                {inactiveUsers.map((user) => (
                  <InactiveUserItem user={user} key={user.id} />
                ))}
              </div>
            ) : data.error ? (
              <EmptyState title="ユーザーを読み込めませんでした" />
            ) : (
              <EmptyState title="未稼働ユーザーはいません" />
            )}
          </section>
        </aside>
      </div>
    </div>
  );
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

function ProjectItem({ project, today }: { project: ProjectRow; today: string }) {
  const releaseDate = dateOnly(project.object_published);
  const isReleaseOverdue = Boolean(releaseDate) && releaseDate! < today;

  return (
    <Link
      href={`/projects/${project.id}`}
      className={styles.projectLink}
      aria-label={`${project.title}の詳細を開く`}
    >
      <article className={styles.projectItem}>
        <h4 className={styles.projectTitle}>{project.title}</h4>
        <div className={styles.releaseDate}>
          <span className={styles.fieldLabel}>リリース期限</span>
          <time
            dateTime={releaseDate ?? undefined}
            className={isReleaseOverdue ? styles.dangerText : undefined}
          >
            {formatDisplayDate(project.object_published)}
          </time>
        </div>
        <span
          className={`${styles.statusBadge} ${projectStatusClass(project.status)}`}
        >
          {projectStatus(project.status)}
        </span>
      </article>
    </Link>
  );
}

function AttendancePlaceholder() {
  return (
    <div className={styles.attendanceBody}>
      <div
        className={styles.attendanceChart}
        role="img"
        aria-label="出席率は未集計です"
      >
        <div className={styles.chartInner}>
          <div>
            <strong className={`${styles.chartValue} ${styles.attendanceValue}`}>--%</strong>
            <span className={styles.attendanceLabel}>出席率</span>
          </div>
        </div>
      </div>
      <p className={styles.attendanceCaption}>出席データは未接続です</p>
    </div>
  );
}

function InactiveUserItem({ user }: { user: UserRow }) {
  return (
    <Link
      href={`/members/${user.id}`}
      className={styles.inactiveUserLink}
    >
      <span className={styles.userAvatar}>
        {user.name.slice(0, 1)}
      </span>
      <span className={styles.userDetails}>
        <strong className={styles.userName}>{user.name}</strong>
        <small className={styles.userState}>タスク未割り当て</small>
      </span>
    </Link>
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

function getAdminProjectStats(data: AppData, today: string) {
  const overdueTaskProjectIds = new Set(
    data.tasks
      .filter((task) => task.status !== 2 && Boolean(task.due_date) && dateOnly(task.due_date)! < today)
      .map((task) => task.project_id),
  );
  const overdueReleaseProjectIds = new Set(
    data.projects
      .filter((project) => {
        const releaseDate = dateOnly(project.object_published);
        return Boolean(releaseDate) && releaseDate! < today;
      })
      .map((project) => project.id),
  );

  return {
    healthy: data.projects.filter(
      (project) => !overdueTaskProjectIds.has(project.id) && !overdueReleaseProjectIds.has(project.id),
    ).length,
    withOverdueTasks: overdueTaskProjectIds.size,
    withOverdueRelease: overdueReleaseProjectIds.size,
  };
}

function getProjectsByReleaseDate(projects: ProjectRow[]) {
  return [...projects].sort((left, right) => {
    const leftDate = dateOnly(left.object_published);
    const rightDate = dateOnly(right.object_published);
    if (!leftDate && !rightDate) return left.created_at.localeCompare(right.created_at);
    if (!leftDate) return 1;
    if (!rightDate) return -1;
    return leftDate.localeCompare(rightDate);
  });
}

function getInactiveUsers(data: AppData) {
  const assignedUserIds = new Set(
    data.tasks
      .map((task) => task.assigned_user_id)
      .filter((userId): userId is number => userId !== null),
  );

  return data.users
    .filter((user) => !assignedUserIds.has(user.id))
    .sort((left, right) => left.name.localeCompare(right.name, "ja"));
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

function projectStatus(status: number) {
  return projectStatuses[status as keyof typeof projectStatuses] ?? "未設定";
}

function projectStatusClass(status: number) {
  if (status === 4) return styles.statusComplete;
  if (status === 5) return styles.statusPaused;
  if (status === 2 || status === 3) return styles.statusTesting;
  return styles.statusActive;
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
