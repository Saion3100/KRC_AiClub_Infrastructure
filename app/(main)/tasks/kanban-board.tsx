"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteTaskAction, updateTaskStatusAction } from "../../lib/actions";
import { taskStatuses } from "../../lib/domain";
import type { AppData, TaskRow } from "../../lib/supabase-data";

type Lane = { status: 0 | 1 | 2; color: string };

const lanes: Lane[] = [
  { status: 0, color: "purple" },
  { status: 1, color: "yellow" },
  { status: 2, color: "green" },
];

const laneStyles: Record<string, { bg: string; border: string; dot: string }> = {
  purple: { bg: "bg-[#fbf5ff]", border: "border-[#dab7ff]", dot: "bg-[#9b5cf6]" },
  yellow: { bg: "bg-[#fffde9]", border: "border-[#f6d34a]", dot: "bg-[#d6a800]" },
  green: { bg: "bg-[#f4fff8]", border: "border-[#8be5ad]", dot: "bg-[#a869f5]" },
};

export function KanbanBoard({ data }: { data: AppData }) {
  const router = useRouter();
  const [dragOverStatus, setDragOverStatus] = useState<number | null>(null);

  async function handleDrop(status: 0 | 1 | 2, event: React.DragEvent) {
    event.preventDefault();
    setDragOverStatus(null);
    const taskId = event.dataTransfer.getData("text/plain");
    if (!taskId) return;
    const formData = new FormData();
    formData.set("id", taskId);
    formData.set("status", String(status));
    await updateTaskStatusAction(formData);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {lanes.map((lane) => {
        const tasks = data.tasks.filter((task) => task.status === lane.status);
        const style = laneStyles[lane.color];
        return (
          <section
            className={`min-h-[818px] rounded-[9px] border px-3 py-4 transition-shadow ${style.bg} ${style.border} ${
              dragOverStatus === lane.status ? "ring-2 ring-primary" : ""
            }`}
            key={lane.status}
            onDragLeave={() => setDragOverStatus(null)}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setDragOverStatus(lane.status);
            }}
            onDrop={(event) => handleDrop(lane.status, event)}
          >
            <h3 className="m-0 mb-[18px] text-[17px] font-medium">
              <span className={`mr-2.5 inline-block h-2 w-2 rounded-full ${style.dot}`} />
              {taskStatusLabel(lane.status)}
              <em className="ml-2.5 rounded-full bg-[#eef1f4] px-[9px] py-1 not-italic">{tasks.length}</em>
            </h3>
            {tasks.length ? tasks.map((task) => (
              <TaskCard data={data} task={task} key={task.id} />
            )) : <EmptyState title="未登録" />}
          </section>
        );
      })}
    </div>
  );
}

function TaskCard({ data, task }: { data: AppData; task: TaskRow }) {
  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(task.id));
      }}
      className="mb-3.5 cursor-grab rounded-[5px] border border-[#d5dbe6] bg-white p-4 shadow-[0_1px_3px_#00000012] active:cursor-grabbing"
    >
      <p className="mt-0 text-[17px]">{task.title}</p>
      {task.description ? <small className="mb-3.5 block leading-[1.5] text-[#596171]">{task.description}</small> : null}
      <dl className="my-3.5 grid grid-cols-[72px_1fr] gap-2 text-xs">
        <dt className="text-[#667085]">担当者</dt><dd className="m-0">{taskAssigneeName(data, task.assigned_user_id)}</dd>
        <dt className="text-[#667085]">期限</dt><dd className="m-0">{formatDate(task.due_date)}</dd>
      </dl>
      <div className="mt-3 flex justify-end">
        <form action={deleteTaskAction}>
          <input type="hidden" name="id" value={task.id} />
          <button className="min-h-[30px] rounded-md border border-[#f0b4b4] bg-white px-3 text-xs text-red">削除</button>
        </form>
      </div>
    </article>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex min-h-[110px] flex-col items-center justify-center gap-1 border-2 border-dashed border-line text-xs text-[#98a2b3]">
      <b>{title}</b>
    </div>
  );
}

function taskAssigneeName(data: AppData, userId: number | null) {
  if (!userId) return "未設定";
  return data.users.find((user) => user.id === userId)?.name ?? "未設定";
}

function taskStatusLabel(status: number) {
  return taskStatuses[status as keyof typeof taskStatuses] ?? "未設定";
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10).replaceAll("-", "/");
}
