"use server";

import { redirect } from "next/navigation";
import {
  authenticateUser,
  createSession,
  deleteSession,
  signupUser,
  type LoginState,
  type SignupState,
  validateLoginConfig,
} from "./auth";

export async function loginAction(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const configError = validateLoginConfig();
  if (configError) {
    return { error: configError };
  }

  const email = textValue(formData, "email").toLowerCase();
  const password = textValue(formData, "password");
  const user = await authenticateUser(email, password);

  if (!user) {
    return { error: "メールアドレスまたはパスワードが正しくありません。" };
  }

  await createSession(user);
  redirect("/");
}

export async function signupAction(
  _state: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const configError = validateLoginConfig();
  if (configError) {
    return { error: configError };
  }

  const name = textValue(formData, "name");
  const email = textValue(formData, "email").toLowerCase();
  const password = textValue(formData, "password");
  const classId = numberValue(formData, "class_id");
  const grade = numberValue(formData, "grade") ?? 1;

  if (!name || !email || !password || !classId) {
    return { error: "氏名、メールアドレス、パスワード、クラスを入力してください。" };
  }

  if (!email.includes("@")) {
    return { error: "メールアドレスの形式を確認してください。" };
  }

  if (password.length < 8) {
    return { error: "パスワードは8文字以上で設定してください。" };
  }

  if (grade < 1 || grade > 4) {
    return { error: "学年は1〜4年生から選択してください。" };
  }

  const user = await signupUser({
    name,
    email,
    password,
    classId,
    grade,
  });

  if ("error" in user) {
    return { error: user.error };
  }

  await createSession(user);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/");
}

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
