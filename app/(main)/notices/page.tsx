import { getAppData, type NoticeRow } from "../../lib/supabase-data";

export default async function NoticesPage() {
  const data = await getAppData();

  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-8 pb-[90px]">
      <div className="flex items-start justify-between gap-5">
        <div>
          <h1 className="m-0 text-[32px] font-medium">連絡事項</h1>
          <p className="mt-1 mb-[34px] text-base text-[#596171]">noticesテーブルに登録された連絡事項を新しい順に表示します。</p>
        </div>
      </div>
      {data.notices.length ? (
        <section className="mx-auto my-[42px] max-w-[930px]" aria-label="連絡事項一覧">
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
    <article className="mb-2.5 grid min-h-24 grid-cols-[1fr_160px] items-start gap-6 rounded-lg border border-line border-l-[5px] border-l-primary bg-white p-[22px_28px] max-[900px]:grid-cols-1">
      <div>
        <b className="block text-xl font-medium leading-[1.4]">{notice.title}</b>
        {notice.contents ? <p className="mt-2.5 whitespace-pre-wrap leading-[1.7] text-[#4b5563]">{notice.contents}</p> : null}
      </div>
      <span className="grid justify-items-end gap-1.5 text-right text-sm text-[#777] max-[900px]:justify-items-start max-[900px]:text-left">
        <small className="block">{notice.name}</small>
        <time className="block" dateTime={notice.created_at}>{formatDate(notice.created_at)}</time>
      </span>
    </article>
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

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10).replaceAll("-", "/");
}
