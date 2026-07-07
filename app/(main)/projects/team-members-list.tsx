"use client";

import { useRef, useState } from "react";
import { removeProjectMemberAction, updateProjectMemberRoleAction } from "../../lib/actions";
import { projectRoles } from "../../lib/domain";

type Member = {
  userId: number;
  userName: string;
  role: number;
};

export function TeamMembersList({
  members,
  projectId,
  canManage,
  currentUserId,
}: {
  members: Member[];
  projectId: number;
  canManage: boolean;
  currentUserId: number;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Member | null>(null);

  if (!canManage) {
    return (
      <>
        {members.map((member) => (
          <p className="border-b border-[#d8deea] py-3.5" key={member.userId}>
            {member.userName}<b className="float-right">{projectRoleLabel(member.role)}</b>
          </p>
        ))}
      </>
    );
  }

  return (
    <>
      {members.map((member) =>
        member.userId === currentUserId ? (
          <p className="border-b border-[#d8deea] py-3.5" key={member.userId}>
            {member.userName}<b className="float-right">{projectRoleLabel(member.role)}</b>
          </p>
        ) : (
          <button
            type="button"
            key={member.userId}
            onClick={() => {
              setSelected(member);
              document.body.style.overflow = "hidden";
              dialogRef.current?.showModal();
            }}
            className="flex w-full items-center border-b border-[#d8deea] py-3.5 text-left hover:bg-soft"
          >
            <span>{member.userName}</span>
            <b className="ml-auto font-bold">{projectRoleLabel(member.role)}</b>
          </button>
        ),
      )}

      <dialog
        ref={dialogRef}
        onClose={() => {
          document.body.style.overflow = "";
          setSelected(null);
        }}
        className="m-auto rounded-lg border border-line p-0 backdrop:bg-black/40"
      >
        <div className="max-h-[85vh] w-[420px] max-w-[92vw] overflow-y-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="m-0 text-xl font-medium">{selected?.userName}</h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="閉じる"
              className="rounded-full border border-transparent p-1 text-4xl leading-none text-[#596171] transition-colors hover:border-line hover:bg-soft hover:text-[#202633]"
            >
              ×
            </button>
          </div>
          {selected ? (
            <>
              <form action={updateProjectMemberRoleAction}>
                <input type="hidden" name="project_id" value={projectId} />
                <input type="hidden" name="user_id" value={selected.userId} />
                <label>役割
                  <select name="role" defaultValue={selected.role}>
                    {Object.entries(projectRoles).map(([value, label]) => (
                      <option value={value} key={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <div className="mt-[18px] flex justify-end">
                  <button className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-[7px] border-0 bg-primary px-5 font-bold text-white hover:bg-blue">
                    変更する
                  </button>
                </div>
              </form>
              <form action={removeProjectMemberAction} className="mt-4 border-t border-[#e0e4eb] pt-4">
                <input type="hidden" name="project_id" value={projectId} />
                <input type="hidden" name="user_id" value={selected.userId} />
                <button className="inline-flex h-11 w-full items-center justify-center rounded-[7px] border border-red text-red hover:bg-[#fef2f2]">
                  このメンバーを削除
                </button>
              </form>
            </>
          ) : null}
        </div>
      </dialog>
    </>
  );
}

function projectRoleLabel(role: number) {
  return projectRoles[role as keyof typeof projectRoles] ?? "メンバー";
}
