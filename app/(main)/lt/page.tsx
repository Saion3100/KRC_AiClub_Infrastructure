import Link from "next/link";

export default function LtListPage() {
  return (
    <div className="content content-lt">
      <div className="title-row">
        <div><h1>LT一覧</h1><p className="lead">lt_talksテーブル追加後に表示します。</p></div>
        <Link className="primary" href="/lt/new">＋ 新規作成</Link>
      </div>
      <EmptyState title="LTデータは未接続です" text="lt_talksテーブル追加後に一覧を表示します。" />
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
