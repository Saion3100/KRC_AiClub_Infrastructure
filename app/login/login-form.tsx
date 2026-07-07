"use client";

import { useActionState } from "react";
import type { LoginState } from "../lib/auth";
import { emailLoginAction } from "./actions";

const initialLoginState: LoginState = {};

export function LoginForm() {
  const [loginState, loginFormAction, loginPending] = useActionState(
    emailLoginAction,
    initialLoginState,
  );

  return (
    <section className="grid w-full gap-[22px] rounded-lg border border-line bg-white p-[38px] shadow-[0_18px_45px_#1020331a] max-[900px]:p-[28px_22px]">
      <div>
        <small>AI研究会</small>
        <h1 className="mt-1.5 text-[32px] font-medium text-blue">ログイン</h1>
        <p className="mt-2 leading-[1.7] text-[#596171]">
          登録済みのメールアドレスで管理画面に入れます。
        </p>
      </div>
      <form action={loginFormAction} className="grid gap-[22px]">
        <label>
          メールアドレス
          <input name="email" type="email" autoComplete="email" required />
        </label>
        {loginState.error ? (
          <p className="m-0! rounded-[7px] border border-[#f3b8b8] bg-[#fff5f5] p-3 text-sm text-red!">
            {loginState.error}
          </p>
        ) : null}
        <button
          className="inline-flex h-12 w-full min-w-[140px] items-center justify-center rounded-[7px] border-0 bg-primary px-5 font-bold text-white disabled:opacity-70"
          disabled={loginPending}
        >
          {loginPending ? "確認中..." : "ログインする"}
        </button>
      </form>
    </section>
  );
}
