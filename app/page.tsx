/* eslint-disable @next/next/no-html-link-for-pages */
import {
  createLtAction,
  createMemberAction,
  createProjectAction,
  createTaskAction,
  deleteTaskAction,
  updateTaskStatusAction,
} from "./lib/actions";
import { logoutAction } from "./lib/auth-actions";
import { getCurrentUser, type AuthUser } from "./lib/auth";
import { projectRoles, projectStatuses, taskStatuses } from "./lib/domain";
import {
  getAppData,
  type AppData,
  type NoticeRow,
  type ProjectMemberRow,
  type ProjectRow,
  type TaskRow,
  type UserRow,
} from "./lib/supabase-data";
import { LoginForm } from "./login-form";

type Screen =
  | "dashboard"
  | "projects"
  | "project"
  | "project-new"
  | "tasks"
  | "members"
  | "member-new"
  | "account"
  | "lt"
  | "lt-new"
  | "notices";

const allowedScreens: Screen[] = [
  "dashboard",
  "projects",
  "project",
  "project-new",
  "tasks",
  "members",
  "member-new",
  "account",
  "lt",
  "lt-new",
  "notices",
];

const headerTitles: Record<Screen, string> = {
  dashboard: "ダッシュボード",
  projects: "プロジェクト",
  project: "プロジェクト",
  "project-new": "プロジェクト",
  tasks: "タスク一覧",
  members: "",
  "member-new": "メンバー",
  account: "メンバー",
  lt: "",
  "lt-new": "",
  notices: "連絡事項",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ screen?: string; projectId?: string; userId?: string }>;
}) {
  const params = await searchParams;
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return <LoginScreen />;
  }

  const screen = allowedScreens.includes(params.screen as Screen)
    ? (params.screen as Screen)
    : "dashboard";
  const data = await getAppData();

  return (
    <div className="shell">
      <Sidebar active={screen} data={data} projectId={params.projectId} />
      <main className="main">
        <Header
          screen={screen}
          data={data}
          projectId={params.projectId}
          currentUser={currentUser}
        />
        <div className={`content content-${screen}`}>
          {renderScreen(screen, data, params)}
        </div>
      </main>
    </div>
  );
}

function LoginScreen() {
  return (
    <main className="login-shell">
      <section className="login-copy">
        <strong>AI研究会</strong>
        <h2>エンタープライズ管理</h2>
        <p>プロジェクト、タスク、メンバー情報をひとつの管理画面で扱います。</p>
      </section>
      <LoginForm />
    </main>
  );
}

function Sidebar({
  active,
  data,
  projectId,
}: {
  active: Screen;
  data: AppData;
  projectId?: string;
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <strong>AI研究会</strong>
        <span>エンタープライズ管理</span>
      </div>
      <nav>
        <NavLink screen="dashboard" active={active} icon="layout" label="ダッシュボード" />
        <details className="nav-disclosure" open>
          <summary className="nav-section">
            <span className="chevron"><Icon name="chevron-down" /></span>
            <b>プロジェクト</b>
          </summary>
          <NavLink screen="tasks" active={active} icon="clipboard" label="タスク一覧" child />
          <NavLink screen="projects" active={active} icon="chevron-down" label="参加プロジェクト一覧" child />
          <div className="project-children">
            {data.projects.slice(0, 4).map((project) => (
              <a
                className={`nav-item child-deep ${
                  active === "project" && String(project.id) === String(findProject(data, projectId)?.id)
                    ? "active"
                    : ""
                }`}
                href={`/?screen=project&projectId=${project.id}`}
                key={project.id}
              >
                <span />
                <b>{project.title}</b>
              </a>
            ))}
          </div>
          <NavLink screen="project-new" active={active} icon="plus-circle" label="プロジェクトの新規作成" child />
        </details>
        <NavLink screen="members" active={active} icon="users" label="メンバー一覧" />
        <NavLink screen="lt" active={active} icon="presentation" label="LT一覧" />
        <p className="nav-group">組織管理</p>
        <NavLink screen="notices" active={active} icon="megaphone" label="連絡事項" />
        <NavLink screen="dashboard" active={active} icon="calendar-check" label="出欠確認" inactive />
        <hr />
        <NavLink screen="dashboard" active={active} icon="settings" label="設定" inactive />
        <NavLink screen="dashboard" active={active} icon="help-circle" label="ヘルプ" inactive />
      </nav>
    </aside>
  );
}

function NavLink({
  screen,
  active,
  icon,
  label,
  child,
  inactive,
}: {
  screen: Screen;
  active: Screen;
  icon: IconName;
  label: string;
  child?: boolean;
  inactive?: boolean;
}) {
  return (
    <a
      className={`nav-item ${!inactive && active === screen ? "active" : ""} ${child ? "child-true" : ""}`}
      href={`/?screen=${screen}`}
    >
      <span><Icon name={icon} /></span>
      <b>{label}</b>
    </a>
  );
}

function Header({
  screen,
  data,
  projectId,
  currentUser,
}: {
  screen: Screen;
  data: AppData;
  projectId?: string;
  currentUser: AuthUser;
}) {
  const project = findProject(data, projectId);
  const title = screen === "project" ? project?.title : headerTitles[screen];

  return (
    <header className="topbar">
      {title ? <h2>{title}</h2> : null}
      <div className="search">
        <Icon name="search" />
        <span>プロジェクト内を検索</span>
      </div>
      <div className="toplinks">
        <a className="icon-link" href="/?screen=notices" aria-label="お知らせ" title="お知らせ">
          <Icon name="bell-dot" />
        </a>
        <a className="icon-link" href="/?screen=dashboard" aria-label="カレンダー" title="カレンダー">
          <Icon name="calendar" />
        </a>
        <i />
        <span className="icon-link" aria-label="通知" title="通知">
          <Icon name="bell" />
        </span>
        <span className="user-chip">{currentUser.name}</span>
        <a className="avatar" href="/?screen=account">
          <Icon name="account" />
        </a>
        <form action={logoutAction}>
          <button className="logout-button" title="ログアウト">ログアウト</button>
        </form>
      </div>
    </header>
  );
}

type IconName =
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

function Icon({ name }: { name: IconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...common}>
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

function renderScreen(
  screen: Screen,
  data: AppData,
  params: { projectId?: string; userId?: string },
) {
  switch (screen) {
    case "projects":
      return <Projects data={data} />;
    case "project":
      return <ProjectDetail data={data} projectId={params.projectId} />;
    case "project-new":
      return <ProjectNew />;
    case "tasks":
      return <Tasks data={data} projectId={params.projectId} />;
    case "members":
      return <Members data={data} />;
    case "member-new":
      return <MemberNew />;
    case "account":
      return <Account data={data} userId={params.userId} />;
    case "lt":
      return <LtList />;
    case "lt-new":
      return <LtNew />;
    case "notices":
      return <Notices data={data} />;
    default:
      return <Dashboard data={data} />;
  }
}

function Dashboard({ data }: { data: AppData }) {
  const taskStats = getMyTaskStats(data);

  return (
    <>
      <h1>ダッシュボード</h1>
      <p className="lead">現在のプロジェクト状況と本日のスケジュールを確認しましょう</p>
      <div className="stats">
        <Stat label="完了したタスク" value={String(taskStats.completed)} note="件" />
        <Stat label="進行中のタスク" value={String(taskStats.inProgress)} note="件" />
        <Stat label="期限超過したタスク" value={String(taskStats.overdue)} note="件" danger={taskStats.overdue > 0} />
      </div>
      <div className="dashboard-grid">
        <section className="panel kanban-small">
          <h3>タスク管理</h3>
          <EmptyState title="タスクデータは未接続です" text="tasksテーブル追加後にカンバンを表示します。" />
        </section>
        <aside className="dash-right">
          <section className="panel progress-card">
            <h3>進捗管理</h3>
            <EmptyState title="進捗データは未接続です" text="project_progress_snapshotsテーブル追加後に表示します。" />
          </section>
          <section className="panel workload">
            <h3>稼働状況</h3>
            <EmptyState title="稼働データは未接続です" />
          </section>
        </aside>
      </div>
    </>
  );
}

function Projects({ data }: { data: AppData }) {
  return (
    <>
      <div className="title-row">
        <div>
          <small>ダッシュボード ＞ <b>プロジェクト一覧</b></small>
          <h1>プロジェクト一覧</h1>
        </div>
        <a className="primary" href="/?screen=project-new">＋ 新規追加</a>
      </div>
      {data.projects.length ? (
        <>
          <div className="project-cards">
            {data.projects.slice(0, 3).map((project) => (
              <ProjectCard data={data} project={project} key={project.id} />
            ))}
          </div>
          <h2 className="section-title">詳細リストビュー</h2>
          <section className="table-card">
            <div className="table-head">
              <span>プロジェクト名</span>
              <span>ステータス</span>
              <span>参加人数</span>
              <span>更新日</span>
              <span />
            </div>
            {data.projects.map((project) => (
              <div className="table-row" key={project.id}>
                <span><i>▣</i>{project.title}</span>
                <span><mark>{projectStatus(project.status)}</mark></span>
                <span>{memberCountForProject(data, project.id)}名</span>
                <span>{formatDate(project.updated_at)}</span>
                <a href={`/?screen=project&projectId=${project.id}`}>↗</a>
              </div>
            ))}
          </section>
        </>
      ) : (
        <EmptyState title="プロジェクトは未登録です" text="新規作成フォームから登録できます。" />
      )}
    </>
  );
}

function ProjectCard({ data, project }: { data: AppData; project: ProjectRow }) {
  return (
    <article className="project-card">
      <h3>{project.title}</h3>
      <b>⋮</b>
      <p>{project.description || project.goal}</p>
      <dl>
        <dt>参加人数</dt>
        <dd>{memberCountForProject(data, project.id)}人</dd>
        <dt>種別</dt>
        <dd>{project.type}</dd>
      </dl>
    </article>
  );
}

function ProjectDetail({ data, projectId }: { data: AppData; projectId?: string }) {
  const project = findProject(data, projectId);
  if (!project) {
    return <EmptyState title="表示できるプロジェクトがありません" text="プロジェクトを登録してください。" />;
  }

  const members = data.projectMembers
    .filter((member) => member.project_id === project.id)
    .map((member) => ({
      relation: member,
      user: data.users.find((user) => user.id === member.user_id),
    }))
    .filter((item): item is { relation: ProjectMemberRow; user: UserRow } => Boolean(item.user));
  const projectTasks = data.tasks.filter((task) => task.project_id === project.id);

  return (
    <div className="detail-layout">
      <div>
        <h1>{project.title}</h1>
        <section className="panel task-table">
          <h3>タスク</h3>
          {projectTasks.length ? (
            <>
              <div className="task-table-head">
                <span>タイトル</span>
                <span>担当</span>
                <span>状態</span>
                <span>期限</span>
              </div>
              {projectTasks.slice(0, 5).map((task) => (
                <div className="task-table-row" key={task.id}>
                  <span>{task.title}</span>
                  <span>{taskAssigneeName(data, task.assigned_user_id)}</span>
                  <span><mark>{taskStatusLabel(task.status)}</mark></span>
                  <span>{formatDate(task.due_date)}</span>
                </div>
              ))}
            </>
          ) : (
            <EmptyState title="タスクは未登録です" text="タスク一覧から作成できます。" />
          )}
          <a className="outline" href={`/?screen=tasks&projectId=${project.id}`}>タスク一覧へ</a>
        </section>
        <section className="panel chart">
          <h3>進捗管理</h3>
          <div>project_progress_snapshots テーブル追加後に表示します。</div>
        </section>
        <section className="panel members-mini">
          <h3>チームメンバー <span>{members.length}名</span></h3>
          {members.length ? members.map(({ relation, user }) => (
            <p key={user.id}>
              {user.name}<b>{projectRole(relation.role)}</b>
            </p>
          )) : <EmptyState title="参加メンバーは未登録です" />}
          <a href="/?screen=member-new">メンバー追加</a>
        </section>
      </div>
      <aside className="about">
        <h2>About</h2>
        <p>{project.description || "説明は未登録です。"}</p>
        <h2>Goal</h2>
        <p>{project.goal}</p>
        <h2>Links</h2>
        <LinkOrEmpty href={project.doc_url} label="ドキュメント" />
        <LinkOrEmpty href={project.repository_url} label="リポジトリ" />
      </aside>
    </div>
  );
}

function Tasks({ data, projectId }: { data: AppData; projectId?: string }) {
  const lanes: Array<{ status: 0 | 1 | 2; color: string }> = [
    { status: 0, color: "purple" },
    { status: 1, color: "yellow" },
    { status: 2, color: "green" },
  ];
  const selectedProjectId = findProject(data, projectId)?.id ?? data.projects[0]?.id ?? "";

  return (
    <>
      <div className="board-head">
        <div>
          <h1>タスク一覧</h1>
          <p>tasks テーブルに登録されたタスクを状態別に表示します。</p>
        </div>
      </div>
      <form action={createTaskAction} className="task-create panel">
        <div className="task-create-grid">
          <label>プロジェクト *
            <select name="project_id" required defaultValue={selectedProjectId}>
              <option value="">選択してください</option>
              {data.projects.map((project) => (
                <option value={project.id} key={project.id}>{project.title}</option>
              ))}
            </select>
          </label>
          <label>担当者
            <select name="assigned_user_id" defaultValue="">
              <option value="">未設定</option>
              {data.users.map((user) => (
                <option value={user.id} key={user.id}>{user.name}</option>
              ))}
            </select>
          </label>
          <label>状態
            <select name="status" defaultValue="0">
              {lanes.map((lane) => (
                <option value={lane.status} key={lane.status}>{taskStatusLabel(lane.status)}</option>
              ))}
            </select>
          </label>
          <label className="wide">タイトル *<input name="title" required placeholder="タスク名を入力" /></label>
          <label className="wide">説明<textarea name="description" placeholder="必要な作業内容や補足を入力" /></label>
          <label>開始予定<input name="start_time" type="datetime-local" /></label>
          <label>終了予定<input name="end_time" type="datetime-local" /></label>
          <label>期限<input name="due_date" type="date" /></label>
        </div>
        <div className="task-create-actions"><button className="primary">タスクを追加</button></div>
      </form>
      <div className="board task-board">
        {lanes.map((lane) => {
          const tasks = data.tasks.filter((task) => task.status === lane.status);
          return (
            <section className={`lane ${lane.color}`} key={lane.status}>
              <h3><span />{taskStatusLabel(lane.status)}<em>{tasks.length}</em><b>...</b></h3>
              {tasks.length ? tasks.map((task) => (
                <TaskCard data={data} task={task} key={task.id} />
              )) : <EmptyState title="未登録" />}
            </section>
          );
        })}
      </div>
    </>
  );
}

function TaskCard({ data, task }: { data: AppData; task: TaskRow }) {
  const project = data.projects.find((item) => item.id === task.project_id);
  const nextStatuses = ([0, 1, 2] as const).filter((status) => status !== task.status);

  return (
    <article className="task-card">
      <p>{task.title}</p>
      {task.description ? <small>{task.description}</small> : null}
      <dl>
        <dt>Project</dt><dd>{project?.title ?? "-"}</dd>
        <dt>Assignee</dt><dd>{taskAssigneeName(data, task.assigned_user_id)}</dd>
        <dt>Due</dt><dd>{formatDate(task.due_date)}</dd>
      </dl>
      <div className="task-actions">
        {nextStatuses.map((status) => (
          <form action={updateTaskStatusAction} key={status}>
            <input type="hidden" name="id" value={task.id} />
            <input type="hidden" name="status" value={status} />
            <button>{taskStatusLabel(status)}</button>
          </form>
        ))}
        <form action={deleteTaskAction}>
          <input type="hidden" name="id" value={task.id} />
          <button className="danger-button">削除</button>
        </form>
      </div>
    </article>
  );
}
function Members({ data }: { data: AppData }) {
  return (
    <>
      <div className="title-row">
        <div>
          <h1>メンバー一覧</h1>
          <p className="lead">Supabaseのusersテーブルに登録されたメンバーを表示します。</p>
        </div>
        <div>
          <button className="outline">絞り込み</button>
          <a className="primary" href="/?screen=member-new">メンバー追加</a>
        </div>
      </div>
      <div className="stats two">
        <Stat label="メンバー総数" value={String(data.users.length)} note="名" />
        <Stat label="クラス数" value={String(data.classes.length)} note="件" />
      </div>
      {data.users.length ? (
        <section className="member-table">
          <div><span>氏名</span><span>学年</span><span>クラス</span><span>参加プロジェクト数</span><span>詳細</span></div>
          {data.users.map((user) => (
            <a href={`/?screen=account&userId=${user.id}`} key={user.id}>
              <span><b>{user.name}</b><small>{user.email}</small></span>
              <span>{user.grade}年生</span>
              <span>{className(data, user.class_id)}</span>
              <span><mark>{memberProjectCount(data, user.id)}</mark></span>
              <span>›</span>
            </a>
          ))}
          <footer>表示中: {data.users.length} / 全 {data.users.length} 名</footer>
        </section>
      ) : (
        <EmptyState title="メンバーは未登録です" text="メンバー追加フォームから登録できます。" />
      )}
    </>
  );
}

function MemberNew() {
  return (
    <>
      <h1>メンバー追加</h1>
      <form action={createMemberAction} className="form-card member-form">
        <div className="form-grid">
          <label>名前 *<input name="name" placeholder="氏名を入力" /></label>
          <label className="wide">クラス *<input name="class_name" placeholder="クラス名を入力" /></label>
          <label>メールアドレス<input name="email" placeholder="name@example.ac.jp" /></label>
          <label>学年<select name="grade"><option value="">選択してください</option><option value="1">1年生</option><option value="2">2年生</option><option value="3">3年生</option></select></label>
        </div>
        <div className="form-actions"><button type="button">キャンセル</button><button className="primary">登録する</button></div>
      </form>
    </>
  );
}

function ProjectNew() {
  return (
    <>
      <a className="back" href="/?screen=projects">←プロジェクト一覧へ戻る</a>
      <form action={createProjectAction} className="create-card">
        <h1>プロジェクト新規作成</h1><hr />
        <div className="create-row">
          <div><h3>基本情報</h3><p>projectsテーブルへ保存する項目です。</p></div>
          <div>
            <label>プロジェクト名 *<input name="title" required placeholder="プロジェクト名を入力" /></label>
            <label>概要<textarea name="description" placeholder="概要を入力" /></label>
            <label>目標 *<input name="goal" required placeholder="目標を入力" /></label>
            <label>種別 *<input name="type" required placeholder="種別を入力" /></label>
          </div>
        </div>
        <div className="create-row">
          <div><h3>リンク</h3><p>任意項目です。</p></div>
          <div className="inline">
            <label>ドキュメントURL<input name="doc_url" placeholder="https://..." /></label>
            <label>リポジトリURL<input name="repository_url" placeholder="https://..." /></label>
          </div>
        </div>
        <footer>
          <a className="button-link cancel-link" href="/?screen=projects">キャンセル</a>
          <button className="primary project-create-button">プロジェクトを作成</button>
        </footer>
      </form>
    </>
  );
}

function Account({ data, userId }: { data: AppData; userId?: string }) {
  const user = findUser(data, userId);
  if (!user) {
    return <EmptyState title="表示できるメンバーがありません" text="メンバーを登録してください。" />;
  }
  const projects = data.projectMembers
    .filter((member) => member.user_id === user.id)
    .map((member) => ({
      relation: member,
      project: data.projects.find((project) => project.id === member.project_id),
    }))
    .filter((item): item is { relation: ProjectMemberRow; project: ProjectRow } => Boolean(item.project));

  return (
    <>
      <h1>{user.name}</h1><p className="lead">{user.email}</p>
      <div className="info-cards">
        <div><small>学年</small><p>{user.grade}年生</p></div>
        <div><small>クラス</small><p>{className(data, user.class_id)}</p></div>
      </div>
      <section className="project-list">
        <h2>▣ 参加プロジェクト</h2>
        {projects.length ? projects.map(({ relation, project }) => (
          <p key={project.id}><span />{project.title}<mark>{projectRole(relation.role)}</mark></p>
        )) : <EmptyState title="参加プロジェクトは未登録です" />}
        <footer><button>プロフィールを編集</button><button className="primary">変更を保存</button></footer>
      </section>
    </>
  );
}

function LtList() {
  return (
    <>
      <div className="title-row">
        <div><h1>LT一覧</h1><p className="lead">lt_talksテーブル追加後に表示します。</p></div>
        <a className="primary" href="/?screen=lt-new">＋ 新規作成</a>
      </div>
      <EmptyState title="LTデータは未接続です" text="lt_talksテーブル追加後に一覧を表示します。" />
    </>
  );
}

function LtNew() {
  return (
    <>
      <small className="crumb">LT一覧 ＞ 新規作成</small>
      <h1>LT作成</h1>
      <p className="lead">LT登録用の入力枠です。保存処理はlt_talksテーブル追加後に接続します。</p>
      <div className="form-layout">
        <form action={createLtAction} className="form-card">
          <div className="form-grid">
            <label>発表者 *<input name="speaker" placeholder="氏名を入力" /></label>
            <label>日付 *<input name="date" placeholder="mm/dd/yyyy" /></label>
            <label className="wide">タイトル *<input name="title" placeholder="タイトルを入力" /></label>
            <label>資料URL<input name="material_url" placeholder="https://..." /></label>
            <label>カテゴリ<select name="category"><option value="">選択してください</option></select></label>
            <label className="wide">概要 *<textarea name="summary" placeholder="概要を入力" /></label>
          </div>
          <div className="form-actions"><button type="button">キャンセル</button><button className="primary">登録する</button></div>
        </form>
        <aside className="hint"><h3>未接続</h3><p>lt_talksテーブルとRLSポリシー確定後に保存処理を実装します。</p></aside>
      </div>
    </>
  );
}

function Notices({ data }: { data: AppData }) {
  return (
    <>
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
    </>
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

function Stat({ label, value, note, danger }: { label: string; value: string; note: string; danger?: boolean }) {
  return (
    <div className="stat">
      <small>{label}</small>
      <strong className={danger ? "danger" : ""}>{value}</strong>
      <span>{note}</span>
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

function LinkOrEmpty({ href, label }: { href: string | null; label: string }) {
  return href ? <p><a href={href}>{label}</a></p> : <p>{label}: 未登録</p>;
}

function getMyTaskStats(data: AppData) {
  const currentUser = data.users[0];
  const today = formatDateOnly(new Date());
  const myTasks = currentUser
    ? data.tasks.filter((task) => task.assigned_user_id === currentUser.id)
    : [];

  return {
    completed: myTasks.filter((task) => task.status === 2).length,
    inProgress: myTasks.filter((task) => task.status === 1).length,
    overdue: myTasks.filter((task) => {
      return task.status !== 2 && Boolean(task.due_date) && task.due_date! < today;
    }).length,
  };
}

function formatDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function findProject(data: AppData, projectId?: string) {
  const id = Number(projectId);
  return data.projects.find((project) => project.id === id) ?? data.projects[0];
}

function findUser(data: AppData, userId?: string) {
  const id = Number(userId);
  return data.users.find((user) => user.id === id) ?? data.users[0];
}

function memberCountForProject(data: AppData, projectId: number) {
  return data.projectMembers.filter((member) => member.project_id === projectId).length;
}

function memberProjectCount(data: AppData, userId: number) {
  return data.projectMembers.filter((member) => member.user_id === userId).length;
}

function className(data: AppData, classId: number) {
  return data.classes.find((item) => item.id === classId)?.name ?? "-";
}

function projectStatus(status: number) {
  return projectStatuses[status as keyof typeof projectStatuses] ?? "未設定";
}

function projectRole(role: number) {
  return projectRoles[role as keyof typeof projectRoles] ?? "メンバー";
}

function taskStatusLabel(status: number) {
  return taskStatuses[status as keyof typeof taskStatuses] ?? "未設定";
}

function taskAssigneeName(data: AppData, userId: number | null) {
  if (!userId) return "未設定";
  return data.users.find((user) => user.id === userId)?.name ?? "未設定";
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10).replaceAll("-", "/");
}
