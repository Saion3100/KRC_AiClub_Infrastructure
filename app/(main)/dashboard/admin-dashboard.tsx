"use client";

import Link from "next/link";
import { useState } from "react";
import { projectStatuses } from "../../lib/domain";
import {
  type AppData,
  type ProjectRow,
  type UserRow,
} from "../../lib/supabase-data";
import styles from "./dashboard.module.css";

type AdminProjectFilter = "healthy" | "overdue-tasks" | "overdue-release";

export function AdminDashboard({
  data,
  today,
}: {
  data: AppData;
  today: string;
}) {
  const [filter, setFilter] = useState<AdminProjectFilter | null>(null);
  const summary = getAdminProjectSummary(data, today);
  const projects = getProjectsByReleaseDate(
    filterAdminProjects(data.projects, summary, filter),
  );
  const inactiveUsers = getInactiveUsers(data);

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.title}>ダッシュボード</h1>
      <p className={styles.subtitle}>全プロジェクトとメンバーの状況を確認しましょう</p>
      <div className={styles.statsGrid}>
        <StatFilter
          filter="healthy"
          selected={filter === "healthy"}
          onSelect={setFilter}
          label="問題なし"
          value={String(summary.healthyProjectIds.size)}
          note="プロジェクト"
        />
        <StatFilter
          filter="overdue-tasks"
          selected={filter === "overdue-tasks"}
          onSelect={setFilter}
          label="期限超過タスクあり"
          value={String(summary.overdueTaskProjectIds.size)}
          note="プロジェクト"
          danger={summary.overdueTaskProjectIds.size > 0}
        />
        <StatFilter
          filter="overdue-release"
          selected={filter === "overdue-release"}
          onSelect={setFilter}
          label="リリース日期限超過"
          value={String(summary.overdueReleaseProjectIds.size)}
          note="プロジェクト"
          danger={summary.overdueReleaseProjectIds.size > 0}
        />
      </div>
      <div className={`${styles.contentGrid} ${styles.adminContent}`}>
        <section className={`${styles.card} ${styles.scrollCard}`}>
          <h3 className={styles.cardHeader}>タスク管理</h3>
          {projects.length ? (
            <div className={styles.scrollArea}>
              {projects.map((project) => (
                <ProjectItem
                  project={project}
                  summary={summary}
                  today={today}
                  key={project.id}
                />
              ))}
            </div>
          ) : data.error ? (
            <EmptyState title="プロジェクトを読み込めませんでした" text="時間をおいて、もう一度お試しください。" />
          ) : filter ? (
            <EmptyState title="該当するプロジェクトはありません" text="別の集計カードを選択してください。" />
          ) : (
            <EmptyState title="プロジェクトはありません" text="プロジェクトが作成されると、ここに表示されます。" />
          )}
        </section>
        <aside className={`${styles.sidebar} ${styles.adminSidebar}`}>
          <section className={`${styles.card} ${styles.progressCard}`}>
            <h3 className={styles.plainCardHeader}>進捗管理</h3>
            <AttendancePlaceholder />
          </section>
          <section className={`${styles.card} ${styles.scrollCard} ${styles.activityCard}`}>
            <h3 className={styles.cardHeader}>稼働状況</h3>
            {inactiveUsers.length ? (
              <div className={styles.inactiveUserList}>
                {inactiveUsers.map((user) => (
                  <InactiveUserItem user={user} key={user.id} />
                ))}
              </div>
            ) : data.error ? (
              <EmptyState title="ユーザーを読み込めませんでした" />
            ) : (
              <EmptyState title="未稼働ユーザーはいません" />
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function ProjectItem({
  project,
  summary,
  today,
}: {
  project: ProjectRow;
  summary: ReturnType<typeof getAdminProjectSummary>;
  today: string;
}) {
  const releaseDate = dateOnly(project.object_published);
  const isReleaseOverdue = Boolean(releaseDate) && releaseDate! < today;
  const projectStates = getProjectStates(project.id, summary);

  return (
    <Link
      href={`/projects/${project.id}`}
      className={styles.projectLink}
      aria-label={`${project.title}の詳細を開く`}
    >
      <article className={styles.projectItem}>
        <div className={styles.projectIdentity}>
          <h4 className={styles.projectTitle}>{project.title}</h4>
          <div className={styles.projectStateList}>
            {projectStates.map((state) => (
              <span
                className={`${styles.projectState} ${state.className}`}
                key={state.label}
              >
                {state.label}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.releaseDate}>
          <span className={styles.fieldLabel}>リリース期限</span>
          <time
            dateTime={releaseDate ?? undefined}
            className={isReleaseOverdue ? styles.dangerText : undefined}
          >
            {formatDisplayDate(project.object_published)}
          </time>
        </div>
        <span
          className={`${styles.statusBadge} ${projectStatusClass(project.status)}`}
        >
          {projectStatus(project.status)}
        </span>
      </article>
    </Link>
  );
}

function AttendancePlaceholder() {
  return (
    <div className={styles.attendanceBody}>
      <div
        className={styles.attendanceChart}
        role="img"
        aria-label="出席率は未集計です"
      >
        <div className={styles.chartInner}>
          <div>
            <strong className={`${styles.chartValue} ${styles.attendanceValue}`}>--%</strong>
            <span className={styles.attendanceLabel}>出席率</span>
          </div>
        </div>
      </div>
      <p className={styles.attendanceCaption}>出席データは未接続です</p>
    </div>
  );
}

function InactiveUserItem({ user }: { user: UserRow }) {
  return (
    <Link href={`/members/${user.id}`} className={styles.inactiveUserLink}>
      <span className={styles.userAvatar}>
        {user.name.slice(0, 1)}
      </span>
      <span className={styles.userDetails}>
        <strong className={styles.userName}>{user.name}</strong>
        <small className={styles.userState}>タスク未割り当て</small>
      </span>
    </Link>
  );
}

function StatFilter({
  filter,
  selected,
  onSelect,
  label,
  value,
  note,
  danger,
}: {
  filter: AdminProjectFilter;
  selected: boolean;
  onSelect: (filter: AdminProjectFilter | null) => void;
  label: string;
  value: string;
  note: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className={`${styles.statLink} ${selected ? styles.statSelected : ""}`}
      aria-pressed={selected}
      onClick={() => onSelect(selected ? null : filter)}
    >
      <Stat label={label} value={value} note={note} danger={danger} />
    </button>
  );
}

function Stat({ label, value, note, danger }: { label: string; value: string; note: string; danger?: boolean }) {
  return (
    <div className={styles.stat}>
      <small className={styles.statLabel}>{label}</small>
      <strong className={`${styles.statValue} ${danger ? styles.statDanger : ""}`}>{value}</strong>
      <span className={styles.statNote}>{note}</span>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className={styles.emptyState}>
      <b>{title}</b>
      {text ? <small>{text}</small> : null}
    </div>
  );
}

function getAdminProjectSummary(data: AppData, today: string) {
  const overdueTaskProjectIds = new Set(
    data.tasks
      .filter((task) => task.status !== 2 && Boolean(task.due_date) && dateOnly(task.due_date)! < today)
      .map((task) => task.project_id),
  );
  const overdueReleaseProjectIds = new Set(
    data.projects
      .filter((project) => {
        const releaseDate = dateOnly(project.object_published);
        return Boolean(releaseDate) && releaseDate! < today;
      })
      .map((project) => project.id),
  );
  const healthyProjectIds = new Set(
    data.projects
      .filter(
        (project) =>
          !overdueTaskProjectIds.has(project.id) &&
          !overdueReleaseProjectIds.has(project.id),
      )
      .map((project) => project.id),
  );

  return {
    healthyProjectIds,
    overdueTaskProjectIds,
    overdueReleaseProjectIds,
  };
}

function filterAdminProjects(
  projects: ProjectRow[],
  summary: ReturnType<typeof getAdminProjectSummary>,
  filter: AdminProjectFilter | null,
) {
  if (!filter) return projects;

  const projectIds =
    filter === "healthy"
      ? summary.healthyProjectIds
      : filter === "overdue-tasks"
        ? summary.overdueTaskProjectIds
        : summary.overdueReleaseProjectIds;

  return projects.filter((project) => projectIds.has(project.id));
}

function getProjectStates(
  projectId: number,
  summary: ReturnType<typeof getAdminProjectSummary>,
) {
  const states: Array<{ label: string; className: string }> = [];

  if (summary.overdueTaskProjectIds.has(projectId)) {
    states.push({
      label: "期限超過タスクあり",
      className: styles.projectStateDanger,
    });
  }

  if (summary.overdueReleaseProjectIds.has(projectId)) {
    states.push({
      label: "リリース日期限超過",
      className: styles.projectStateDanger,
    });
  }

  if (states.length === 0) {
    states.push({
      label: "問題なし",
      className: styles.projectStateHealthy,
    });
  }

  return states;
}

function getProjectsByReleaseDate(projects: ProjectRow[]) {
  return [...projects].sort((left, right) => {
    const leftDate = dateOnly(left.object_published);
    const rightDate = dateOnly(right.object_published);
    if (!leftDate && !rightDate) return left.created_at.localeCompare(right.created_at);
    if (!leftDate) return 1;
    if (!rightDate) return -1;
    return leftDate.localeCompare(rightDate);
  });
}

function getInactiveUsers(data: AppData) {
  const assignedUserIds = new Set(
    data.tasks
      .map((task) => task.assigned_user_id)
      .filter((userId): userId is number => userId !== null),
  );

  return data.users
    .filter((user) => !assignedUserIds.has(user.id))
    .sort((left, right) => left.name.localeCompare(right.name, "ja"));
}

function projectStatus(status: number) {
  return projectStatuses[status as keyof typeof projectStatuses] ?? "未設定";
}

function projectStatusClass(status: number) {
  if (status === 4) return styles.statusComplete;
  if (status === 5) return styles.statusPaused;
  if (status === 2 || status === 3) return styles.statusTesting;
  return styles.statusActive;
}

function formatDisplayDate(value: string | null) {
  const normalized = dateOnly(value);
  if (!normalized) return "期限なし";
  const [year, month, day] = normalized.split("-");
  if (!year || !month || !day) return value;
  return `${year}/${month}/${day}`;
}

function dateOnly(value: string | null) {
  if (!value) return null;
  const normalized = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null;
}
