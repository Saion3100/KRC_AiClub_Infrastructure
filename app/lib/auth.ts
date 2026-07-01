import { createHmac, randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AppRole = "admin" | "member";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  appRole: AppRole;
};

type SessionPayload = AuthUser & {
  expiresAt: number;
};

export type LoginState = {
  error?: string;
};

export type SignupState = {
  error?: string;
};

const sessionCookieName = "krc_session";
const sessionMaxAgeSeconds = 60 * 60 * 8;

type LoginUserRow = {
  id: number;
  name: string;
  email: string;
  app_role: AppRole | null;
  password_hash: string | null;
};

type SignupUserRow = {
  id: number;
  name: string;
  email: string;
  app_role: AppRole | null;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(sessionCookieName)?.value;
  if (!session) return null;

  const payload = verifySession(session);
  if (!payload) return null;

  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    appRole: payload.appRole,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  return user;
}

export async function createSession(user: AuthUser): Promise<void> {
  const expiresAt = Date.now() + sessionMaxAgeSeconds * 1000;
  const value = signSession({ ...user, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAgeSeconds,
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export function validateLoginConfig(): string | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return "NEXT_PUBLIC_SUPABASE_URL を設定してください。";
  }

  if (!supabaseServerKey()) {
    return "SUPABASE_SERVICE_ROLE_KEY を設定してください。";
  }

  if (!sessionSecret()) {
    return "AUTH_SECRET を設定してください。";
  }

  return null;
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const users = await supabaseRequest<LoginUserRow[]>(
    `users?select=id,name,email,app_role,password_hash&email=eq.${encodeURIComponent(email)}&is_deleted=eq.false&limit=1`,
    { method: "GET" },
  );
  const user = users[0];

  if (!user?.password_hash) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return null;
  }

  await supabaseRequest(
    `users?id=eq.${user.id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ last_login_at: new Date().toISOString() }),
    },
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    appRole: user.app_role === "admin" ? "admin" : "member",
  };
}

export async function signupUser(input: {
  name: string;
  email: string;
  password: string;
  classId: number;
  grade: number;
}): Promise<AuthUser | { error: string }> {
  const existing = await supabaseRequest<Array<{ id: number }>>(
    `users?select=id&email=eq.${encodeURIComponent(input.email)}&is_deleted=eq.false&limit=1`,
    { method: "GET" },
  );

  if (existing.length > 0) {
    return { error: "このメールアドレスはすでに登録されています。" };
  }

  const classes = await supabaseRequest<Array<{ id: number }>>(
    `classes?select=id&id=eq.${input.classId}&limit=1`,
    { method: "GET" },
  );
  if (!classes[0]) {
    return { error: "選択されたクラスが見つかりません。" };
  }

  const passwordHash = await hashPassword(input.password);
  const users = await supabaseRequest<SignupUserRow[]>(
    "users?select=id,name,email,app_role",
    {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        app_role: "member",
        password_hash: passwordHash,
        grade: input.grade,
        class_id: input.classId,
        graduation: estimatedGraduationDate(input.grade),
        is_deleted: false,
      }),
    },
  );
  const user = users[0];

  if (!user) {
    return { error: "アカウントを作成できませんでした。" };
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    appRole: user.app_role === "admin" ? "admin" : "member",
  };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const key = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt$16384$8$1$${salt}$${key.toString("base64url")}`;
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  const [algorithm, cost, blockSize, parallelization, salt, storedKey] = passwordHash.split("$");
  if (algorithm !== "scrypt" || !cost || !blockSize || !parallelization || !salt || !storedKey) {
    return false;
  }

  const key = (await scryptAsync(password, salt, 64, {
    N: Number(cost),
    r: Number(blockSize),
    p: Number(parallelization),
  })) as Buffer;

  return safeEqual(key.toString("base64url"), storedKey);
}

export async function getProjectRole(
  userId: number,
  projectId: number,
): Promise<number | null> {
  const rows = await supabaseRequest<Array<{ role: number }>>(
    `project_members?select=role&user_id=eq.${userId}&project_id=eq.${projectId}&is_deleted=eq.false&limit=1`,
    { method: "GET" },
  );

  return rows[0]?.role ?? null;
}

export async function canManageProject(
  user: AuthUser,
  projectId: number,
): Promise<boolean> {
  if (user.appRole === "admin") return true;
  const role = await getProjectRole(user.id, projectId);
  return role !== null && role >= 2;
}

export async function canUpdateTask(
  user: AuthUser,
  taskId: number,
): Promise<boolean> {
  if (user.appRole === "admin") return true;
  const task = await supabaseRequest<Array<{ project_id: number; assigned_user_id: number | null }>>(
    `tasks?select=project_id,assigned_user_id&id=eq.${taskId}&is_deleted=eq.false&limit=1`,
    { method: "GET" },
  );
  const row = task[0];
  if (!row) return false;
  if (row.assigned_user_id === user.id) return true;

  const role = await getProjectRole(user.id, row.project_id);
  return role !== null && role >= 2;
}

export async function canDeleteTask(
  user: AuthUser,
  taskId: number,
): Promise<boolean> {
  if (user.appRole === "admin") return true;
  const task = await supabaseRequest<Array<{ project_id: number }>>(
    `tasks?select=project_id&id=eq.${taskId}&is_deleted=eq.false&limit=1`,
    { method: "GET" },
  );
  const projectId = task[0]?.project_id;
  if (!projectId) return false;

  return canManageProject(user, projectId);
}

function signSession(payload: SessionPayload) {
  const encodedPayload = encode(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function verifySession(value: string): SessionPayload | null {
  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature || !safeEqual(signature, sign(encodedPayload))) {
    return null;
  }

  try {
    const payload = JSON.parse(decode(encodedPayload)) as Partial<SessionPayload>;
    if (
      typeof payload.id !== "number" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      !isAppRole(payload.appRole) ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return payload as SessionPayload;
  } catch {
    return null;
  }
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret() || "")
    .update(value)
    .digest("base64url");
}

function sessionSecret() {
  return process.env.AUTH_SECRET || process.env.SESSION_SECRET || "";
}

function estimatedGraduationDate(grade: number) {
  const now = new Date();
  const yearsUntilGraduation = Math.max(0, 4 - grade);
  return `${now.getFullYear() + yearsUntilGraduation}-03-31`;
}

async function supabaseRequest<T>(path: string, init: RequestInit): Promise<T> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseServerKey();

  if (!url || !key) {
    throw new Error("Supabase server environment variables are missing.");
  }

  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase auth request failed: ${response.status} ${response.statusText}`);
  }

  const body = await response.text();
  return (body ? JSON.parse(body) : undefined) as T;
}

function supabaseServerKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function isAppRole(value: unknown): value is AppRole {
  return value === "admin" || value === "member";
}

function scryptAsync(
  password: string,
  salt: string,
  keylen: number,
  options?: ScryptOptions,
) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, keylen, options ?? {}, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;

  return timingSafeEqual(left, right);
}
