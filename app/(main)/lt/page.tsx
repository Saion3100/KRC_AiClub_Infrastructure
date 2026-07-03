import Link from "next/link";

export default function LtListPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-8 pb-[90px]">
      <div className="flex items-start justify-between gap-5">
        <div>
          <h1 className="m-0 text-[32px] font-medium">LT一覧</h1>
          <p className="mt-1 mb-[34px] text-base text-[#596171]">lt_talksテーブル追加後に表示します。</p>
        </div>
        <Link
          className="inline-flex h-12 min-w-[140px] items-center justify-center rounded-[7px] border-0 bg-primary px-5 font-bold text-white"
          href="/lt/new"
        >
          ＋ 新規作成
        </Link>
      </div>
      <EmptyState title="LTデータは未接続です" text="lt_talksテーブル追加後に一覧を表示します。" />
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
