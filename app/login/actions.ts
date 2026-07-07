"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  type AuthUser,
  type LoginState,
} from "../lib/auth";

type EmailLoginUserRow = {
  id: number;
  name: string;
  email: string;
  app_role: "admin" | "member" | null;
};

export async function emailLoginAction(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const configError = validateEmailLoginConfig();
  if (configError) {
    return { error: configError };
  }

  const email = textValue(formData, "email").toLowerCase();
  if (!email || !email.includes("@")) {
    return { error: "メールアドレスを入力してください。" };
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return { error: "登録済みのメールアドレスが見つかりません。" };
  }

  await createSession(user);
  redirect("/dashboard");
}

async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const users = await supabaseRequest<EmailLoginUserRow[]>(
    `users?select=id,name,email,app_role&email=eq.${encodeURIComponent(email)}&is_deleted=eq.false&limit=1`,
    { method: "GET" },
  );
  const user = users[0];
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    appRole: user.app_role === "admin" ? "admin" : "member",
  };
}

async function supabaseRequest<T>(path: string, init: RequestInit): Promise<T> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
    throw new Error(`Supabase email login request failed: ${response.status} ${response.statusText}`);
  }

  const body = await response.text();
  return (body ? JSON.parse(body) : undefined) as T;
}

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateEmailLoginConfig(): string | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return "NEXT_PUBLIC_SUPABASE_URL を設定してください。";
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。";
  }

  if (!process.env.AUTH_SECRET && !process.env.SESSION_SECRET) {
    return "AUTH_SECRET を設定してください。";
  }

  return null;
}
