// src/app/lt/page.tsx

import Link from "next/link";
import Button from "./Button";
import { LtList } from "./lt-list";
import { getLtPageData } from "./data";

export default async function LtListPage() {
  const data = await getLtPageData();

  return (
    <div className="mx-auto flex h-full max-w-[1000px] flex-col px-6 py-4 text-gray-800">
      <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
        <div>
          <h1 className="m-0 text-xl font-bold">
            LT一覧
          </h1>

          <p className="mt-0.5 text-xs text-[#596171]">
            発表されたLTの閲覧・管理画面です。
          </p>
        </div>

        <Link
          href="/lt/create"
          className="block no-underline"
        >
          <Button
            variant="primary"
            type="button"
          >
            ＋ 新規作成
          </Button>
        </Link>
      </div>

      {data.error && (
        <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          データの取得に失敗しました。
        </p>
      )}

      <LtList
        lts={data.lts}
        users={data.users}
        ltPresenters={data.ltPresenters}
      />
    </div>
  );
}