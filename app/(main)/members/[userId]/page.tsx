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
      <div className="mx-auto max-w-[1000px] px-6 pt-8 pb-[90px]">
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
    <div className="mx-auto max-w-[1000px] px-6 pt-8 pb-[90px]">
      <h1 className="m-0 text-[32px] font-medium">{user.name}</h1>
      <p className="mt-1 mb-[34px] text-base text-[#596171]">{user.email}</p>
      <div className="mt-[72px] mb-16 grid grid-cols-2 gap-6">
        <div className="rounded-[10px] border border-line bg-white p-[22px_26px]">
          <small>学年</small>
          <p className="m-0 mt-1 text-xl">{user.grade}年生</p>
        </div>
        <div className="rounded-[10px] border border-line bg-white p-[22px_26px]">
          <small>クラス</small>
          <p className="m-0 mt-1 text-xl">{className(data, user.class_id)}</p>
        </div>
      </div>
      <section className="mt-16">
        <h2 className="border-b border-line pb-2.5 text-xl font-medium">▣ 参加プロジェクト</h2>
        {projects.length ? projects.map(({ relation, project }) => (
          <p className="grid min-h-20 grid-cols-[24px_1fr_auto] items-center border-b border-[#d8deea]" key={project.id}>
            <span className="h-2 w-2 rounded-full bg-primary" />
            {project.title}
            <mark className="bg-[#dbeafe] text-[#23364d]">{projectRole(relation.role)}</mark>
          </p>
        )) : <EmptyState title="参加プロジェクトは未登録です" />}
        <footer className="flex justify-end gap-4 pt-6">
          <button className="h-12 min-w-[150px] rounded-[7px] border border-line bg-white">プロフィールを編集</button>
          <button className="inline-flex h-12 min-w-[150px] items-center justify-center rounded-[7px] border border-line bg-white px-5 font-bold text-white">変更を保存</button>
        </footer>
      </section>
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
