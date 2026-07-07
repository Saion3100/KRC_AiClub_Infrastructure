import { redirect } from "next/navigation";
import { getCurrentUser } from "../lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-screen grid-cols-[minmax(320px,1fr)_minmax(320px,440px)] items-center gap-14 bg-[linear-gradient(120deg,#f8fafc_0%,#f8fafc_52%,#e8eef8_52%,#e8eef8_100%)] px-[clamp(24px,7vw,104px)] py-14 max-[900px]:block max-[900px]:bg-[#f8fafc] max-[900px]:px-4 max-[900px]:py-7">
      <section className="max-w-[560px] max-[900px]:mb-6">
        <strong className="block text-[20px] text-blue">AI研究会</strong>
        <h2 className="mt-[18px] mb-4 text-[42px] font-bold text-[#162033] max-[900px]:text-[30px]">エンタープライズ管理</h2>
        <p className="leading-[1.7] text-[#596171]">プロジェクト、タスク、メンバー情報をひとつの管理画面で扱います。</p>
      </section>
      <LoginForm />
    </main>
  );
}
