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
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <strong>AI研究会</strong>
          <span>エンタープライズ管理</span>
        </div>
        <SidebarNav projects={data.projects} />
      </aside>
      <main className="main">
        <header className="topbar">
          <PageTitle projects={data.projects} />
          <div className="search">
            <Icon name="search" />
            <span>プロジェクト内を検索</span>
          </div>
          <div className="toplinks">
            <Link className="icon-link" href="/notices" aria-label="お知らせ" title="お知らせ">
              <Icon name="bell-dot" />
            </Link>
            <Link className="icon-link" href="/dashboard" aria-label="カレンダー" title="カレンダー">
              <Icon name="calendar" />
            </Link>
            <i />
            <span className="icon-link" aria-label="通知" title="通知">
              <Icon name="bell" />
            </span>
            <span className="user-chip">{currentUser.name}</span>
            <Link className="avatar" href={`/members/${currentUser.id}`}>
              <Icon name="account" />
            </Link>
            <form action={logoutAction}>
              <button className="logout-button" title="ログアウト">ログアウト</button>
            </form>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
