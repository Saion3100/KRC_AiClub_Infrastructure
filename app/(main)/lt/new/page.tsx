import { createLtAction } from "../../../lib/actions";

export default function LtNewPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-8 pb-[90px]">
      <small>LT一覧 ＞ 新規作成</small>
      <h1 className="m-0 text-[32px] font-medium">LT作成</h1>
      <p className="mt-1 mb-[34px] text-base text-[#596171]">LT登録用の入力枠です。保存処理はlt_talksテーブル追加後に接続します。</p>
      <div className="grid grid-cols-[1fr_310px] gap-6">
        <form action={createLtAction} className="rounded-lg border border-line bg-paper p-[44px_40px_40px]">
          <div className="grid grid-cols-2 gap-6">
            <label>発表者 *<input name="speaker" placeholder="氏名を入力" /></label>
            <label>日付 *<input name="date" placeholder="mm/dd/yyyy" /></label>
            <label className="col-span-full">タイトル *<input name="title" placeholder="タイトルを入力" /></label>
            <label>資料URL<input name="material_url" placeholder="https://..." /></label>
            <label>カテゴリ<select name="category"><option value="">選択してください</option></select></label>
            <label className="col-span-full">概要 *<textarea name="summary" placeholder="概要を入力" /></label>
          </div>
          <div className="mt-12 flex justify-end gap-[34px]">
            <button className="h-12 min-w-[150px] rounded-[7px] border border-line bg-white" type="button">キャンセル</button>
            <button className="inline-flex h-12 min-w-[150px] items-center justify-center rounded-[7px] border border-line bg-white px-5 font-bold text-white">登録する</button>
          </div>
        </form>
        <aside className="rounded-lg border border-line bg-white p-6 text-[#344054]">
          <h3 className="mt-0 text-[15px] text-primary">未接続</h3>
          <p>lt_talksテーブルとRLSポリシー確定後に保存処理を実装します。</p>
        </aside>
      </div>
    </div>
  );
}
