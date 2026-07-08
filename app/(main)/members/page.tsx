import Link from "next/link";
import { getAppData, type AppData } from "../../lib/supabase-data";

const pageSize = 5;

type MembersPageProps = {
  searchParams?: Promise<{
    page?: string | string[];
  }>;
};

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const data = await getAppData();
  const params = searchParams ? await searchParams : {};
  const totalPages = Math.max(1, Math.ceil(data.users.length / pageSize));
  const requestedPage = pageNumber(params.page);
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleUsers = data.users.slice(startIndex, startIndex + pageSize);
  const displayedStart = data.users.length ? startIndex + 1 : 0;
  const displayedEnd = Math.min(startIndex + visibleUsers.length, data.users.length);

  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-6 pb-8">
      <div className="flex items-start justify-between gap-5">
        <div>
          <h1 className="m-0 text-[32px] font-medium">メンバー一覧</h1>
          <p className="mt-1 mb-0 text-base text-[#596171]">Supabaseのusersテーブルに登録されたメンバーを表示します。</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex h-10 min-w-[132px] items-center justify-center rounded-[7px] border border-line bg-white px-5 font-bold text-[#263142]">絞り込み</button>
          <Link
            className="inline-flex h-10 min-w-[132px] items-center justify-center rounded-[7px] border-0 bg-primary px-5 font-bold text-white"
            href="/members/new"
          >
            メンバー追加
          </Link>
        </div>
      </div>
      <div className="mt-6 mb-4 grid grid-cols-2 gap-4">
        <Stat label="メンバー総数" value={String(data.users.length)} note="名" />
        <Stat label="クラス数" value={String(data.classes.length)} note="件" />
      </div>
      {data.users.length ? (
        <section className="rounded-lg border border-line bg-paper">
          <div className="grid min-h-10 grid-cols-[2.2fr_.7fr_.7fr_1.8fr_.4fr] items-center border-b border-[#d8deea] bg-[#f3f3f3] px-6 text-sm">
            <span>氏名</span><span>学年</span><span>クラス</span><span>参加プロジェクト数</span><span>詳細</span>
          </div>
          {visibleUsers.map((user) => (
            <Link
              className="grid min-h-16 grid-cols-[2.2fr_.7fr_.7fr_1.8fr_.4fr] items-center border-b border-[#d8deea] px-6"
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
          <footer className="flex min-h-12 items-center justify-between bg-[#f3f3f3] px-6 py-2 text-[#344054]">
            <span>表示中: {displayedStart}-{displayedEnd} / 全 {data.users.length} 名</span>
            <nav className="flex items-center gap-2" aria-label="メンバー一覧ページ移動">
              <PageLink disabled={currentPage <= 1} href={pageHref(currentPage - 1)}>
                前へ
              </PageLink>
              <span className="min-w-16 text-center text-sm">{currentPage} / {totalPages}</span>
              <PageLink disabled={currentPage >= totalPages} href={pageHref(currentPage + 1)}>
                次へ
              </PageLink>
            </nav>
          </footer>
        </section>
      ) : (
        <EmptyState title="メンバーは未登録です" text="メンバー追加フォームから登録できます。" />
      )}
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="min-h-20 rounded-lg border border-line bg-paper p-4">
      <small className="block mb-2">{label}</small>
      <strong className="text-[28px] font-medium text-blue">{value}</strong>
      <span className="ml-1.5 text-[13px] text-primary">{note}</span>
    </div>
  );
}

function PageLink({
  children,
  disabled,
  href,
}: {
  children: React.ReactNode;
  disabled: boolean;
  href: string;
}) {
  return (
    <Link
      aria-disabled={disabled}
      className={`inline-flex h-8 min-w-16 items-center justify-center rounded-[7px] border border-line px-3 text-sm ${
        disabled ? "pointer-events-none bg-[#eef1f5] text-[#98a2b3]" : "bg-white text-[#263142]"
      }`}
      href={href}
    >
      {children}
    </Link>
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

function pageNumber(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
}

function pageHref(page: number) {
  return `/members?page=${Math.max(1, page)}`;
}
