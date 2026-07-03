import { getAppData, type NoticeRow } from "../../lib/supabase-data";

export default async function NoticesPage() {
  const data = await getAppData();

  return (
    <div className="content content-notices">
      <div className="title-row">
        <div>
          <h1>連絡事項</h1>
          <p className="lead">noticesテーブルに登録された連絡事項を新しい順に表示します。</p>
        </div>
      </div>
      {data.notices.length ? (
        <section className="notices" aria-label="連絡事項一覧">
          {data.notices.map((notice) => (
            <NoticeCard notice={notice} key={`${notice.created_at}-${notice.title}`} />
          ))}
        </section>
      ) : (
        <EmptyState title="連絡事項は未登録です" text="noticesテーブルにデータを追加すると一覧に表示されます。" />
      )}
    </div>
  );
}

function NoticeCard({ notice }: { notice: NoticeRow }) {
  return (
    <article>
      <div>
        <b>{notice.title}</b>
        {notice.contents ? <p>{notice.contents}</p> : null}
      </div>
      <span>
        <small>{notice.name}</small>
        <time dateTime={notice.created_at}>{formatDate(notice.created_at)}</time>
      </span>
    </article>
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

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10).replaceAll("-", "/");
}
