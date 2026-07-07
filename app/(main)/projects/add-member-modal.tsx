"use client";

import { useRef } from "react";

export function AddMemberModal({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          document.body.style.overflow = "hidden";
          dialogRef.current?.showModal();
        }}
        className="grid h-11 w-full place-items-center border border-dashed border-[#9aa4b5] hover:bg-soft"
      >
        メンバー追加
      </button>
      <dialog
        ref={dialogRef}
        onClose={() => { document.body.style.overflow = ""; }}
        className="m-auto rounded-lg border border-line p-0 backdrop:bg-black/40"
      >
        <div className="max-h-[85vh] w-[480px] max-w-[92vw] overflow-y-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="m-0 text-xl font-medium">メンバーを追加</h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="閉じる"
              className="rounded-full border border-transparent p-1 text-4xl leading-none text-[#596171] transition-colors hover:border-line hover:bg-soft hover:text-[#202633]"
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
