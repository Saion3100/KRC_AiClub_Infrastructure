"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ProjectRow } from "../lib/supabase-data";

export function SidebarNav({ projects }: { projects: ProjectRow[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-px">
      <NavLink href="/dashboard" active={pathname === "/dashboard"} icon="layout" label="ダッシュボード" />
      <details className="group block" open>
        <summary className="grid cursor-pointer grid-cols-[28px_1fr] items-center px-[22px] min-h-[30px] text-sm list-none [&::-webkit-details-marker]:hidden">
          <span className="-rotate-90 transition-transform group-open:rotate-0">
            <Icon name="chevron-down" className="block h-[19px] w-[19px]" />
          </span>
          <b className="font-bold">プロジェクト</b>
        </summary>
        <NavLink href="/tasks" active={pathname === "/tasks"} icon="clipboard" label="タスク一覧" child />
        <NavLink href="/projects" active={pathname === "/projects"} icon="chevron-down" label="参加プロジェクト一覧" child />
        <div className="relative before:absolute before:inset-y-0 before:left-[41px] before:border-l before:border-[#c8cfdd] before:content-['']">
          {projects.slice(0, 4).map((project) => (
            <Link
              className={`grid min-h-[30px] grid-cols-[28px_1fr] items-center border-l-4 pr-[22px] pl-[72px] text-[13px] font-normal ${
                pathname === `/projects/${project.id}` ? "border-l-blue bg-[#dedede] text-blue" : "border-l-transparent hover:bg-[#dedede]"
              }`}
              href={`/projects/${project.id}`}
              key={project.id}
            >
              <span />
              <b className="font-bold">{project.title}</b>
            </Link>
          ))}
        </div>
        <NavLink href="/projects/new" active={pathname === "/projects/new"} icon="plus-circle" label="プロジェクトの新規作成" child />
      </details>
      <NavLink href="/members" active={pathname === "/members"} icon="users" label="メンバー一覧" />
      <NavLink href="/lt" active={pathname === "/lt"} icon="presentation" label="LT一覧" />
      <p className="mx-[22px] my-[3px] text-xs font-bold text-[#596171]">組織管理</p>
      <NavLink href="/notices" active={pathname === "/notices"} icon="megaphone" label="連絡事項" />
      <NavLink href="/dashboard" active={false} icon="calendar-check" label="出欠確認" inactive />
      <hr className="mt-1.5 w-full border-0 border-t border-[#d8dbe2]" />
      <NavLink href="/dashboard" active={false} icon="settings" label="設定" inactive />
      <NavLink href="/dashboard" active={false} icon="help-circle" label="ヘルプ" inactive />
    </nav>
  );
}

function NavLink({
  href,
  active,
  icon,
  label,
  child,
  inactive,
}: {
  href: string;
  active: boolean;
  icon: IconName;
  label: string;
  child?: boolean;
  inactive?: boolean;
}) {
  const isActive = !inactive && active;

  return (
    <Link
      className={`grid min-h-[30px] grid-cols-[28px_1fr] items-center border-l-4 pr-[22px] text-sm ${
        child ? "pl-[38px]" : "pl-[18px]"
      } ${isActive ? "border-l-blue bg-[#dedede] text-blue" : "border-l-transparent hover:bg-[#dedede]"}`}
      href={href}
    >
      <span><Icon name={icon} className="block h-[19px] w-[19px]" /></span>
      <b className="font-bold">{label}</b>
    </Link>
  );
}

const pageTitles: Record<string, string> = {
  "/dashboard": "ダッシュボード",
  "/projects": "プロジェクト",
  "/projects/new": "プロジェクト",
  "/tasks": "タスク一覧",
  "/members": "",
  "/members/new": "メンバー",
  "/lt": "",
  "/lt/new": "",
  "/notices": "連絡事項",
};

export function PageTitle({ projects }: { projects: ProjectRow[] }) {
  const pathname = usePathname();

  const projectMatch = pathname.match(/^\/projects\/(\d+)$/);
  if (projectMatch) {
    const projectId = Number(projectMatch[1]);
    const project = projects.find((item) => item.id === projectId) ?? projects[0];
    return project ? <h2 className="m-0 min-w-[192px] text-[18px] font-bold text-blue">{project.title}</h2> : null;
  }

  if (/^\/members\/\d+$/.test(pathname)) {
    return <h2 className="m-0 min-w-[192px] text-[18px] font-bold text-blue">メンバー</h2>;
  }

  const title = pageTitles[pathname];
  return title ? <h2 className="m-0 min-w-[192px] text-[18px] font-bold text-blue">{title}</h2> : null;
}

export type IconName =
  | "account"
  | "bell"
  | "bell-dot"
  | "calendar"
  | "calendar-check"
  | "chevron-down"
  | "clipboard"
  | "help-circle"
  | "layout"
  | "megaphone"
  | "plus-circle"
  | "presentation"
  | "search"
  | "settings"
  | "users";

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} {...common}>
      {name === "account" ? (
        <>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="9" r="3" />
          <path d="M6.5 19a6.5 6.5 0 0 1 11 0" />
        </>
      ) : null}
      {name === "bell" ? (
        <>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </>
      ) : null}
      {name === "bell-dot" ? (
        <>
          <path d="M17 8a5 5 0 0 0-10 0c0 6-3 6-3 8h16c0-2-3-2-3-8" />
          <path d="M10 20h4" />
          <circle cx="18" cy="5" r="2" fill="currentColor" stroke="none" />
        </>
      ) : null}
      {name === "calendar" ? (
        <>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </>
      ) : null}
      {name === "calendar-check" ? (
        <>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16M8 15l2 2 5-5" />
        </>
      ) : null}
      {name === "chevron-down" ? <path d="m6 9 6 6 6-6" /> : null}
      {name === "clipboard" ? (
        <>
          <rect x="6" y="5" width="12" height="16" rx="1" />
          <path d="M9 5a3 3 0 0 1 6 0M9 5h6M9 12h6M9 16h4" />
        </>
      ) : null}
      {name === "help-circle" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.7 2.7 0 0 1 5.1 1.4c0 1.9-2.6 2-2.6 3.6M12 18h.01" />
        </>
      ) : null}
      {name === "layout" ? (
        <>
          <rect x="4" y="4" width="6" height="6" />
          <rect x="14" y="4" width="6" height="6" />
          <rect x="4" y="14" width="6" height="6" />
          <rect x="14" y="14" width="6" height="6" />
        </>
      ) : null}
      {name === "megaphone" ? (
        <>
          <path d="M4 13V8l12-4v13L4 13Z" />
          <path d="M4 13l2 6h4l-2-5M18 9l3-1M18 13l3 1" />
        </>
      ) : null}
      {name === "plus-circle" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </>
      ) : null}
      {name === "presentation" ? (
        <>
          <rect x="4" y="5" width="16" height="11" rx="1" />
          <path d="M12 16v5M8 21h8M8 9h8M8 12h5" />
        </>
      ) : null}
      {name === "search" ? (
        <>
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4 4" />
        </>
      ) : null}
      {name === "settings" ? (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.4 3.1a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L5.1 11a7 7 0 0 0 0 2L3 14.5l2 3.4 2.4-1a7 7 0 0 0 1.7 1l.4 3.1h5l.4-3.1a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2.1-1.5a7 7 0 0 0 .1-1Z" />
        </>
      ) : null}
      {name === "users" ? (
        <>
          <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
          <circle cx="12" cy="8" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 4.1a4 4 0 0 1 0 7.8M2 21v-2a4 4 0 0 1 3-3.9M8 4.1a4 4 0 0 0 0 7.8" />
        </>
      ) : null}
    </svg>
  );
}
