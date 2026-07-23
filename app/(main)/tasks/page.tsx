import Link from "next/link";
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
  const assignableUsers = projectMemberUsers(data, selectedProjectId);

  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-8 pb-[90px]">
      <div className="flex items-start justify-between gap-5">
        <div>
          {selectedProjectId ? (
            <Link
              className="mb-1.5 inline-flex items-center gap-1 text-sm text-[#596171] hover:text-blue"
              href={`/projects/${selectedProjectId}`}
            >
              ← プロジェクトへ戻る
            </Link>
          ) : null}
          <h1 className="m-0 text-[32px] font-medium">タスク一覧</h1>
        </div>
        <TaskFormModal>
          <form action={createTaskAction}>
            <input type="hidden" name="project_id" value={selectedProjectId} />
            <div className="grid grid-cols-3 gap-[18px]">
              <label>担当者
                <select name="assigned_user_id" defaultValue="">
                  <option value="">未設定</option>
                  {assignableUsers.map((user) => (
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
              <label>期限<input name="due_date" type="date" /></label>
              <label className="col-span-full">タイトル *<input name="title" required placeholder="タスク名を入力" /></label>
              <label className="col-span-full">説明<textarea name="description" placeholder="必要な作業内容や補足を入力" style={{ minHeight: "90px" }} /></label>
              <label>開始予定<input name="start_time" type="datetime-local" /></label>
              <label>終了予定<input name="end_time" type="datetime-local" /></label>
            </div>
            <div className="mt-[18px] flex justify-end">
              <button className="inline-flex h-12 min-w-[140px] items-center justify-center rounded-[7px] border-0 bg-primary px-5 font-bold text-white hover:bg-blue">タスクを追加</button>
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

function projectMemberUsers(data: AppData, projectId: number | "") {
  if (!projectId) return [];
  const memberIds = new Set(
    data.projectMembers.filter((member) => member.project_id === projectId).map((member) => member.user_id),
  );
  return data.users.filter((user) => memberIds.has(user.id));
}

function taskStatusLabel(status: number) {
  return taskStatuses[status as keyof typeof taskStatuses] ?? "未設定";
}
