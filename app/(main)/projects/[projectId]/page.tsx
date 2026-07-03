import Link from "next/link";
import { projectRoles, taskStatuses } from "../../../lib/domain";
import {
  getAppData,
  type AppData,
  type ProjectMemberRow,
  type UserRow,
} from "../../../lib/supabase-data";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const data = await getAppData();
  const project = findProject(data, projectId);
  if (!project) {
    return (
      <div className="mx-auto max-w-[880px] px-6 pt-8 pb-[90px]">
        <EmptyState title="表示できるプロジェクトがありません" text="プロジェクトを登録してください。" />
      </div>
    );
  }

  const members = data.projectMembers
    .filter((member) => member.project_id === project.id)
    .map((member) => ({
      relation: member,
      user: data.users.find((user) => user.id === member.user_id),
    }))
    .filter((item): item is { relation: ProjectMemberRow; user: UserRow } => Boolean(item.user));
  const projectTasks = data.tasks.filter((task) => task.project_id === project.id);

  return (
    <div className="mx-auto max-w-[880px] px-6 pt-8 pb-[90px]">
      <div className="grid grid-cols-[1fr_190px] gap-[30px] max-[900px]:block">
        <div>
          <h1 className="mb-9 text-[38px] font-medium">{project.title}</h1>
          <section className="rounded-lg border border-line bg-paper p-[22px]">
            <h3 className="m-0 mb-[18px]">タスク</h3>
            {projectTasks.length ? (
              <>
                <div className="grid min-h-[34px] grid-cols-[2fr_84px_84px_120px] items-center border-b border-[#d8deea] text-xs font-bold text-[#596171]">
                  <span>タイトル</span>
                  <span>担当</span>
                  <span>状態</span>
                  <span>期限</span>
                </div>
                {projectTasks.slice(0, 5).map((task) => (
                  <div
                    className="grid min-h-[50px] grid-cols-[2fr_84px_84px_120px] items-center border-b border-[#d8deea] text-[13px]"
                    key={task.id}
                  >
                    <span>{task.title}</span>
                    <span>{taskAssigneeName(data, task.assigned_user_id)}</span>
                    <span><mark>{taskStatusLabel(task.status)}</mark></span>
                    <span>{formatDate(task.due_date)}</span>
                  </div>
                ))}
              </>
            ) : (
              <EmptyState title="タスクは未登録です" text="タスク一覧から作成できます。" />
            )}
            <Link
              className="mt-5 inline-flex h-[38px] min-w-[118px] items-center justify-center rounded-[3px] border border-line bg-white px-3.5 text-[#263142]"
              href={`/tasks?projectId=${project.id}`}
            >
              タスク一覧へ
            </Link>
          </section>
          <section className="mt-[22px] rounded-lg border border-line bg-paper p-[28px_22px_20px]">
            <h3>進捗管理</h3>
            <div className="grid min-h-[220px] place-items-center border border-dashed border-line text-center text-[#596171]">project_progress_snapshots テーブル追加後に表示します。</div>
          </section>
          <section className="mt-[22px] rounded-lg border border-line bg-paper p-6">
            <h3>チームメンバー <span className="float-right rounded-full bg-[#e5e7eb] px-2 text-xs">{members.length}名</span></h3>
            {members.length ? members.map(({ relation, user }) => (
              <p className="border-b border-[#d8deea] py-3.5" key={user.id}>
                {user.name}<b className="float-right">{projectRole(relation.role)}</b>
              </p>
            )) : <EmptyState title="参加メンバーは未登録です" />}
            <Link className="grid h-11 place-items-center border border-dashed border-[#9aa4b5]" href="/members/new">メンバー追加</Link>
          </section>
        </div>
        <aside className="max-[900px]:mt-4">
          <h2 className="m-0 mb-3.5">About</h2>
          <p className="text-[#60646c]">{project.description || "説明は未登録です。"}</p>
          <h2 className="m-0 mb-3.5">Goal</h2>
          <p className="text-[#60646c]">{project.goal}</p>
          <h2 className="m-0 mb-3.5">Links</h2>
          <LinkOrEmpty href={project.doc_url} label="ドキュメント" />
          <LinkOrEmpty href={project.repository_url} label="リポジトリ" />
        </aside>
      </div>
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

function LinkOrEmpty({ href, label }: { href: string | null; label: string }) {
  return href ? <p><a href={href}>{label}</a></p> : <p>{label}: 未登録</p>;
}

function findProject(data: AppData, projectId: string) {
  const id = Number(projectId);
  return data.projects.find((project) => project.id === id) ?? data.projects[0];
}

function taskAssigneeName(data: AppData, userId: number | null) {
  if (!userId) return "未設定";
  return data.users.find((user) => user.id === userId)?.name ?? "未設定";
}

function projectRole(role: number) {
  return projectRoles[role as keyof typeof projectRoles] ?? "メンバー";
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
