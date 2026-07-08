import Link from "next/link";
import { createProjectAction } from "../../lib/actions";
import { projectStatuses } from "../../lib/domain";
import { getAppData, type AppData, type ProjectRow } from "../../lib/supabase-data";
import { ProjectFormModal } from "./project-form-modal";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; status?: string }>;
}) {
  const { new: newParam, status: statusParam } = await searchParams;
  const data = await getAppData();
  const visibleProjects = statusParam
    ? data.projects.filter((project) => String(project.status) === statusParam)
    : data.projects;

  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-8 pb-[90px]">
      <div className="flex items-start justify-between gap-5">
        <div>
          <h1 className="m-0 text-[32px] font-medium">プロジェクト一覧</h1>
        </div>
        <ProjectFormModal defaultOpen={newParam === "1"}>
          <form action={createProjectAction}>
            <div className="grid grid-cols-2 gap-[18px]">
              <label className="col-span-full">プロジェクト名 *<input name="title" required placeholder="プロジェクト名を入力" /></label>
              <label className="col-span-full">概要<textarea name="description" placeholder="概要を入力" style={{ minHeight: "90px" }} /></label>
              <label>目標 *<input name="goal" required placeholder="目標を入力" /></label>
              <label>種別 *<input name="type" required placeholder="種別を入力" /></label>
              <label>ドキュメントURL<input name="doc_url" placeholder="https://..." /></label>
              <label>リポジトリURL<input name="repository_url" placeholder="https://..." /></label>
            </div>
            <div className="mt-[18px] flex justify-end">
              <button className="inline-flex h-12 min-w-[140px] items-center justify-center rounded-[7px] border-0 bg-primary px-5 font-bold text-white hover:bg-blue">プロジェクトを作成</button>
            </div>
          </form>
        </ProjectFormModal>
      </div>
      <StatusFilter selected={statusParam} />
      {visibleProjects.length ? (
        <div className="mt-6 grid grid-cols-3 gap-6 max-[900px]:block">
          {visibleProjects.map((project) => (
            <ProjectCard data={data} project={project} key={project.id} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState title="該当するプロジェクトはありません" text="別のステータスを選んでください。" />
        </div>
      )}
    </div>
  );
}

function StatusFilter({ selected }: { selected?: string }) {
  return (
    <div className="mt-6 flex items-center gap-6 border-b border-line text-sm">
      <Link
        className={`pb-3 ${!selected ? "border-b-2 border-primary font-bold text-[#101828]" : "text-[#596171] hover:text-[#101828]"}`}
        href="/projects"
      >
        全て
      </Link>
      {Object.entries(projectStatuses).map(([value, label]) => (
        <Link
          className={`pb-3 ${selected === value ? "border-b-2 border-primary font-bold text-[#101828]" : "text-[#596171] hover:text-[#101828]"}`}
          href={`/projects?status=${value}`}
          key={value}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

function ProjectCard({ data, project }: { data: AppData; project: ProjectRow }) {
  return (
    <Link
      className="relative flex h-full min-h-[224px] flex-col rounded-lg border border-line bg-paper p-6 max-[900px]:mt-4 hover:border-primary"
      href={`/projects/${project.id}`}
    >
      <h3 className="mb-3 w-[82%] text-xl leading-[1.35]">{project.title}</h3>
      <p className="leading-[1.7] text-[#344054]">{project.description || project.goal}</p>
      <dl className="mt-auto mb-4 grid grid-cols-[1fr_auto] gap-2.5 pt-12 text-[13px]">
        <dt className="text-[#596171]">ステータス</dt>
        <dd><mark>{projectStatus(project.status)}</mark></dd>
        <dt className="text-[#596171]">参加人数</dt>
        <dd>{memberCountForProject(data, project.id)}人</dd>
        <dt className="text-[#596171]">作成日</dt>
        <dd>{formatDate(project.created_at)}</dd>
      </dl>
    </Link>
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
