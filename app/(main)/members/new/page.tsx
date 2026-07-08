import { createMemberAction } from "../../../lib/actions";
import { getSignupClasses } from "../../../lib/supabase-data";

export default async function MemberNewPage() {
  const classes = await getSignupClasses();

  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-8 pb-[90px]">
      <h1 className="m-0 text-[32px] font-medium">メンバー追加</h1>
      <form action={createMemberAction} className="mt-6 rounded-lg border border-line bg-paper p-[44px_40px_40px]">
        <div className="grid grid-cols-2 gap-6">
          <label>名前 *<input name="name" placeholder="氏名を入力" /></label>
          <label className="col-span-full">
            クラス *
            <select name="class_name" required defaultValue="">
              <option value="">選択してください</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.name}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </label>
          <label>メールアドレス<input name="email" placeholder="name@example.ac.jp" /></label>
          <label>学年<select name="grade"><option value="">選択してください</option><option value="1">1年生</option><option value="2">2年生</option><option value="3">3年生</option></select></label>
        </div>
        <div className="mt-12 flex justify-end gap-[34px]">
          <button className="h-12 min-w-[150px] rounded-[7px] border border-line bg-white" type="button">キャンセル</button>
          <button className="inline-flex h-12 min-w-[150px] items-center justify-center rounded-[7px] border border-line bg-white px-5 font-bold text-white">登録する</button>
        </div>
      </form>
    </div>
  );
}
