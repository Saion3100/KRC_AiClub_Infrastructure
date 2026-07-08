import type { TaskRow } from "../../lib/supabase-data";

const DAY_MS = 24 * 60 * 60 * 1000;
const DONE_STATUS = 2;
const MAX_POINTS = 60;

export type BurndownPoint = {
  date: string;
  ideal: number;
  actual: number | null;
};

export type BurndownResult =
  | { kind: "empty" }
  | { kind: "no-due-date" }
  | {
      kind: "ok";
      points: BurndownPoint[];
      total: number;
      remaining: number;
      todayDate: string;
    };

export function computeBurndown(tasks: TaskRow[], now: Date = new Date()): BurndownResult {
  if (tasks.length === 0) {
    return { kind: "empty" };
  }

  const dueDates = tasks.map((task) => task.due_date).filter((value): value is string => Boolean(value));
  if (dueDates.length === 0) {
    return { kind: "no-due-date" };
  }

  const total = tasks.length;
  const start = startOfDay(new Date(Math.min(...tasks.map((task) => new Date(task.created_at).getTime()))));
  const dueEnd = startOfDay(new Date(Math.max(...dueDates.map((date) => new Date(date).getTime()))));
  const end = dueEnd.getTime() > start.getTime() ? dueEnd : new Date(start.getTime() + DAY_MS);
  const today = startOfDay(now);

  const totalDays = Math.round((end.getTime() - start.getTime()) / DAY_MS);
  const step = Math.max(1, Math.ceil(totalDays / MAX_POINTS));

  const dayOffsets = new Set<number>();
  for (let offset = 0; offset <= totalDays; offset += step) {
    dayOffsets.add(offset);
  }
  dayOffsets.add(totalDays);
  const todayOffset = Math.round((today.getTime() - start.getTime()) / DAY_MS);
  if (todayOffset > 0 && todayOffset < totalDays) {
    dayOffsets.add(todayOffset);
  }

  const points = [...dayOffsets]
    .sort((a, b) => a - b)
    .map((offset) => {
      const date = new Date(start.getTime() + offset * DAY_MS);
      const remainingAt = remainingTasksAt(tasks, date, total);
      return {
        date: toIsoDate(date),
        ideal: Math.max(0, total * (1 - offset / totalDays)),
        actual: date.getTime() > today.getTime() ? null : remainingAt,
      };
    });

  return {
    kind: "ok",
    points,
    total,
    remaining: remainingTasksAt(tasks, today, total),
    todayDate: toIsoDate(today),
  };
}

function remainingTasksAt(tasks: TaskRow[], date: Date, total: number): number {
  const cutoff = date.getTime() + DAY_MS - 1;
  const doneByThen = tasks.filter(
    (task) => task.status === DONE_STATUS && new Date(task.updated_at).getTime() <= cutoff,
  ).length;
  return total - doneByThen;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
