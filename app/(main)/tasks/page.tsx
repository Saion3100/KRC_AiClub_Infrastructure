import { createTaskAction, deleteTaskAction, updateTaskStatusAction } from "../../lib/actions";
import { taskStatuses } from "../../lib/domain";
import { getAppData, type AppData, type TaskRow } from "../../lib/supabase-data";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { projectId } = await searchParams;
  const data = await getAppData();
  const lanes: Array<{ status: 0 | 1 | 2; color: string }> = [
    { status: 0, color: "purple" },
    { status: 1, color: "yellow" },
    { status: 2, color: "green" },
  ];
  const selectedProjectId = findProject(data, projectId)?.id ?? data.projects[0]?.id ?? "";

  const laneStyles: Record<string, { bg: string; border: string; dot: string }> = {
    purple: { bg: "bg-[#fbf5ff]", border: "border-[#dab7ff]", dot: "bg-[#9b5cf6]" },
    yellow: { bg: "bg-[#fffde9]", border: "border-[#f6d34a]", dot: "bg-[#d6a800]" },
    green: { bg: "bg-[#f4fff8]", border: "border-[#8be5ad]", dot: "bg-[#a869f5]" },
  };

  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-8 pb-[90px]">
      <div className="flex items-start justify-between gap-5">
        <div>
          <h1 className="m-0 text-[32px] font-medium">タスク一覧</h1>
          <p>tasks テーブルに登録されたタスクを状態別に表示します。</p>
        </div>
      </div>
      <form action={createTaskAction} className="mb-6 rounded-lg border border-line bg-paper p-[22px]">
        <div className="grid grid-cols-3 gap-[18px]">
          <label>プロジェクト *
            <select name="project_id" required defaultValue={selectedProjectId}>
              <option value="">選択してください</option>
              {data.projects.map((project) => (
                <option value={project.id} key={project.id}>{project.title}</option>
              ))}
            </select>
          </label>
          <label>担当者
            <select name="assigned_user_id" defaultValue="">
              <option value="">未設定</option>
              {data.users.map((user) => (
                <option value={user.id} key={user.id}>{user.name}</option>
              ))}
            </select>
          </label>
          <label>状態
            <select name="status" defaultValue="0">
              {lanes.map((lane) => (
                <option value={lane.status} key={lane.status}>{taskStatusLabel(lane.status)}</option>
              ))}
            </select>
          </label>
          <label className="col-span-full">タイトル *<input name="title" required placeholder="タスク名を入力" /></label>
          <label className="col-span-full">説明<textarea name="description" placeholder="必要な作業内容や補足を入力" /></label>
          <label>開始予定<input name="start_time" type="datetime-local" /></label>
          <label>終了予定<input name="end_time" type="datetime-local" /></label>
          <label>期限<input name="due_date" type="date" /></label>
        </div>
        <div className="mt-[18px] flex justify-end">
          <button className="inline-flex h-12 min-w-[140px] items-center justify-center rounded-[7px] border-0 bg-primary px-5 font-bold text-white">タスクを追加</button>
        </div>
      </form>
      <div className="grid grid-cols-3 gap-4">
        {lanes.map((lane) => {
          const tasks = data.tasks.filter((task) => task.status === lane.status);
          const style = laneStyles[lane.color];
          return (
            <section className={`min-h-[818px] rounded-[9px] border px-3 py-4 ${style.bg} ${style.border}`} key={lane.status}>
              <h3 className="m-0 mb-[18px] text-[17px] font-medium">
                <span className={`mr-2.5 inline-block h-2 w-2 rounded-full ${style.dot}`} />
                {taskStatusLabel(lane.status)}
                <em className="ml-2.5 rounded-full bg-[#eef1f4] px-[9px] py-1 not-italic">{tasks.length}</em>
                <b className="float-right">...</b>
              </h3>
              {tasks.length ? tasks.map((task) => (
                <TaskCard data={data} task={task} key={task.id} />
              )) : <EmptyState title="未登録" />}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({ data, task }: { data: AppData; task: TaskRow }) {
  const project = data.projects.find((item) => item.id === task.project_id);
  const nextStatuses = ([0, 1, 2] as const).filter((status) => status !== task.status);

  return (
    <article className="mb-3.5 rounded-[5px] border border-[#d5dbe6] bg-white p-4 shadow-[0_1px_3px_#00000012]">
      <p className="mt-0 text-[17px]">{task.title}</p>
      {task.description ? <small className="mb-3.5 block leading-[1.5] text-[#596171]">{task.description}</small> : null}
      <dl className="my-3.5 grid grid-cols-[72px_1fr] gap-2 text-xs">
        <dt className="text-[#667085]">Project</dt><dd className="m-0">{project?.title ?? "-"}</dd>
        <dt className="text-[#667085]">Assignee</dt><dd className="m-0">{taskAssigneeName(data, task.assigned_user_id)}</dd>
        <dt className="text-[#667085]">Due</dt><dd className="m-0">{formatDate(task.due_date)}</dd>
      </dl>
      <div className="mt-3 flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <form action={updateTaskStatusAction} key={status}>
            <input type="hidden" name="id" value={task.id} />
            <input type="hidden" name="status" value={status} />
            <button className="min-h-[30px] rounded-md border border-[#cbd5e1] bg-white text-xs text-[#263142]">{taskStatusLabel(status)}</button>
          </form>
        ))}
        <form action={deleteTaskAction}>
          <input type="hidden" name="id" value={task.id} />
          <button className="min-h-[30px] rounded-md border border-[#f0b4b4] bg-white text-xs text-red">削除</button>
        </form>
      </div>
    </article>
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

function findProject(data: AppData, projectId?: string) {
  const id = Number(projectId);
  return data.projects.find((project) => project.id === id) ?? data.projects[0];
}

function taskAssigneeName(data: AppData, userId: number | null) {
  if (!userId) return "未設定";
  return data.users.find((user) => user.id === userId)?.name ?? "未設定";
}

function taskStatusLabel(status: number) {
  return taskStatuses[status as keyof typeof taskStatuses] ?? "未設定";
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10).replaceAll("-", "/");
}
