import Link from "next/link";
import { createProjectAction } from "../../lib/actions";
import { projectStatuses } from "../../lib/domain";
import { getAppData, type AppData, type ProjectRow } from "../../lib/supabase-data";
import { ProjectFormModal } from "./project-form-modal";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: newParam } = await searchParams;
  const data = await getAppData();

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
              <label className="col-span-full">概要<textarea name="description" placeholder="概要を入力" /></label>
              <label>目標 *<input name="goal" required placeholder="目標を入力" /></label>
              <label>種別 *<input name="type" required placeholder="種別を入力" /></label>
              <label>ドキュメントURL<input name="doc_url" placeholder="https://..." /></label>
              <label>リポジトリURL<input name="repository_url" placeholder="https://..." /></label>
            </div>
            <div className="mt-[18px] flex justify-end">
              <button className="inline-flex h-12 min-w-[140px] items-center justify-center rounded-[7px] border-0 bg-primary px-5 font-bold text-white">プロジェクトを作成</button>
            </div>
          </form>
        </ProjectFormModal>
      </div>
      {data.projects.length ? (
        <>
          <div className="mt-6 grid grid-cols-3 gap-6 max-[900px]:block">
            {data.projects.slice(0, 3).map((project) => (
              <ProjectCard data={data} project={project} key={project.id} />
            ))}
          </div>
          <h2 className="mt-[66px] mb-6 text-[26px]">詳細リストビュー</h2>
          <section className="rounded-lg border border-line bg-paper">
            <div className="grid min-h-[34px] grid-cols-[2.6fr_1fr_1fr_1.2fr_24px] items-center border-b border-[#d8deea] bg-[#f3f3f3] px-6 text-xs text-[#4b5563]">
              <span>プロジェクト名</span>
              <span>ステータス</span>
              <span>参加人数</span>
              <span>更新日</span>
              <span />
            </div>
            {data.projects.map((project) => (
              <div
                className="grid min-h-16 grid-cols-[2.6fr_1fr_1fr_1.2fr_24px] items-center border-b border-[#d8deea] px-6 last:border-b-0"
                key={project.id}
              >
                <span><i className="mr-3.5 inline-grid h-7 w-7 place-items-center rounded-[5px] bg-[#dbeafe] not-italic text-primary">▣</i>{project.title}</span>
                <span><mark>{projectStatus(project.status)}</mark></span>
                <span>{memberCountForProject(data, project.id)}名</span>
                <span>{formatDate(project.updated_at)}</span>
                <Link href={`/projects/${project.id}`}>↗</Link>
              </div>
            ))}
          </section>
        </>
      ) : (
        <div className="mt-6">
          <EmptyState title="プロジェクトは未登録です" text="新規作成フォームから登録できます。" />
        </div>
      )}
    </div>
  );
}

function ProjectCard({ data, project }: { data: AppData; project: ProjectRow }) {
  return (
    <Link
      className="relative flex h-full min-h-[224px] flex-col rounded-lg border border-line bg-paper p-6 max-[900px]:mt-4"
      href={`/projects/${project.id}`}
    >
      <h3 className="mb-3 w-[82%] text-xl leading-[1.35]">{project.title}</h3>
      <p className="leading-[1.7] text-[#344054]">{project.description || project.goal}</p>
      <dl className="mt-auto mb-4 grid grid-cols-[1fr_auto] gap-2.5 pt-12 text-[13px]">
        <dt className="text-[#596171]">参加人数</dt>
        <dd>{memberCountForProject(data, project.id)}人</dd>
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
