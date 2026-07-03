import { getAppData, type AppData } from "../../lib/supabase-data";

export default async function DashboardPage() {
  const data = await getAppData();
  const taskStats = getMyTaskStats(data);

  return (
    <div className="content content-dashboard">
      <h1>ダッシュボード</h1>
      <p className="lead">現在のプロジェクト状況と本日のスケジュールを確認しましょう</p>
      <div className="stats">
        <Stat label="完了したタスク" value={String(taskStats.completed)} note="件" />
        <Stat label="進行中のタスク" value={String(taskStats.inProgress)} note="件" />
        <Stat label="期限超過したタスク" value={String(taskStats.overdue)} note="件" danger={taskStats.overdue > 0} />
      </div>
      <div className="dashboard-grid">
        <section className="panel kanban-small">
          <h3>タスク管理</h3>
          <EmptyState title="タスクデータは未接続です" text="tasksテーブル追加後にカンバンを表示します。" />
        </section>
        <aside className="dash-right">
          <section className="panel progress-card">
            <h3>進捗管理</h3>
            <EmptyState title="進捗データは未接続です" text="project_progress_snapshotsテーブル追加後に表示します。" />
          </section>
          <section className="panel workload">
            <h3>稼働状況</h3>
            <EmptyState title="稼働データは未接続です" />
          </section>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, note, danger }: { label: string; value: string; note: string; danger?: boolean }) {
  return (
    <div className="stat">
      <small>{label}</small>
      <strong className={danger ? "danger" : ""}>{value}</strong>
      <span>{note}</span>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="empty state-empty">
      <b>{title}</b>
      {text ? <small>{text}</small> : null}
    </div>
  );
}

function getMyTaskStats(data: AppData) {
  const currentUser = data.users[0];
  const today = formatDateOnly(new Date());
  const myTasks = currentUser
    ? data.tasks.filter((task) => task.assigned_user_id === currentUser.id)
    : [];

  return {
    completed: myTasks.filter((task) => task.status === 2).length,
    inProgress: myTasks.filter((task) => task.status === 1).length,
    overdue: myTasks.filter((task) => {
      return task.status !== 2 && Boolean(task.due_date) && task.due_date! < today;
    }).length,
  };
}

function formatDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
