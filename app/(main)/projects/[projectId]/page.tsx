import Link from "next/link";
import { addProjectMemberAction } from "../../../lib/actions";
import { projectRoles, taskStatuses } from "../../../lib/domain";
import {
  getAppData,
  type AppData,
  type ProjectMemberRow,
  type UserRow,
} from "../../../lib/supabase-data";
import { AddMemberModal } from "../add-member-modal";

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
  const memberUserIds = new Set(members.map(({ user }) => user.id));
  const availableUsers = data.users.filter((user) => !memberUserIds.has(user.id));
  const projectTasks = [...data.tasks]
    .filter((task) => task.project_id === project.id)
    .sort((a, b) => {
      if (a.status === 0 && b.status !== 0) return -1;
      if (a.status !== 0 && b.status === 0) return 1;
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });

  return (
    <div className="mx-auto max-w-[880px] px-6 pt-8 pb-[90px]">
      <div className="grid grid-cols-[1fr_280px] gap-[30px] max-[900px]:block">
        <div>
          <h1 className="mb-9 text-[38px] font-medium">{project.title}</h1>
          <section className="rounded-lg border border-line bg-paper">
            <h3 className="m-0 border-b border-line px-[22px] py-2.5 text-base font-bold text-[#101828]">タスク</h3>
            {projectTasks.length ? (
              <>
                <div className="grid min-h-[34px] grid-cols-[2fr_84px_84px_120px] items-center border-b border-[#d8deea] bg-[#f3f3f3] px-[22px] text-xs font-bold text-[#596171]">
                  <span>タスク名</span>
                  <span>ステータス</span>
                  <span>担当者</span>
                  <span>期限</span>
                </div>
                {projectTasks.slice(0, 5).map((task) => (
                  <div
                    className="grid min-h-[58px] grid-cols-[2fr_84px_84px_120px] items-center border-b border-[#d8deea] px-[22px] text-[13px] last:border-b-0"
                    key={task.id}
                  >
                    <span className="font-medium text-[#101828]">{task.title}</span>
                    <span><mark>{taskStatusLabel(task.status)}</mark></span>
                    <span>{taskAssigneeName(data, task.assigned_user_id)}</span>
                    <span>{formatDate(task.due_date)}</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="p-[22px]">
                <EmptyState title="タスクは未登録です" text="タスク一覧から作成できます。" />
              </div>
            )}
            <div className="px-[22px] py-2.5">
              <Link
                className="inline-flex h-8 min-w-[118px] items-center justify-center rounded-[3px] border border-line bg-white px-3.5 text-xs text-[#263142]"
                href={`/tasks?projectId=${project.id}`}
              >
                カンバンボード
              </Link>
            </div>
          </section>
          <section className="mt-[22px] rounded-lg border border-line bg-paper p-[28px_22px_20px]">
            <h3>進捗管理</h3>
            <div className="grid min-h-[220px] place-items-center border border-dashed border-line text-center text-[#596171]">project_progress_snapshots テーブル追加後に表示します。</div>
          </section>
        </div>
        <aside className="mt-12 max-[900px]:mt-4">
          <section className="rounded-lg border border-line bg-paper p-6">
            <h2 className="m-0 mb-1.5 text-xs font-bold tracking-wide text-[#596171] uppercase">概要</h2>
            <p className="text-[15px] text-[#344054]">{project.description || "説明は未登録です。"}</p>
            <h2 className="mt-6 mb-1.5 border-t border-[#e0e4eb] pt-6 text-xs font-bold tracking-wide text-[#596171] uppercase">目標</h2>
            <p className="text-[15px] text-[#344054]">{project.goal}</p>
            <h2 className="mt-6 mb-1.5 border-t border-[#e0e4eb] pt-6 text-xs font-bold tracking-wide text-[#596171] uppercase">リンク</h2>
            <LinkOrEmpty href={project.doc_url} label="ドキュメント" />
            <LinkOrEmpty href={project.repository_url} label="リポジトリ" />
          </section>
          <section className="mt-[22px] rounded-lg border border-line bg-paper p-6">
            <h3>チームメンバー <span className="float-right rounded-full bg-[#e5e7eb] px-2 text-xs">{members.length}名</span></h3>
            {members.length ? members.map(({ relation, user }) => (
              <p className="border-b border-[#d8deea] py-3.5" key={user.id}>
                {user.name}<b className="float-right">{projectRole(relation.role)}</b>
              </p>
            )) : <EmptyState title="参加メンバーは未登録です" />}
            <AddMemberModal>
              {availableUsers.length ? (
                <form action={addProjectMemberAction}>
                  <input type="hidden" name="project_id" value={project.id} />
                  <div className="grid gap-[18px]">
                    <label>メンバー *
                      <select name="user_id" required defaultValue="">
                        <option value="">選択してください</option>
                        {availableUsers.map((user) => (
                          <option value={user.id} key={user.id}>{user.name}</option>
                        ))}
                      </select>
                    </label>
                    <label>役割
                      <select name="role" defaultValue="1">
                        {Object.entries(projectRoles).map(([value, label]) => (
                          <option value={value} key={value}>{label}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="mt-[18px] flex justify-end">
                    <button className="inline-flex h-12 min-w-[140px] items-center justify-center rounded-[7px] border-0 bg-primary px-5 font-bold text-white">追加する</button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-[#596171]">追加できるメンバーがいません（全員このプロジェクトに参加済みです）。</p>
              )}
            </AddMemberModal>
          </section>
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
  return href ? (
    <p><a href={href}>{label}</a></p>
  ) : (
    <p className="flex">
      <span className="inline-block w-24 shrink-0 whitespace-nowrap text-right">{label}</span>
      <span className="shrink-0">:</span>
      <span className="ml-1">未登録</span>
    </p>
  );
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
