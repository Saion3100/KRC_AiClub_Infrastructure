"use client";

import { useActionState } from "react";
import { loginAction } from "./lib/auth-actions";
import type { LoginState } from "./lib/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="login-card">
      <div>
        <small>AI研究会</small>
        <h1>ログイン</h1>
        <p>管理画面を利用するには、アプリ内アカウントでログインしてください。</p>
      </div>
      <label>
        メールアドレス
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        パスワード
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error ? <p className="login-error">{state.error}</p> : null}
      <button className="primary" disabled={pending}>
        {pending ? "確認中..." : "ログイン"}
      </button>
    </form>
  );
}
