// src/app/(main)/lt/data.ts

export type UserRow = {
  id: number;
  name: string;
  grade: number;
};

export type LtRow = {
  id: number;
  title: string;
  presentation_date: string;
  document_url: string | null;
  category: string | null;
  summary: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

export type LtPresenterRow = {
  lt_id: number;
  user_id: number;
  is_deleted: boolean;
};

export type LtPageData = {
  users: UserRow[];
  lts: LtRow[];
  ltPresenters: LtPresenterRow[];
  error?: string;
};

export async function getLtPageData(): Promise<LtPageData> {
  const [users, lts, ltPresenters] = await Promise.all([
    supabaseSelect<UserRow>(
      "users",
      "id,name,grade",
      "grade.desc,name.asc",
      "is_deleted=eq.false",
    ),

    supabaseSelect<LtRow>(
      "lts",
      [
        "id",
        "title",
        "presentation_date",
        "document_url",
        "category",
        "summary",
        "is_deleted",
        "created_at",
        "updated_at",
      ].join(","),
      "presentation_date.desc",
      "is_deleted=eq.false",
    ),

    supabaseSelect<LtPresenterRow>(
      "lt_presenters",
      "lt_id,user_id,is_deleted",
      "lt_id.asc",
      "is_deleted=eq.false",
    ),
  ]);

  const firstError = [
    users,
    lts,
    ltPresenters,
  ].find((result) => !result.ok);

  return {
    users: users.data,
    lts: lts.data,
    ltPresenters: ltPresenters.data,
    error: firstError?.error,
  };
}

export async function getLtUsers(): Promise<UserRow[]> {
  const result = await supabaseSelect<UserRow>(
    "users",
    "id,name,grade",
    "grade.desc,name.asc",
    "is_deleted=eq.false",
  );

  return result.data;
}

async function supabaseSelect<T>(
  table: string,
  select: string,
  order?: string,
  filter?: string,
): Promise<{
  ok: boolean;
  data: T[];
  error?: string;
}> {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return {
      ok: false,
      data: [],
      error:
        "Supabaseの接続設定がありません。",
    };
  }

  const params = new URLSearchParams({
    select,
  });

  if (order) {
    params.set("order", order);
  }

  const filterSuffix = filter
    ? `&${filter}`
    : "";

  const endpoint =
    `${url.replace(/\/$/, "")}/rest/v1/${table}` +
    `?${params.toString()}${filterSuffix}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: "no-store",
    });

    const body = await response.text();

    if (!response.ok) {
      console.error(
        `Supabase ${table} fetch error:`,
        {
          status: response.status,
          statusText: response.statusText,
          body,
        },
      );

      return {
        ok: false,
        data: [],
        error: `${table}の取得に失敗しました。`,
      };
    }

    if (!body.trim()) {
      return {
        ok: true,
        data: [],
      };
    }

    const parsed: unknown =
      JSON.parse(body);

    return {
      ok: true,
      data: Array.isArray(parsed)
        ? (parsed as T[])
        : [],
    };
  } catch (error) {
    return {
      ok: false,
      data: [],
      error:
        error instanceof Error
          ? error.message
          : "Supabaseとの通信に失敗しました。",
    };
  }
}