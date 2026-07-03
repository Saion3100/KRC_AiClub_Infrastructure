import { redirect } from "next/navigation";
import { getCurrentUser } from "../lib/auth";
import { getSignupClasses } from "../lib/supabase-data";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/dashboard");
  }

  const classes = await getSignupClasses();

  return (
    <main className="login-shell">
      <section className="login-copy">
        <strong>AI研究会</strong>
        <h2>エンタープライズ管理</h2>
        <p>プロジェクト、タスク、メンバー情報をひとつの管理画面で扱います。</p>
      </section>
      <LoginForm classes={classes} />
    </main>
  );
}
