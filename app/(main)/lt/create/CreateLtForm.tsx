// src/app/(main)/lt/create/CreateLtForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createLtAction } from "../actions";
import type { UserRow } from "../data";
import Input from "../Input";
import Button from "../Button";
import PresenterSelect from "../PresenterSelect";

const CATEGORIES = [
  "IT",
  "AI",
  "その他",
];

type CreateLtFormProps = {
  users: UserRow[];
};

export default function CreateLtForm({
  users,
}: CreateLtFormProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [
    presenterIds,
    setPresenterIds,
  ] = useState<number[]>([]);

  const [formData, setFormData] =
    useState({
      title: "",
      presentation_date: new Date()
        .toISOString()
        .split("T")[0],
      document_url: "",
      category: CATEGORIES[0],
      summary: "",
    });

  const handleChange = (
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >,
  ) => {
    const { name, value } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (presenterIds.length === 0) {
      alert(
        "発表者を1人以上選択してください。",
      );

      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      data.append(
        "title",
        formData.title,
      );

      data.append(
        "presentation_date",
        formData.presentation_date,
      );

      data.append(
        "document_url",
        formData.document_url,
      );

      data.append(
        "category",
        formData.category,
      );

      data.append(
        "summary",
        formData.summary,
      );

      presenterIds.forEach(
        (presenterId) => {
          data.append(
            "presenter_ids",
            String(presenterId),
          );
        },
      );

      await createLtAction(data);

      router.push("/lt");
      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "登録に失敗しました。",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        mx-auto box-border
        flex h-[calc(100dvh-80px)]
        w-full max-w-[1200px]
        min-h-0 flex-col
        overflow-hidden
        px-6 py-3
      "
    >
      {/* 画面タイトル */}
      <div className="mb-3 shrink-0">
        <small className="text-gray-500">
          LT一覧 ＞ 新規作成
        </small>

        <h1 className="m-0 text-2xl font-bold text-gray-800">
          LT作成
        </h1>

        <p className="mt-0.5 text-sm text-[#596171]">
          LT情報と発表者を登録します。
        </p>
      </div>

      {/* フォーム全体 */}
      <form
        onSubmit={handleFormSubmit}
        className="
          grid min-h-0 flex-1
          grid-rows-[minmax(0,1fr)_auto]
          overflow-hidden
          rounded-lg
          border border-gray-200
          bg-white p-5 shadow-sm
        "
      >
        {/* 左右の入力エリア */}
        <div
          className="
            grid min-h-0
            grid-cols-2
            items-stretch
            gap-x-7
            overflow-hidden
          "
        >
          {/* 左側 */}
          <div
            className="
              grid min-h-0
              grid-rows-[auto_auto_auto_minmax(0,1fr)]
              gap-3 overflow-hidden
            "
          >
            {/* タイトル */}
            <div className="min-h-0">
              <Input
                label="タイトル"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="タイトルを入力"
                disabled={loading}
              />
            </div>

            {/* 日付・カテゴリ */}
            <div className="grid min-h-0 grid-cols-2 gap-4">
              <Input
                label="日付"
                name="presentation_date"
                type="date"
                value={
                  formData.presentation_date
                }
                onChange={handleChange}
                required
                disabled={loading}
              />

              <div className="w-full">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  カテゴリ
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={loading}
                  className="
                    w-full rounded-md
                    border border-gray-300
                    bg-white px-3 py-2
                    text-sm shadow-sm
                    focus:border-[#0f4c9c]
                    focus:outline-none
                    focus:ring-1
                    focus:ring-[#0f4c9c]
                    disabled:bg-gray-100
                    disabled:text-gray-500
                  "
                >
                  {CATEGORIES.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            {/* 資料URL */}
            <div className="min-h-0">
              <Input
                label="資料URL"
                name="document_url"
                type="url"
                value={
                  formData.document_url
                }
                onChange={handleChange}
                placeholder="https://..."
                disabled={loading}
              />
            </div>

            {/* 概要 */}
            <div
              className="
                grid min-h-0
                grid-rows-[auto_minmax(0,1fr)]
                overflow-hidden pb-2
              "
            >
              <label className="mb-1 block text-sm font-medium text-gray-700">
                概要
              </label>

              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="概要を入力"
                disabled={loading}
                className="
                  box-border block
                  h-full min-h-[100px]
                  w-full resize-none
                  rounded-md
                  border border-gray-300
                  px-3 py-2
                  text-sm shadow-sm
                  focus:border-[#0f4c9c]
                  focus:outline-none
                  focus:ring-1
                  focus:ring-[#0f4c9c]
                  disabled:bg-gray-100
                  disabled:text-gray-500
                "
              />
            </div>
          </div>

          {/* 右側 */}
          <div className="h-full min-h-0 overflow-hidden">
            <PresenterSelect
              users={users}
              selectedIds={
                presenterIds
              }
              onChange={
                setPresenterIds
              }
              disabled={loading}
            />
          </div>
        </div>

        {/* ボタンエリア */}
        <div
          className="
            mt-3 flex shrink-0
            justify-end gap-4
            border-t border-gray-100
            pt-4
          "
        >
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              router.push("/lt")
            }
            disabled={loading}
          >
            キャンセル
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading
              ? "登録中..."
              : "登録する"}
          </Button>
        </div>
      </form>
    </div>
  );
}