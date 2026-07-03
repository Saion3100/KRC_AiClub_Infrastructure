import Link from "next/link";
import { createProjectAction } from "../../../lib/actions";

export default function ProjectNewPage() {
  return (
    <div className="content content-project-new">
      <Link className="back" href="/projects">←プロジェクト一覧へ戻る</Link>
      <form action={createProjectAction} className="create-card">
        <h1>プロジェクト新規作成</h1><hr />
        <div className="create-row">
          <div><h3>基本情報</h3><p>projectsテーブルへ保存する項目です。</p></div>
          <div>
            <label>プロジェクト名 *<input name="title" required placeholder="プロジェクト名を入力" /></label>
            <label>概要<textarea name="description" placeholder="概要を入力" /></label>
            <label>目標 *<input name="goal" required placeholder="目標を入力" /></label>
            <label>種別 *<input name="type" required placeholder="種別を入力" /></label>
          </div>
        </div>
        <div className="create-row">
          <div><h3>リンク</h3><p>任意項目です。</p></div>
          <div className="inline">
            <label>ドキュメントURL<input name="doc_url" placeholder="https://..." /></label>
            <label>リポジトリURL<input name="repository_url" placeholder="https://..." /></label>
          </div>
        </div>
        <footer>
          <Link className="button-link cancel-link" href="/projects">キャンセル</Link>
          <button className="primary project-create-button">プロジェクトを作成</button>
        </footer>
      </form>
    </div>
  );
}
