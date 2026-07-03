import Link from "next/link";
import { getAppData, type AppData } from "../../lib/supabase-data";

export default async function MembersPage() {
  const data = await getAppData();

  return (
    <div className="content content-members">
      <div className="title-row">
        <div>
          <h1>メンバー一覧</h1>
          <p className="lead">Supabaseのusersテーブルに登録されたメンバーを表示します。</p>
        </div>
        <div>
          <button className="outline">絞り込み</button>
          <Link className="primary" href="/members/new">メンバー追加</Link>
        </div>
      </div>
      <div className="stats two">
        <Stat label="メンバー総数" value={String(data.users.length)} note="名" />
        <Stat label="クラス数" value={String(data.classes.length)} note="件" />
      </div>
      {data.users.length ? (
        <section className="member-table">
          <div><span>氏名</span><span>学年</span><span>クラス</span><span>参加プロジェクト数</span><span>詳細</span></div>
          {data.users.map((user) => (
            <Link href={`/members/${user.id}`} key={user.id}>
              <span><b>{user.name}</b><small>{user.email}</small></span>
              <span>{user.grade}年生</span>
              <span>{className(data, user.class_id)}</span>
              <span><mark>{memberProjectCount(data, user.id)}</mark></span>
              <span>›</span>
            </Link>
          ))}
          <footer>表示中: {data.users.length} / 全 {data.users.length} 名</footer>
        </section>
      ) : (
        <EmptyState title="メンバーは未登録です" text="メンバー追加フォームから登録できます。" />
      )}
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="stat">
      <small>{label}</small>
      <strong>{value}</strong>
      <span>{note}</span>
    </div>
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

function className(data: AppData, classId: number) {
  return data.classes.find((item) => item.id === classId)?.name ?? "-";
}

function memberProjectCount(data: AppData, userId: number) {
  return data.projectMembers.filter((member) => member.user_id === userId).length;
}
