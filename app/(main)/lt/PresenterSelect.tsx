// src/app/(main)/lt/PresenterSelect.tsx
"use client";

import { useMemo } from "react";
import type { UserRow } from "./data";

type PresenterSelectProps = {
  users: UserRow[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
};

export default function PresenterSelect({
  users,
  selectedIds,
  onChange,
  disabled = false,
}: PresenterSelectProps) {
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      // 学年を4年→3年→2年→1年の順にする
      if (a.grade !== b.grade) {
        return b.grade - a.grade;
      }

      // 同じ学年なら名前順
      return a.name.localeCompare(
        b.name,
        "ja",
      );
    });
  }, [users]);

  const togglePresenter = (
    userId: number,
  ) => {
    if (disabled) {
      return;
    }

    if (selectedIds.includes(userId)) {
      onChange(
        selectedIds.filter(
          (selectedId) =>
            selectedId !== userId,
        ),
      );

      return;
    }

    onChange([
      ...selectedIds,
      userId,
    ]);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      {/* 見出し */}
      <div className="mb-1.5 flex shrink-0 items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          発表者

          <span className="ml-1 font-bold text-red-500">
            *
          </span>
        </label>

        <span
          className={
            selectedIds.length > 0
              ? "text-xs font-semibold text-[#0f4c9c]"
              : "text-xs text-gray-500"
          }
        >
          {selectedIds.length}人選択中
        </span>
      </div>

      {/* この枠内だけスクロール */}
      <div
        className="
          min-h-0 flex-1
          overflow-y-auto
          overscroll-contain
          rounded-md
          border border-gray-300
          bg-white p-2
        "
      >
        <div className="space-y-1.5">
          {sortedUsers.map((user) => {
            const isSelected =
              selectedIds.includes(user.id);

            return (
              <button
                key={user.id}
                type="button"
                onClick={() =>
                  togglePresenter(user.id)
                }
                disabled={disabled}
                className={[
                  "flex w-full items-center",
                  "justify-between",
                  "rounded-md border",
                  "px-3 py-2",
                  "text-left",
                  "transition-colors",
                  isSelected
                    ? "border-[#0f4c9c] bg-blue-50"
                    : "border-transparent bg-gray-50 hover:border-gray-300 hover:bg-gray-100",
                  disabled
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer",
                ].join(" ")}
              >
                {/* 名前と学年 */}
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className={[
                      "truncate text-sm",
                      isSelected
                        ? "font-semibold text-[#0f4c9c]"
                        : "font-medium text-gray-800",
                    ].join(" ")}
                  >
                    {user.name}
                  </span>

                  <span
                    className={[
                      "shrink-0 rounded",
                      "px-1.5 py-0.5",
                      "text-[10px] font-medium",
                      isSelected
                        ? "bg-blue-100 text-[#0f4c9c]"
                        : "bg-gray-200 text-gray-600",
                    ].join(" ")}
                  >
                    {user.grade}年
                  </span>
                </span>

                {/* チェック表示 */}
                <span
                  aria-hidden="true"
                  className={[
                    "ml-3 flex h-5 w-5",
                    "shrink-0 items-center",
                    "justify-center rounded",
                    "border text-xs font-bold",
                    isSelected
                      ? "border-[#0f4c9c] bg-[#0f4c9c] text-white"
                      : "border-gray-400 bg-white text-transparent",
                  ].join(" ")}
                >
                  ✓
                </span>
              </button>
            );
          })}

          {sortedUsers.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-gray-400">
              選択できるユーザーがいません。
            </p>
          )}
        </div>
      </div>

      {/* 下部説明 */}
      <div className="mt-1.5 flex shrink-0 items-center justify-between">
        <p className="text-xs text-gray-500">
          発表者は複数選択できます。
        </p>

        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            disabled={disabled}
            className="text-xs text-gray-500 underline hover:text-gray-700"
          >
            選択を解除
          </button>
        )}
      </div>
    </div>
  );
}