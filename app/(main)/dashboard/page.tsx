import Link from "next/link";
import { requireAuth } from "../../lib/auth";
import { getAppData, type AppData, type TaskRow } from "../../lib/supabase-data";

export default async function DashboardPage() {
  const [currentUser, data] = await Promise.all([requireAuth(), getAppData()]);
  const today = formatDateOnly(new Date());
  const myTasks = getMyTasks(data, currentUser.id);
  const taskStats = getMyTaskStats(myTasks, today);

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
          {myTasks.length ? (
            <div className="max-h-[520px] overflow-y-auto">
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

function TaskItem({ data, task, today }: { data: AppData; task: TaskRow; today: string }) {
  const project = data.projects.find((item) => item.id === task.project_id);
  const isOverdue = task.status !== 2 && Boolean(task.due_date) && task.due_date! < today;

  return (
    <Link
      href={`/tasks?projectId=${task.project_id}`}
      className="-mt-px block border border-line first:mt-0 transition-colors hover:bg-[#f5f7fa] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
      aria-label={`${task.title}のカンバンボードを開く`}
    >
      <article className="px-6 py-[18px]">
        <div className="flex items-start justify-between gap-5">
          <h4 className="m-0 text-[15px] font-medium leading-6">{task.title}</h4>
          <time
            dateTime={task.due_date ?? undefined}
            className={`shrink-0 whitespace-nowrap text-[13px] ${isOverdue ? "font-bold text-red" : "text-[#596171]"}`}
          >
            {formatDisplayDate(task.due_date)}
          </time>
        </div>
        <p className="mt-1 mb-0 text-xs text-[#667085]">{project?.title ?? "プロジェクト未設定"}</p>
      </article>
    </Link>
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

function getMyTaskStats(myTasks: TaskRow[], today: string) {
  return {
    completed: myTasks.filter((task) => task.status === 2).length,
    inProgress: myTasks.filter((task) => task.status === 1).length,
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
  if (!value) return "期限なし";
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${year}/${month}/${day}`;
}

function formatDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
