import { getAppData, type AppData } from "../../lib/supabase-data";

export default async function DashboardPage() {
  const data = await getAppData();
  const taskStats = getMyTaskStats(data);

  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-8 pb-[90px]">
      <h1 className="m-0 text-[32px] font-medium">ダッシュボード</h1>
      <p className="mt-1 mb-[34px] text-base text-[#596171]">現在のプロジェクト状況と本日のスケジュールを確認しましょう</p>
      <div className="mb-[30px] grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
        <Stat label="完了したタスク" value={String(taskStats.completed)} note="件" />
        <Stat label="進行中のタスク" value={String(taskStats.inProgress)} note="件" />
        <Stat label="期限超過したタスク" value={String(taskStats.overdue)} note="件" danger={taskStats.overdue > 0} />
      </div>
      <div className="grid grid-cols-[2fr_298px] gap-8 max-[900px]:block">
        <section className="rounded-lg border border-line bg-paper">
          <h3 className="m-0 border-b border-line bg-[#e3e8f0] px-6 py-[18px] text-base">タスク管理</h3>
          <EmptyState title="タスクデータは未接続です" text="tasksテーブル追加後にカンバンを表示します。" />
        </section>
        <aside className="max-[900px]:mt-4">
          <section className="rounded-lg border border-line bg-paper text-center pb-6">
            <h3 className="m-0 px-6 py-[18px] text-base">進捗管理</h3>
            <EmptyState title="進捗データは未接続です" text="project_progress_snapshotsテーブル追加後に表示します。" />
          </section>
          <section className="mt-8 rounded-lg border border-line bg-paper px-6 pt-[18px] pb-6">
            <h3 className="m-0 pb-[14px] text-base">稼働状況</h3>
            <EmptyState title="稼働データは未接続です" />
          </section>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, note, danger }: { label: string; value: string; note: string; danger?: boolean }) {
  return (
    <div className="min-h-[108px] rounded-lg border border-line bg-paper p-6">
      <small className="block mb-2">{label}</small>
      <strong className={`text-[28px] font-medium ${danger ? "text-red" : "text-blue"}`}>{value}</strong>
      <span className="ml-1.5 text-[13px] text-primary">{note}</span>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="flex min-h-[110px] flex-col items-center justify-center gap-1 border-2 border-dashed border-line text-xs text-[#98a2b3]">
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
