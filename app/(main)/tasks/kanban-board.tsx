"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTaskAction, updateTaskAction, updateTaskStatusAction } from "../../lib/actions";
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
  const [editingTask, setEditingTask] = useState<TaskRow | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

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
            className={`min-h-[300px] rounded-[9px] border px-3 py-4 transition-shadow ${style.bg} ${style.border} ${
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
              <TaskCard
                data={data}
                task={task}
                key={task.id}
                onEdit={() => {
                  setEditingTask(task);
                  document.body.style.overflow = "hidden";
                  dialogRef.current?.showModal();
                }}
              />
            )) : <EmptyState title="未登録" />}
          </section>
        );
      })}

      <dialog
        ref={dialogRef}
        onClose={() => {
          document.body.style.overflow = "";
          setEditingTask(null);
        }}
        className="m-auto rounded-lg border border-line p-0 backdrop:bg-black/40"
      >
        <div className="max-h-[85vh] w-[600px] max-w-[90vw] overflow-y-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="m-0 text-xl font-medium">タスクを編集</h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="閉じる"
              className="rounded-full border border-transparent p-1 text-4xl leading-none text-[#596171] transition-colors hover:border-line hover:bg-soft hover:text-[#202633]"
            >
              ×
            </button>
          </div>
          {editingTask ? (
            <form action={updateTaskAction}>
              <input type="hidden" name="id" value={editingTask.id} />
              <div className="grid grid-cols-3 gap-[18px]">
                <label>担当者
                  <select name="assigned_user_id" defaultValue={editingTask.assigned_user_id ?? ""}>
                    <option value="">未設定</option>
                    {data.users.map((user) => (
                      <option value={user.id} key={user.id}>{user.name}</option>
                    ))}
                  </select>
                </label>
                <label>状態
                  <select name="status" defaultValue={editingTask.status}>
                    {lanes.map((lane) => (
                      <option value={lane.status} key={lane.status}>{taskStatusLabel(lane.status)}</option>
                    ))}
                  </select>
                </label>
                <label>期限<input name="due_date" type="date" defaultValue={editingTask.due_date ?? ""} /></label>
                <label className="col-span-full">タイトル *<input name="title" required defaultValue={editingTask.title} /></label>
                <label className="col-span-full">説明<textarea name="description" defaultValue={editingTask.description ?? ""} style={{ minHeight: "90px" }} /></label>
                <label>開始予定<input name="start_time" type="datetime-local" defaultValue={editingTask.start_time ?? ""} /></label>
                <label>終了予定<input name="end_time" type="datetime-local" defaultValue={editingTask.end_time ?? ""} /></label>
              </div>
              <div className="mt-[18px] flex justify-end">
                <button className="inline-flex h-12 min-w-[140px] items-center justify-center rounded-[7px] border-0 bg-primary px-5 font-bold text-white hover:bg-blue">保存する</button>
              </div>
            </form>
          ) : null}
        </div>
      </dialog>
    </div>
  );
}

function TaskCard({
  data,
  task,
  onEdit,
}: {
  data: AppData;
  task: TaskRow;
  onEdit: () => void;
}) {
  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(task.id));
      }}
      className="mb-2.5 cursor-grab rounded-[5px] border border-[#d5dbe6] bg-white p-2.5 shadow-[0_1px_3px_#00000012] transition-shadow hover:border-primary hover:shadow-[0_2px_8px_#00000022] active:cursor-grabbing"
    >
      <p className="mt-0 text-[13px] font-medium">{task.title}</p>
      {task.description ? <small className="mb-2 block leading-[1.4] text-[#596171]">{task.description}</small> : null}
      <dl className="my-2 grid grid-cols-[60px_1fr] gap-1 text-[11px]">
        <dt className="text-[#667085]">担当者</dt><dd className="m-0">{taskAssigneeName(data, task.assigned_user_id)}</dd>
        <dt className="text-[#667085]">期限</dt><dd className="m-0">{formatDate(task.due_date)}</dd>
      </dl>
      <div className="mt-1.5 flex justify-end gap-1.5">
        <button
          type="button"
          onClick={onEdit}
          className="min-h-[24px] rounded-md border border-line bg-white px-2 text-[11px] text-[#263142] hover:bg-soft"
        >
          編集
        </button>
        <form action={deleteTaskAction}>
          <input type="hidden" name="id" value={task.id} />
          <button className="min-h-[24px] rounded-md border border-[#f0b4b4] bg-white px-2 text-[11px] text-red hover:bg-[#fef2f2]">削除</button>
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
