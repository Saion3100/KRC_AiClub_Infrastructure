"use client";

import { useRef } from "react";

export function TaskFormModal({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          document.body.style.overflow = "hidden";
          dialogRef.current?.showModal();
        }}
        className="inline-flex h-12 min-w-[140px] items-center justify-center rounded-[7px] border-0 bg-primary px-5 font-bold text-white"
      >
        ＋ タスクを追加
      </button>
      <dialog
        ref={dialogRef}
        onClose={() => { document.body.style.overflow = ""; }}
        className="m-auto rounded-lg border border-line p-0 backdrop:bg-black/40"
      >
        <div className="w-[600px] max-w-[90vw] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="m-0 text-xl font-medium">タスクを追加</h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="閉じる"
              className="text-2xl leading-none text-[#596171]"
            >
              ×
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}
