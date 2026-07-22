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
        <Stat label="今日が期限のタスク" value={String(taskStats.dueToday)} note="件" danger={taskStats.dueToday > 0} />
        <Stat label="未完了のタスク" value={String(taskStats.incomplete)} note="件" />
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
            <ProgressChart
              total={myTasks.length}
              completed={taskStats.completed}
              inProgress={taskStats.inProgress}
            />
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
            期限：{formatDisplayDate(task.due_date)}
          </time>
        </div>
        <p className="mt-2 mb-0 line-clamp-2 text-[13px] leading-5 text-[#596171]">
          {task.description || "概要なし"}
        </p>
        <p className="mt-1.5 mb-0 text-xs text-[#667085]">
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

  return (
    <div className="px-6 pt-1">
      <div
        className="mx-auto grid h-[148px] w-[148px] place-items-center rounded-full"
        style={{
          background: `conic-gradient(#0046a8 0 ${completedRate}%, #f6c344 ${completedRate}% ${inProgressEnd}%, #e5e9f0 ${inProgressEnd}% 100%)`,
        }}
        role="img"
        aria-label={`タスク進捗率 ${progress}%`}
      >
        <div className="grid h-[106px] w-[106px] place-items-center rounded-full bg-white">
          <strong className="text-[28px] font-medium text-blue">{progress}%</strong>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#596171]">
        <span className="inline-flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-primary not-italic" />
          完了 {completed}件
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-[#f6c344] not-italic" />
          進行中 {inProgress}件
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-[#e5e9f0] not-italic" />
          未着手 {notStarted}件
        </span>
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
