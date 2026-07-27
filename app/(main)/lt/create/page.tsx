// src/app/lt/create/page.tsx

import { getLtUsers } from "../data";
import CreateLtForm from "./CreateLtForm";

export default async function LtNewPage() {
  const users = await getLtUsers();

  return <CreateLtForm users={users} />;
}