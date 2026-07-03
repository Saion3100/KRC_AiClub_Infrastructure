import { projectRoles } from "../../../lib/domain";
import {
  getAppData,
  type AppData,
  type ProjectMemberRow,
  type ProjectRow,
} from "../../../lib/supabase-data";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const data = await getAppData();
  const user = findUser(data, userId);
  if (!user) {
    return (
      <div className="content content-members">
        <EmptyState title="表示できるメンバーがありません" text="メンバーを登録してください。" />
      </div>
    );
  }

  const projects = data.projectMembers
    .filter((member) => member.user_id === user.id)
    .map((member) => ({
      relation: member,
      project: data.projects.find((project) => project.id === member.project_id),
    }))
    .filter((item): item is { relation: ProjectMemberRow; project: ProjectRow } => Boolean(item.project));

  return (
    <div className="content content-members">
      <h1>{user.name}</h1><p className="lead">{user.email}</p>
      <div className="info-cards">
        <div><small>学年</small><p>{user.grade}年生</p></div>
        <div><small>クラス</small><p>{className(data, user.class_id)}</p></div>
      </div>
      <section className="project-list">
        <h2>▣ 参加プロジェクト</h2>
        {projects.length ? projects.map(({ relation, project }) => (
          <p key={project.id}><span />{project.title}<mark>{projectRole(relation.role)}</mark></p>
        )) : <EmptyState title="参加プロジェクトは未登録です" />}
        <footer><button>プロフィールを編集</button><button className="primary">変更を保存</button></footer>
      </section>
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

function findUser(data: AppData, userId: string) {
  const id = Number(userId);
  return data.users.find((user) => user.id === id) ?? data.users[0];
}

function className(data: AppData, classId: number) {
  return data.classes.find((item) => item.id === classId)?.name ?? "-";
}

function projectRole(role: number) {
  return projectRoles[role as keyof typeof projectRoles] ?? "メンバー";
}
