import Link from "next/link";
import { logoutAction } from "../lib/auth-actions";
import { requireAuth } from "../lib/auth";
import { getAppData } from "../lib/supabase-data";
import { Icon, PageTitle, SidebarNav } from "./nav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await requireAuth();
  const data = await getAppData();

  return (
    <div className="flex min-h-screen max-[900px]:block">
      <aside className="no-scrollbar fixed inset-y-0 left-0 z-2 w-[255px] overflow-y-auto overscroll-contain border-r border-[#d5d9e2] bg-[#f2f3f5] text-[#303642] max-[900px]:static max-[900px]:w-full">
        <div className="px-6 py-[18px]">
          <strong className="block text-[21px] text-blue">AI研究会</strong>
          <span className="text-xs font-bold text-[#596171]">エンタープライズ管理</span>
        </div>
        <SidebarNav projects={data.projects} />
      </aside>
      <main className="w-full pl-[255px] max-[900px]:pl-0">
        <header className="sticky top-0 z-1 flex h-16 items-center gap-6 border-b border-[#dfe3eb] bg-white pr-6 pl-8 max-[900px]:h-auto max-[900px]:flex-wrap max-[900px]:p-3">
          <PageTitle projects={data.projects} />
          <div className="flex h-[38px] w-64 items-center gap-2.5 rounded-sm bg-[#efeded] px-3 text-sm text-[#697386]">
            <Icon name="search" className="block h-[22px] w-[22px] shrink-0 text-[#303642]" />
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">プロジェクト内を検索</span>
          </div>
          <div className="ml-auto flex items-center gap-[18px] text-sm font-bold text-[#202633]">
            <Link className="grid h-[22px] w-[22px] place-items-center text-[#202633]" href="/notices" aria-label="お知らせ" title="お知らせ">
              <Icon name="bell-dot" className="block h-[22px] w-[22px]" />
            </Link>
            <Link className="grid h-[22px] w-[22px] place-items-center text-[#202633]" href="/dashboard" aria-label="カレンダー" title="カレンダー">
              <Icon name="calendar" className="block h-[22px] w-[22px]" />
            </Link>
            <i className="h-9 border-l border-[#d4d8e1]" />
            <span className="grid h-[22px] w-[22px] place-items-center text-[#202633]" aria-label="通知" title="通知">
              <Icon name="bell" className="block h-[22px] w-[22px]" />
            </span>
            <span className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[#344054]">{currentUser.name}</span>
            <Link className="grid h-[30px] w-[30px] place-items-center text-blue" href={`/members/${currentUser.id}`}>
              <Icon name="account" className="block h-[30px] w-[30px]" />
            </Link>
            <form action={logoutAction}>
              <button className="h-8 rounded-md border border-line bg-white px-3 text-[13px] font-bold text-[#344054] hover:bg-[#f3f4f6]" title="ログアウト">ログアウト</button>
            </form>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
