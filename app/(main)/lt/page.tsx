import Link from 'next/link';
import Button from './Button';
import { LtList } from './lt-list';
import { getAppData } from '../../lib/supabase-data';

export default async function LtListPage() {
  const data = await getAppData();

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-4 h-full flex flex-col justify-between text-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
        <div>
          <h1 className="m-0 text-xl font-bold">LT一覧</h1>
          <p className="text-xs text-[#596171] mt-0.5">発表されたLTの閲覧・管理画面です。</p>
        </div>
        <Link href="/lt/create" className="no-underline block">
          <Button variant="primary" type="button">
            ＋ 新規作成
          </Button>
        </Link>
      </div>

      <LtList lts={data.lts} users={data.users} />
    </div>
  );
}
