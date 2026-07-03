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
      <div className="content content-project">
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
    <div className="content content-project">
      <div className="detail-layout">
        <div>
          <h1>{project.title}</h1>
          <section className="panel task-table">
            <h3>タスク</h3>
            {projectTasks.length ? (
              <>
                <div className="task-table-head">
                  <span>タイトル</span>
                  <span>担当</span>
                  <span>状態</span>
                  <span>期限</span>
                </div>
                {projectTasks.slice(0, 5).map((task) => (
                  <div className="task-table-row" key={task.id}>
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
            <Link className="outline" href={`/tasks?projectId=${project.id}`}>タスク一覧へ</Link>
          </section>
          <section className="panel chart">
            <h3>進捗管理</h3>
            <div>project_progress_snapshots テーブル追加後に表示します。</div>
          </section>
          <section className="panel members-mini">
            <h3>チームメンバー <span>{members.length}名</span></h3>
            {members.length ? members.map(({ relation, user }) => (
              <p key={user.id}>
                {user.name}<b>{projectRole(relation.role)}</b>
              </p>
            )) : <EmptyState title="参加メンバーは未登録です" />}
            <Link href="/members/new">メンバー追加</Link>
          </section>
        </div>
        <aside className="about">
          <h2>About</h2>
          <p>{project.description || "説明は未登録です。"}</p>
          <h2>Goal</h2>
          <p>{project.goal}</p>
          <h2>Links</h2>
          <LinkOrEmpty href={project.doc_url} label="ドキュメント" />
          <LinkOrEmpty href={project.repository_url} label="リポジトリ" />
        </aside>
      </div>
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
