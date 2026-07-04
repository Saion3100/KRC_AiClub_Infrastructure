import { createTaskAction } from "../../lib/actions";
import { taskStatuses } from "../../lib/domain";
import { getAppData, type AppData } from "../../lib/supabase-data";
import { KanbanBoard } from "./kanban-board";
import { TaskFormModal } from "./task-form-modal";

const lanes: Array<{ status: 0 | 1 | 2 }> = [
  { status: 0 },
  { status: 1 },
  { status: 2 },
];

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { projectId } = await searchParams;
  const data = await getAppData();
  const selectedProjectId = findProject(data, projectId)?.id ?? data.projects[0]?.id ?? "";

  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-8 pb-[90px]">
      <div className="flex items-start justify-between gap-5">
        <div>
          <h1 className="m-0 text-[32px] font-medium">タスク一覧</h1>
          <p>tasks テーブルに登録されたタスクを状態別に表示します。</p>
        </div>
        <TaskFormModal>
          <form action={createTaskAction}>
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
        </TaskFormModal>
      </div>
      <div className="mt-6">
        <KanbanBoard data={data} />
      </div>
    </div>
  );
}

function findProject(data: AppData, projectId?: string) {
  const id = Number(projectId);
  return data.projects.find((project) => project.id === id) ?? data.projects[0];
}

function taskStatusLabel(status: number) {
  return taskStatuses[status as keyof typeof taskStatuses] ?? "未設定";
}
