import Link from "next/link";
import { projectStatuses } from "../../lib/domain";
import { getAppData, type AppData, type ProjectRow } from "../../lib/supabase-data";

export default async function ProjectsPage() {
  const data = await getAppData();

  return (
    <div className="content content-projects">
      <div className="title-row">
        <div>
          <small>ダッシュボード ＞ <b>プロジェクト一覧</b></small>
          <h1>プロジェクト一覧</h1>
        </div>
        <Link className="primary" href="/projects/new">＋ 新規追加</Link>
      </div>
      {data.projects.length ? (
        <>
          <div className="project-cards">
            {data.projects.slice(0, 3).map((project) => (
              <ProjectCard data={data} project={project} key={project.id} />
            ))}
          </div>
          <h2 className="section-title">詳細リストビュー</h2>
          <section className="table-card">
            <div className="table-head">
              <span>プロジェクト名</span>
              <span>ステータス</span>
              <span>参加人数</span>
              <span>更新日</span>
              <span />
            </div>
            {data.projects.map((project) => (
              <div className="table-row" key={project.id}>
                <span><i>▣</i>{project.title}</span>
                <span><mark>{projectStatus(project.status)}</mark></span>
                <span>{memberCountForProject(data, project.id)}名</span>
                <span>{formatDate(project.updated_at)}</span>
                <Link href={`/projects/${project.id}`}>↗</Link>
              </div>
            ))}
          </section>
        </>
      ) : (
        <EmptyState title="プロジェクトは未登録です" text="新規作成フォームから登録できます。" />
      )}
    </div>
  );
}

function ProjectCard({ data, project }: { data: AppData; project: ProjectRow }) {
  return (
    <article className="project-card">
      <h3>{project.title}</h3>
      <b>⋮</b>
      <p>{project.description || project.goal}</p>
      <dl>
        <dt>参加人数</dt>
        <dd>{memberCountForProject(data, project.id)}人</dd>
        <dt>種別</dt>
        <dd>{project.type}</dd>
      </dl>
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

function memberCountForProject(data: AppData, projectId: number) {
  return data.projectMembers.filter((member) => member.project_id === projectId).length;
}

function projectStatus(status: number) {
  return projectStatuses[status as keyof typeof projectStatuses] ?? "未設定";
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10).replaceAll("-", "/");
}
