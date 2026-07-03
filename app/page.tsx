import { redirect } from "next/navigation";
import { getCurrentUser } from "./lib/auth";

export default async function RootPage() {
  const currentUser = await getCurrentUser();
  redirect(currentUser ? "/dashboard" : "/login");
}
