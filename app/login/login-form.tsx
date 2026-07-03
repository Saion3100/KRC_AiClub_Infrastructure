"use client";

import { useActionState, useState } from "react";
import { loginAction, signupAction } from "../lib/auth-actions";
import type { LoginState, SignupState } from "../lib/auth";
import type { ClassRow } from "../lib/supabase-data";

const initialLoginState: LoginState = {};
const initialSignupState: SignupState = {};

export function LoginForm({ classes }: { classes: ClassRow[] }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginFormAction, loginPending] = useActionState(
    loginAction,
    initialLoginState,
  );
  const [signupState, signupFormAction, signupPending] = useActionState(
    signupAction,
    initialSignupState,
  );
  const hasClasses = classes.length > 0;

  return (
    <section className="login-card">
      <div>
        <small>AI研究会</small>
        <h1>{mode === "login" ? "ログイン" : "新規登録"}</h1>
        <p>
          {mode === "login"
            ? "登録済みのアカウントで管理画面に入ります。"
            : "アカウントを作成して、AI研究会の管理画面を利用します。"}
        </p>
      </div>
      {mode === "login" ? (
        <>
          <form action={loginFormAction} className="auth-form">
            <label>
              メールアドレス
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              パスワード
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            {loginState.error ? <p className="login-error">{loginState.error}</p> : null}
            <button className="primary" disabled={loginPending}>
              {loginPending ? "確認中..." : "ログインする"}
            </button>
          </form>
          <div className="auth-switch">
            <span>アカウントを持っていない場合</span>
            <button onClick={() => setMode("signup")} type="button">
              新規登録する
            </button>
          </div>
        </>
      ) : (
        <>
          <form action={signupFormAction} className="auth-form">
            <label>
              氏名
              <input name="name" autoComplete="name" required />
            </label>
            <label>
              メールアドレス
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              パスワード
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            <div className="signup-grid">
              <label>
                クラス
                <select name="class_id" required defaultValue="" disabled={!hasClasses}>
                  <option value="">
                    {hasClasses ? "選択してください" : "クラスが未登録です"}
                  </option>
                  {classes.map((classItem) => (
                    <option value={classItem.id} key={classItem.id}>
                      {classItem.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                学年
                <select name="grade" defaultValue="1">
                  <option value="1">1年生</option>
                  <option value="2">2年生</option>
                  <option value="3">3年生</option>
                  <option value="4">4年生</option>
                </select>
              </label>
            </div>
            {!hasClasses ? (
              <p className="login-error">
                先にSupabaseのclassesテーブルへクラスを登録してください。
              </p>
            ) : null}
            {signupState.error ? <p className="login-error">{signupState.error}</p> : null}
            <button className="primary" disabled={signupPending || !hasClasses}>
              {signupPending ? "登録中..." : "アカウントを作成"}
            </button>
          </form>
          <div className="auth-switch">
            <span>すでにアカウントを持っている場合</span>
            <button onClick={() => setMode("login")} type="button">
              ログインする
            </button>
          </div>
        </>
      )}
    </section>
  );
}
