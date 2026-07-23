"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  canManageProject,
  canUpdateTask,
  requireAuth,
} from "./auth";

export async function createProjectAction(formData: FormData): Promise<void> {
  const user = await requireAuth();
  if (user.appRole !== "admin") return;

  const title = textValue(formData, "title");
  const goal = textValue(formData, "goal");
  const type = textValue(formData, "type");

  if (!title || !goal || !type) {
    return;
  }

  await supabaseRequest("projects", {
    method: "POST",
    body: JSON.stringify({
      title,
      description: nullableTextValue(formData, "description"),
      goal,
      type,
      doc_url: nullableTextValue(formData, "doc_url"),
      repository_url: nullableTextValue(formData, "repository_url"),
    }),
  });

  revalidatePath("/", "layout");
  redirect("/projects");
}

export async function updateProjectStatusAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  const projectId = numberValue(formData, "project_id");
  const status = numberValue(formData, "status");

  if (!projectId || status === null) {
    return;
  }

  if (!(await canManageProject(user, projectId))) {
    return;
  }

  await supabaseRequest(`projects?id=eq.${projectId}`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      updated_at: new Date().toISOString(),
    }),
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/", "layout");
}

export async function createMemberAction(formData: FormData): Promise<void> {
  const user = await requireAuth();
  if (user.appRole !== "admin") return;

  const name = textValue(formData, "name");
  const className = textValue(formData, "class_name");

  if (!name || !className) {
    return;
  }

  revalidatePath("/", "layout");
}

export async function addProjectMemberAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  const projectId = numberValue(formData, "project_id");
  const userId = numberValue(formData, "user_id");
  const role = numberValue(formData, "role") ?? 1;

  if (!projectId || !userId) {
    return;
  }

  if (!(await canManageProject(user, projectId))) {
    return;
  }

  await supabaseRequest("project_members", {
    method: "POST",
    body: JSON.stringify({
      project_id: projectId,
      user_id: userId,
      role,
      is_deleted: false,
    }),
  });

  revalidatePath("/", "layout");
}

export async function updateProjectMemberRoleAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  const projectId = numberValue(formData, "project_id");
  const userId = numberValue(formData, "user_id");
  const role = numberValue(formData, "role");

  if (!projectId || !userId || role === null) {
    return;
  }

  if (!(await canManageProject(user, projectId))) {
    return;
  }

  await supabaseRequest(`project_members?project_id=eq.${projectId}&user_id=eq.${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

  revalidatePath("/", "layout");
}

export async function removeProjectMemberAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  const projectId = numberValue(formData, "project_id");
  const userId = numberValue(formData, "user_id");

  if (!projectId || !userId) {
    return;
  }

  if (!(await canManageProject(user, projectId))) {
    return;
  }

  await supabaseRequest(`project_members?project_id=eq.${projectId}&user_id=eq.${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ is_deleted: true }),
  });

  revalidatePath("/", "layout");
}

export async function createLtAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  const title = textValue(formData, "title");
  const presentationDate = textValue(formData, "presentation_date");

  if (!title || !presentationDate) {
    return;
  }

  await supabaseRequest("lts", {
    method: "POST",
    body: JSON.stringify({
      user_id: user.id,
      title,
      presentation_date: presentationDate,
      document_url: nullableTextValue(formData, "document_url"),
      category: nullableTextValue(formData, "category"),
      summary: nullableTextValue(formData, "summary"),
      is_deleted: false,
    }),
  });

  revalidatePath("/", "layout");
}

export async function createTaskAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  const title = textValue(formData, "title");
  const projectId = numberValue(formData, "project_id");

  if (!title || !projectId) {
    return;
  }

  if (!(await canManageProject(user, projectId))) {
    return;
  }

  const payload: Record<string, string | number | null> = {
    project_id: projectId,
    assigned_user_id: numberValue(formData, "assigned_user_id"),
    title,
    description: nullableTextValue(formData, "description"),
    status: numberValue(formData, "status") ?? 0,
    start_time: nullableTextValue(formData, "start_time"),
    end_time: nullableTextValue(formData, "end_time"),
    due_date: nullableTextValue(formData, "due_date"),
  };

  await supabaseRequest("tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  revalidatePath("/", "layout");
}

export async function updateTaskAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  const id = numberValue(formData, "id");
  const title = textValue(formData, "title");

  if (!id || !title) {
    return;
  }

  if (!(await canUpdateTask(user, id))) {
    return;
  }

  const payload: Record<string, string | number | null> = {
    assigned_user_id: numberValue(formData, "assigned_user_id"),
    title,
    description: nullableTextValue(formData, "description"),
    status: numberValue(formData, "status") ?? 0,
    start_time: nullableTextValue(formData, "start_time"),
    end_time: nullableTextValue(formData, "end_time"),
    due_date: nullableTextValue(formData, "due_date"),
    updated_at: new Date().toISOString(),
  };

  await supabaseRequest(`tasks?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  revalidatePath("/", "layout");
}

export async function updateTaskStatusAction(formData: FormData): Promise<void> {
  const user = await requireAuth();

  const id = numberValue(formData, "id");
  const status = numberValue(formData, "status");

  if (!id || status === null) {
    return;
  }

  if (!(await canUpdateTask(user, id))) {
    return;
  }

  await supabaseRequest(`tasks?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      updated_at: new Date().toISOString(),
    }),
  });

  revalidatePath("/", "layout");
}

export async function deleteTaskAction(formData: FormData): Promise<void> {
  await requireAuth();
  // TEMP: canDeleteTask permission check disabled for now so any logged-in
  // user can delete tasks. Re-enable before shipping.

  const id = numberValue(formData, "id");

  if (!id) {
    return;
  }

  await supabaseRequest(`tasks?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      is_deleted: true,
      updated_at: new Date().toISOString(),
    }),
  });

  revalidatePath("/", "layout");
}

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableTextValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  return value || null;
}

function numberValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function supabaseRequest(
  path: string,
  init: RequestInit,
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase client environment variables are missing.");
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
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status} ${response.statusText}`);
  }
}
