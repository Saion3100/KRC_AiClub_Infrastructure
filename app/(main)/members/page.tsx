import Link from "next/link";
import { getAppData, type AppData } from "../../lib/supabase-data";

export default async function MembersPage() {
  const data = await getAppData();

  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-8 pb-[90px]">
      <div className="flex items-start justify-between gap-5">
        <div>
          <h1 className="m-0 text-[32px] font-medium">メンバー一覧</h1>
          <p className="mt-1 mb-[34px] text-base text-[#596171]">Supabaseのusersテーブルに登録されたメンバーを表示します。</p>
        </div>
        <div>
          <button className="inline-flex h-[38px] min-w-[118px] items-center justify-center rounded-[3px] border border-line bg-white text-[#263142]">絞り込み</button>
          <Link
            className="inline-flex h-12 min-w-[140px] items-center justify-center rounded-[7px] border-0 bg-primary px-5 font-bold text-white"
            href="/members/new"
          >
            メンバー追加
          </Link>
        </div>
      </div>
      <div className="mt-[60px] mb-6 grid grid-cols-2 gap-4">
        <Stat label="メンバー総数" value={String(data.users.length)} note="名" />
        <Stat label="クラス数" value={String(data.classes.length)} note="件" />
      </div>
      {data.users.length ? (
        <section className="rounded-lg border border-line bg-paper">
          <div className="grid min-h-[46px] grid-cols-[2.2fr_.7fr_.7fr_1.8fr_.4fr] items-center border-b border-[#d8deea] bg-[#f3f3f3] px-6">
            <span>氏名</span><span>学年</span><span>クラス</span><span>参加プロジェクト数</span><span>詳細</span>
          </div>
          {data.users.map((user) => (
            <Link
              className="grid min-h-[90px] grid-cols-[2.2fr_.7fr_.7fr_1.8fr_.4fr] items-center border-b border-[#d8deea] px-6"
              href={`/members/${user.id}`}
              key={user.id}
            >
              <span><b className="block">{user.name}</b><small className="block">{user.email}</small></span>
              <span>{user.grade}年生</span>
              <span>{className(data, user.class_id)}</span>
              <span><mark>{memberProjectCount(data, user.id)}</mark></span>
              <span>›</span>
            </Link>
          ))}
          <footer className="min-h-[54px] bg-[#f3f3f3] px-6 py-[18px] text-[#344054]">表示中: {data.users.length} / 全 {data.users.length} 名</footer>
        </section>
      ) : (
        <EmptyState title="メンバーは未登録です" text="メンバー追加フォームから登録できます。" />
      )}
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="min-h-[108px] rounded-lg border border-line bg-paper p-6">
      <small className="block mb-2">{label}</small>
      <strong className="text-[28px] font-medium text-blue">{value}</strong>
      <span className="ml-1.5 text-[13px] text-primary">{note}</span>
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

function className(data: AppData, classId: number) {
  return data.classes.find((item) => item.id === classId)?.name ?? "-";
}

function memberProjectCount(data: AppData, userId: number) {
  return data.projectMembers.filter((member) => member.user_id === userId).length;
}
