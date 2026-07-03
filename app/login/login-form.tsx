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
    <section className="grid w-full gap-[22px] rounded-lg border border-line bg-white p-[38px] shadow-[0_18px_45px_#1020331a] max-[900px]:p-[28px_22px]">
      <div>
        <small>AI研究会</small>
        <h1 className="mt-1.5 text-[32px] font-medium text-blue">{mode === "login" ? "ログイン" : "新規登録"}</h1>
        <p className="mt-2 leading-[1.7] text-[#596171]">
          {mode === "login"
            ? "登録済みのアカウントで管理画面に入ります。"
            : "アカウントを作成して、AI研究会の管理画面を利用します。"}
        </p>
      </div>
      {mode === "login" ? (
        <>
          <form action={loginFormAction} className="grid gap-[22px]">
            <label>
              メールアドレス
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              パスワード
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            {loginState.error ? (
              <p className="m-0! rounded-[7px] border border-[#f3b8b8] bg-[#fff5f5] p-3 text-sm text-red!">{loginState.error}</p>
            ) : null}
            <button
              className="inline-flex h-12 w-full min-w-[140px] items-center justify-center rounded-[7px] border-0 bg-primary px-5 font-bold text-white disabled:opacity-70"
              disabled={loginPending}
            >
              {loginPending ? "確認中..." : "ログインする"}
            </button>
          </form>
          <div className="grid gap-2.5 border-t border-[#e3e8f0] pt-[18px] text-center">
            <span className="text-[13px] text-[#596171]">アカウントを持っていない場合</span>
            <button
              className="min-h-[46px] rounded-[7px] border border-primary bg-white font-bold text-primary hover:bg-[#f0f6ff]"
              onClick={() => setMode("signup")}
              type="button"
            >
              新規登録する
            </button>
          </div>
        </>
      ) : (
        <>
          <form action={signupFormAction} className="grid gap-[22px]">
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
            <div className="grid grid-cols-[1fr_120px] gap-3.5 max-[900px]:grid-cols-1">
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
              <p className="m-0! rounded-[7px] border border-[#f3b8b8] bg-[#fff5f5] p-3 text-sm text-red!">
                先にSupabaseのclassesテーブルへクラスを登録してください。
              </p>
            ) : null}
            {signupState.error ? (
              <p className="m-0! rounded-[7px] border border-[#f3b8b8] bg-[#fff5f5] p-3 text-sm text-red!">{signupState.error}</p>
            ) : null}
            <button
              className="inline-flex h-12 w-full min-w-[140px] items-center justify-center rounded-[7px] border-0 bg-primary px-5 font-bold text-white disabled:opacity-70"
              disabled={signupPending || !hasClasses}
            >
              {signupPending ? "登録中..." : "アカウントを作成"}
            </button>
          </form>
          <div className="grid gap-2.5 border-t border-[#e3e8f0] pt-[18px] text-center">
            <span className="text-[13px] text-[#596171]">すでにアカウントを持っている場合</span>
            <button
              className="min-h-[46px] rounded-[7px] border border-primary bg-white font-bold text-primary hover:bg-[#f0f6ff]"
              onClick={() => setMode("login")}
              type="button"
            >
              ログインする
            </button>
          </div>
        </>
      )}
    </section>
  );
}
