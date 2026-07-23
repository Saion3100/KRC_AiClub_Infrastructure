import Link from "next/link";
import { logoutAction } from "../lib/auth-actions";
import { requireAuth } from "../lib/auth";
import { getAppData } from "../lib/supabase-data";
import { Icon, MenuButton, PageTitle, Sidebar, SidebarProvider } from "./nav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await requireAuth();
  const data = await getAppData();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar projects={data.projects} />
        <main className="w-full pl-[255px] max-[900px]:pl-0">
          <header className="sticky top-0 z-1 flex h-16 items-center gap-4 border-b border-[#dfe3eb] bg-white pr-6 pl-8 max-[900px]:h-auto max-[900px]:flex-wrap max-[900px]:gap-x-3 max-[900px]:gap-y-2 max-[900px]:p-3">
            <MenuButton />
            <PageTitle projects={data.projects} />
            <div className="flex h-[38px] w-64 min-w-0 items-center gap-2.5 rounded-sm bg-[#efeded] px-3 text-sm text-[#697386] max-[900px]:order-3 max-[900px]:w-full">
              <Icon name="search" className="block h-[22px] w-[22px] shrink-0 text-[#303642]" />
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">プロジェクト内を検索</span>
            </div>
            <div className="ml-auto flex items-center gap-[18px] text-sm font-bold text-[#202633] max-[900px]:order-2 max-[900px]:flex-wrap max-[900px]:gap-x-3 max-[900px]:gap-y-2">
              <Link className="grid h-[22px] w-[22px] place-items-center text-[#202633]" href="/notices" aria-label="お知らせ" title="お知らせ">
                <Icon name="bell-dot" className="block h-[22px] w-[22px]" />
              </Link>
              <Link className="grid h-[22px] w-[22px] place-items-center text-[#202633]" href="/dashboard" aria-label="カレンダー" title="カレンダー">
                <Icon name="calendar" className="block h-[22px] w-[22px]" />
              </Link>
              <i className="h-9 border-l border-[#d4d8e1]" />
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
    </SidebarProvider>
  );
}
