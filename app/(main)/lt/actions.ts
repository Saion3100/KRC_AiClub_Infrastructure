// src/app/(main)/lt/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "../../lib/auth";

type CreatedLt = {
  id: number;
};

export async function createLtAction(
  formData: FormData,
): Promise<void> {
  await requireAuth();

  const title = textValue(
    formData,
    "title",
  );

  const presentationDate = textValue(
    formData,
    "presentation_date",
  );

  const presenterIds = formData
    .getAll("presenter_ids")
    .map((value) => Number(value))
    .filter(
      (value) =>
        Number.isInteger(value) && value > 0,
    );

  const uniquePresenterIds = [
    ...new Set(presenterIds),
  ];

  if (!title) {
    throw new Error(
      "タイトルを入力してください。",
    );
  }

  if (!presentationDate) {
    throw new Error(
      "日付を入力してください。",
    );
  }

  if (uniquePresenterIds.length === 0) {
    throw new Error(
      "発表者を1人以上選択してください。",
    );
  }

  // 1. LT本体を登録して、作成されたIDを取得
  const createdLts =
    await supabaseRequest<CreatedLt[]>(
      "lts",
      {
        method: "POST",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          title,
          presentation_date:
            presentationDate,
          document_url: nullableTextValue(
            formData,
            "document_url",
          ),
          category: nullableTextValue(
            formData,
            "category",
          ),
          summary: nullableTextValue(
            formData,
            "summary",
          ),
          is_deleted: false,
        }),
      },
    );

  const createdLt = createdLts[0];

  if (!createdLt?.id) {
    throw new Error(
      "登録したLTのIDを取得できませんでした。",
    );
  }

  // 2. 選択した発表者を中間テーブルへ登録
  const presenterRows =
    uniquePresenterIds.map((userId) => ({
      lt_id: createdLt.id,
      user_id: userId,
      is_deleted: false,
    }));

  try {
    await supabaseRequest(
      "lt_presenters",
      {
        method: "POST",
        body: JSON.stringify(
          presenterRows,
        ),
      },
    );
  } catch (error) {
    console.error(
      "lt_presenters insert failed:",
      error,
    );

    throw error;
  }

  revalidatePath("/lt");
}

function textValue(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function nullableTextValue(
  formData: FormData,
  key: string,
): string | null {
  const value = textValue(
    formData,
    key,
  );

  return value || null;
}

async function supabaseRequest<T = unknown>(
  table: string,
  init: RequestInit,
): Promise<T> {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabaseの接続設定がありません。",
    );
  }

  const response = await fetch(
    `${url.replace(/\/$/, "")}/rest/v1/${table}`,
    {
      ...init,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type":
          "application/json",
        Prefer: "return=minimal",
        ...init.headers,
      },
      cache: "no-store",
    },
  );

  const body = await response.text();

  if (!response.ok) {
    console.error(
      `Supabase ${table} error:`,
      {
        status: response.status,
        statusText:
          response.statusText,
        body,
      },
    );

    let detail = body;

    try {
      const parsed = JSON.parse(body) as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };

      detail = [
        parsed.message,
        parsed.details,
        parsed.hint,
        parsed.code
          ? `エラーコード: ${parsed.code}`
          : null,
      ]
        .filter(Boolean)
        .join(" ");
    } catch {
      // JSON以外の場合は本文をそのまま使用
    }

    throw new Error(
      `${table}への登録に失敗しました。${detail ? ` ${detail}` : ""}`,
    );
  }

  if (!body.trim()) {
    return undefined as T;
  }

  return JSON.parse(body) as T;
}