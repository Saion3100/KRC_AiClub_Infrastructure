'use client';

import React, { useState, useMemo } from 'react';
import Input from './Input';
import type { LtRow, UserRow } from '../../lib/supabase-data';

export function LtList({ lts, users }: { lts: LtRow[]; users: UserRow[] }) {
  const [searchName, setSearchName] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'fiscalYear'>('date');

  const speakerName = (userId: number) =>
    users.find((user) => user.id === userId)?.name ?? '不明';

  const filteredLts = useMemo(() => {
    return lts.filter((lt) =>
      speakerName(lt.user_id).toLowerCase().includes(searchName.toLowerCase())
    );
  }, [lts, users, searchName]);

  const sortedLts = useMemo(() => {
    return [...filteredLts].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.presentation_date).getTime() - new Date(a.presentation_date).getTime();
      } else {
        return new Date(a.presentation_date).getTime() - new Date(b.presentation_date).getTime();
      }
    });
  }, [filteredLts, sortBy]);

  const latestCards = useMemo(() => sortedLts.slice(0, 3), [sortedLts]);
  const listItems = useMemo(() => sortedLts.slice(3), [sortedLts]);

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-3 bg-white p-3 rounded-md border border-gray-200 shadow-sm">
        <div className="w-64">
          <Input
            name="search"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="発表者名で検索..."
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">並び替え:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'fiscalYear')}
            className="border border-gray-300 rounded px-2 py-1 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0f4c9c]"
          >
            <option value="date">日付（最新順）</option>
            <option value="fiscalYear">年度・古い順</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">最新の発表</h2>
        <div className="grid grid-cols-3 gap-4">
          {latestCards.map((lt) => (
            <div key={lt.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between h-[130px]">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] bg-blue-50 text-[#0f4c9c] px-2 py-0.5 rounded font-bold">{lt.category}</span>
                  <span className="text-[11px] text-gray-400">{lt.presentation_date}</span>
                </div>
                <h3 className="text-sm font-bold line-clamp-1 text-gray-900">{lt.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{lt.summary}</p>
              </div>
              <div className="text-right text-xs font-medium text-gray-600 mt-1">
                発表者: <span className="text-gray-900 font-semibold">{speakerName(lt.user_id)}</span>
              </div>
            </div>
          ))}
          {latestCards.length === 0 && (
            <div className="col-span-full text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">該当するLTはありません</div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">過去の発表リスト</h2>
        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm max-h-[220px]">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
              <tr>
                <th className="p-2.5 font-semibold text-gray-600 text-xs w-24">日付</th>
                <th className="p-2.5 font-semibold text-gray-600 text-xs w-32">カテゴリ</th>
                <th className="p-2.5 font-semibold text-gray-600 text-xs">タイトル</th>
                <th className="p-2.5 font-semibold text-gray-600 text-xs w-32">発表者</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listItems.map((lt) => (
                <tr key={lt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-2.5 text-xs text-gray-500 whitespace-nowrap">{lt.presentation_date}</td>
                  <td className="p-2.5 whitespace-nowrap">
                    <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">{lt.category}</span>
                  </td>
                  <td className="p-2.5 font-medium text-gray-900 truncate max-w-[300px]">{lt.title}</td>
                  <td className="p-2.5 text-gray-600 whitespace-nowrap font-medium">{speakerName(lt.user_id)}</td>
                </tr>
              ))}
              {listItems.length === 0 && latestCards.length > 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-xs text-gray-400 bg-gray-50">その他の過去データはありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
