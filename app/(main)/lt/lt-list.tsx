// src/app/lt/lt-list.tsx
"use client";

import React, { useMemo, useState } from "react";
import Input from "./Input";
import type {
  LtPresenterRow,
  LtRow,
  UserRow,
} from "./data";

type LtListProps = {
  lts: LtRow[];
  users: UserRow[];
  ltPresenters: LtPresenterRow[];
};

export function LtList({
  lts,
  users,
  ltPresenters,
}: LtListProps) {
  const [searchName, setSearchName] = useState("");
  const [sortBy, setSortBy] = useState<
    "date" | "oldest"
  >("date");

  const userNameMap = useMemo(
    () =>
      new Map(
        users.map((user) => [user.id, user.name]),
      ),
    [users],
  );

  const presenterNames = (ltId: number) => {
    const names = ltPresenters
      .filter((presenter) => presenter.lt_id === ltId)
      .map(
        (presenter) =>
          userNameMap.get(presenter.user_id) ?? "不明",
      );

    return names.length > 0
      ? names.join("、")
      : "未設定";
  };

  const filteredLts = useMemo(() => {
    const keyword = searchName.toLowerCase();

    return lts.filter((lt) =>
      presenterNames(lt.id)
        .toLowerCase()
        .includes(keyword),
    );
  }, [
    lts,
    ltPresenters,
    userNameMap,
    searchName,
  ]);

  const sortedLts = useMemo(() => {
    return [...filteredLts].sort((a, b) => {
      const aDate = new Date(
        a.presentation_date,
      ).getTime();

      const bDate = new Date(
        b.presentation_date,
      ).getTime();

      return sortBy === "date"
        ? bDate - aDate
        : aDate - bDate;
    });
  }, [filteredLts, sortBy]);

  const latestCards = sortedLts.slice(0, 3);
  const listItems = sortedLts.slice(3);

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-white p-3 shadow-sm">
        <div className="w-64">
          <Input
            name="search"
            value={searchName}
            onChange={(event) =>
              setSearchName(event.target.value)
            }
            placeholder="発表者名で検索..."
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">
            並び替え:
          </span>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target.value as
                  | "date"
                  | "oldest",
              )
            }
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f4c9c]"
          >
            <option value="date">
              日付（最新順）
            </option>

            <option value="oldest">
              日付（古い順）
            </option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          最新の発表
        </h2>

        <div className="grid grid-cols-3 gap-4">
          {latestCards.map((lt) => (
            <div
              key={lt.id}
              className="flex h-[130px] flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#0f4c9c]">
                    {lt.category ?? "未分類"}
                  </span>

                  <span className="text-[11px] text-gray-400">
                    {lt.presentation_date}
                  </span>
                </div>

                <h3 className="line-clamp-1 text-sm font-bold text-gray-900">
                  {lt.title}
                </h3>

                <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                  {lt.summary ?? "概要なし"}
                </p>
              </div>

              <div className="mt-1 truncate text-right text-xs font-medium text-gray-600">
                発表者：
                <span className="font-semibold text-gray-900">
                  {presenterNames(lt.id)}
                </span>
              </div>
            </div>
          ))}

          {latestCards.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-gray-200 bg-gray-50 py-6 text-center text-sm text-gray-400">
              該当するLTはありません
            </div>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          過去の発表リスト
        </h2>

        <div className="max-h-[220px] flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="w-24 p-2.5 text-xs font-semibold text-gray-600">
                  日付
                </th>

                <th className="w-28 p-2.5 text-xs font-semibold text-gray-600">
                  カテゴリ
                </th>

                <th className="p-2.5 text-xs font-semibold text-gray-600">
                  タイトル
                </th>

                <th className="w-48 p-2.5 text-xs font-semibold text-gray-600">
                  発表者
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {listItems.map((lt) => (
                <tr
                  key={lt.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap p-2.5 text-xs text-gray-500">
                    {lt.presentation_date}
                  </td>

                  <td className="whitespace-nowrap p-2.5">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                      {lt.category ?? "未分類"}
                    </span>
                  </td>

                  <td className="max-w-[260px] truncate p-2.5 font-medium text-gray-900">
                    {lt.title}
                  </td>

                  <td className="max-w-[220px] truncate whitespace-nowrap p-2.5 font-medium text-gray-600">
                    {presenterNames(lt.id)}
                  </td>
                </tr>
              ))}

              {listItems.length === 0 &&
                latestCards.length > 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="bg-gray-50 p-4 text-center text-xs text-gray-400"
                    >
                      その他の過去データはありません
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}