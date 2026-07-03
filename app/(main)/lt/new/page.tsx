import { createLtAction } from "../../../lib/actions";

export default function LtNewPage() {
  return (
    <div className="content content-lt-new">
      <small className="crumb">LT一覧 ＞ 新規作成</small>
      <h1>LT作成</h1>
      <p className="lead">LT登録用の入力枠です。保存処理はlt_talksテーブル追加後に接続します。</p>
      <div className="form-layout">
        <form action={createLtAction} className="form-card">
          <div className="form-grid">
            <label>発表者 *<input name="speaker" placeholder="氏名を入力" /></label>
            <label>日付 *<input name="date" placeholder="mm/dd/yyyy" /></label>
            <label className="wide">タイトル *<input name="title" placeholder="タイトルを入力" /></label>
            <label>資料URL<input name="material_url" placeholder="https://..." /></label>
            <label>カテゴリ<select name="category"><option value="">選択してください</option></select></label>
            <label className="wide">概要 *<textarea name="summary" placeholder="概要を入力" /></label>
          </div>
          <div className="form-actions"><button type="button">キャンセル</button><button className="primary">登録する</button></div>
        </form>
        <aside className="hint"><h3>未接続</h3><p>lt_talksテーブルとRLSポリシー確定後に保存処理を実装します。</p></aside>
      </div>
    </div>
  );
}
