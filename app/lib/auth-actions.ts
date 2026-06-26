"use server";

import { redirect } from "next/navigation";
import {
  authenticateUser,
  createSession,
  deleteSession,
  type LoginState,
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

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/");
}

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
