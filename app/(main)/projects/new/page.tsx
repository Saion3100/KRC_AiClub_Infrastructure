import Link from "next/link";
import { createProjectAction } from "../../../lib/actions";

export default function ProjectNewPage() {
  return (
    <div className="mx-auto max-w-[960px] px-6 pt-8 pb-[90px]">
      <Link href="/projects">←プロジェクト一覧へ戻る</Link>
      <form action={createProjectAction} className="mt-6 rounded-lg border border-line bg-paper p-[34px] shadow-[0_2px_5px_#00000012]">
        <h1 className="m-0 text-[32px] font-medium">プロジェクト新規作成</h1><hr />
        <div className="grid grid-cols-[240px_1fr] gap-12 border-b border-[#e0e4eb] py-[30px]">
          <div><h3>基本情報</h3><p>projectsテーブルへ保存する項目です。</p></div>
          <div className="grid gap-6">
            <label>プロジェクト名 *<input name="title" required placeholder="プロジェクト名を入力" /></label>
            <label>概要<textarea name="description" placeholder="概要を入力" /></label>
            <label>目標 *<input name="goal" required placeholder="目標を入力" /></label>
            <label>種別 *<input name="type" required placeholder="種別を入力" /></label>
          </div>
        </div>
        <div className="grid grid-cols-[240px_1fr] gap-12 border-b border-[#e0e4eb] py-[30px]">
          <div><h3>リンク</h3><p>任意項目です。</p></div>
          <div className="grid grid-cols-2 gap-6">
            <label>ドキュメントURL<input name="doc_url" placeholder="https://..." /></label>
            <label>リポジトリURL<input name="repository_url" placeholder="https://..." /></label>
          </div>
        </div>
        <footer className="flex justify-end gap-4 pt-6">
          <Link
            className="inline-flex h-12 min-w-[150px] items-center justify-center rounded-[7px] border border-line bg-white"
            href="/projects"
          >
            キャンセル
          </Link>
          <button className="inline-flex h-12 min-w-[140px] items-center justify-center rounded-[7px] border-0 bg-[#002660] px-5 font-bold text-white">
            プロジェクトを作成
          </button>
        </footer>
      </form>
    </div>
  );
}
