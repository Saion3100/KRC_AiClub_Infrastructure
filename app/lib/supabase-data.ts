export type ClassRow = {
  id: number;
  name: string;
};

export type UserRow = {
  id: number;
  name: string;
  email: string;
  app_role: "admin" | "member";
  grade: number;
  class_id: number;
  graduation: string;
  is_deleted: boolean;
};

export type ProjectRow = {
  id: number;
  title: string;
  description: string | null;
  goal: string;
  status: number;
  type: string;
  doc_url: string | null;
  repository_url: string | null;
  object_published: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectMemberRow = {
  project_id: number;
  user_id: number;
  role: number;
  is_deleted: boolean;
};

export type TaskRow = {
  id: number;
  project_id: number;
  assigned_user_id: number | null;
  title: string;
  description: string | null;
  status: number;
  start_time: string | null;
  end_time: string | null;
  due_date: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

export type NoticeRow = {
  title: string;
  created_at: string;
  contents: string | null;
  name: string;
};

export type LtRow = {
  id: number;
  user_id: number;
  title: string;
  presentation_date: string;
  document_url: string | null;
  category: string | null;
  summary: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

export type AppData = {
  classes: ClassRow[];
  users: UserRow[];
  projects: ProjectRow[];
  projectMembers: ProjectMemberRow[];
  tasks: TaskRow[];
  notices: NoticeRow[];
  lts: LtRow[];
  error?: string;
};

const emptyData: AppData = {
  classes: [],
  users: [],
  projects: [],
  projectMembers: [],
  tasks: [],
  notices: [],
  lts: [],
};

export async function getAppData(): Promise<AppData> {
  try {
    const [classes, users, projects, projectMembers, tasks, notices, lts] = await Promise.all([
      supabaseSelect<ClassRow>("classes", "id,name", "id.asc"),
      supabaseSelect<UserRow>(
        "users",
        "id,name,email,app_role,grade,class_id,graduation,is_deleted",
        "id.asc",
        "is_deleted=eq.false",
      ),
      supabaseSelect<ProjectRow>(
        "projects",
        "id,title,description,goal,status,type,doc_url,repository_url,object_published,is_deleted,created_at,updated_at",
        "created_at.desc",
        "is_deleted=eq.false",
      ),
      supabaseSelect<ProjectMemberRow>(
        "project_members",
        "project_id,user_id,role,is_deleted",
        "project_id.asc",
        "is_deleted=eq.false",
      ),
      supabaseSelect<TaskRow>(
        "tasks",
        "id,project_id,assigned_user_id,title,description,status,start_time,end_time,due_date,is_deleted,created_at,updated_at",
        "due_date.asc.nullslast",
        "is_deleted=eq.false",
      ),
      supabaseSelect<NoticeRow>(
        "notices",
        "title,created_at,contents,name",
        "created_at.desc",
      ),
      supabaseSelect<LtRow>(
        "lts",
        "id,user_id,title,presentation_date,document_url,category,summary,is_deleted,created_at,updated_at",
        "presentation_date.desc",
        "is_deleted=eq.false",
      ),
    ]);

    const firstError = [classes, users, projects, projectMembers, tasks, notices, lts].find(
      (result) => !result.ok,
    );

    if (firstError?.error) {
      console.error(`Supabase fetch error: ${firstError.error}`);
    }

    return {
      classes: classes.data,
      users: users.data,
      projects: projects.data,
      projectMembers: projectMembers.data,
      tasks: tasks.data,
      notices: notices.data,
      lts: lts.data,
      error: firstError?.error,
    };
  } catch (error) {
    console.error(
      "Supabase fetch error:",
      error instanceof Error ? error.message : error,
    );

    return {
      ...emptyData,
      error: error instanceof Error ? error.message : "Failed to load app data.",
    };
  }
}

export async function getSignupClasses(): Promise<ClassRow[]> {
  const result = await supabaseSelect<ClassRow>("classes", "id,name", "id.asc");
  return result.data;
}

async function supabaseSelect<T>(
  table: string,
  select: string,
  order?: string,
  filter?: string,
): Promise<{ ok: boolean; data: T[]; error?: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { ok: false, data: [], error: "Supabase environment variables are missing." };
  }

  const params = new URLSearchParams({ select });
  if (order) params.set("order", order);
  const filterSuffix = filter ? `&${filter}` : "";
  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/${table}?${params.toString()}${filterSuffix}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: "no-store",
    });

    const body = await response.text();

    if (!response.ok) {
      return {
        ok: false,
        data: [],
        error: `${table}: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`,
      };
    }

    if (!body.trim()) {
      return { ok: true, data: [] };
    }

    const parsed = safeParseArray<T>(body);
    if (!parsed.ok) {
      return {
        ok: false,
        data: [],
        error: `${table}: Supabase returned a non-JSON response.`,
      };
    }

    return { ok: true, data: parsed.data };
  } catch (error) {
    return {
      ok: false,
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch Supabase data.",
    };
  }
}

function safeParseArray<T>(body: string): { ok: true; data: T[] } | { ok: false } {
  try {
    const parsed: unknown = globalThis.JSON.parse(body);
    return { ok: true, data: Array.isArray(parsed) ? (parsed as T[]) : [] };
  } catch {
    return { ok: false };
  }
}

export function hasSupabaseRows(data: AppData) {
  return (
    data.classes.length > 0 ||
    data.users.length > 0 ||
    data.projects.length > 0 ||
    data.projectMembers.length > 0 ||
    data.tasks.length > 0 ||
    data.notices.length > 0 ||
    data.lts.length > 0
  );
}

export { emptyData };
