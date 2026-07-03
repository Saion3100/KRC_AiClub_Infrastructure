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

  return (
    <div className="content content-tasks">
      <div className="board-head">
        <div>
          <h1>タスク一覧</h1>
          <p>tasks テーブルに登録されたタスクを状態別に表示します。</p>
        </div>
      </div>
      <form action={createTaskAction} className="task-create panel">
        <div className="task-create-grid">
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
          <label className="wide">タイトル *<input name="title" required placeholder="タスク名を入力" /></label>
          <label className="wide">説明<textarea name="description" placeholder="必要な作業内容や補足を入力" /></label>
          <label>開始予定<input name="start_time" type="datetime-local" /></label>
          <label>終了予定<input name="end_time" type="datetime-local" /></label>
          <label>期限<input name="due_date" type="date" /></label>
        </div>
        <div className="task-create-actions"><button className="primary">タスクを追加</button></div>
      </form>
      <div className="board task-board">
        {lanes.map((lane) => {
          const tasks = data.tasks.filter((task) => task.status === lane.status);
          return (
            <section className={`lane ${lane.color}`} key={lane.status}>
              <h3><span />{taskStatusLabel(lane.status)}<em>{tasks.length}</em><b>...</b></h3>
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
    <article className="task-card">
      <p>{task.title}</p>
      {task.description ? <small>{task.description}</small> : null}
      <dl>
        <dt>Project</dt><dd>{project?.title ?? "-"}</dd>
        <dt>Assignee</dt><dd>{taskAssigneeName(data, task.assigned_user_id)}</dd>
        <dt>Due</dt><dd>{formatDate(task.due_date)}</dd>
      </dl>
      <div className="task-actions">
        {nextStatuses.map((status) => (
          <form action={updateTaskStatusAction} key={status}>
            <input type="hidden" name="id" value={task.id} />
            <input type="hidden" name="status" value={status} />
            <button>{taskStatusLabel(status)}</button>
          </form>
        ))}
        <form action={deleteTaskAction}>
          <input type="hidden" name="id" value={task.id} />
          <button className="danger-button">削除</button>
        </form>
      </div>
    </article>
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
