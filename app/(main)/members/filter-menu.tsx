"use client";

import { useState } from "react";
import Link from "next/link";
import type { ClassRow, ProjectRow } from "../../lib/supabase-data";

type FilterMenuProps = {
  classes: ClassRow[];
  grades: number[];
  projects: ProjectRow[];
  selectedClassId?: number;
  selectedGrade?: number;
  selectedProjectId?: number;
};

export function FilterMenu({
  classes,
  grades,
  projects,
  selectedClassId,
  selectedGrade,
  selectedProjectId,
}: FilterMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-expanded={isOpen}
        className="inline-flex h-10 min-w-[132px] items-center justify-center rounded-[7px] border border-line bg-white px-5 font-bold text-[#263142]"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        絞り込み
      </button>
      {isOpen ? (
        <form
          action="/members"
          className="absolute right-0 top-12 z-10 grid w-[320px] gap-4 rounded-[7px] border border-line bg-white p-4 shadow-[0_16px_32px_rgba(15,23,42,0.14)]"
        >
          <label className="grid gap-1 text-sm font-bold text-[#263142]">
            学年
            <select
              className="h-10 rounded-[7px] border border-line bg-white px-3 font-normal text-[#263142]"
              defaultValue={selectedGrade ?? ""}
              name="grade"
            >
              <option value="">すべて</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}年生
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold text-[#263142]">
            参加プロジェクト
            <select
              className="h-10 rounded-[7px] border border-line bg-white px-3 font-normal text-[#263142]"
              defaultValue={selectedProjectId ?? ""}
              name="projectId"
            >
              <option value="">すべて</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold text-[#263142]">
            クラス
            <select
              className="h-10 rounded-[7px] border border-line bg-white px-3 font-normal text-[#263142]"
              defaultValue={selectedClassId ?? ""}
              name="classId"
            >
              <option value="">すべて</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <Link
              className="inline-flex h-10 min-w-[88px] items-center justify-center rounded-[7px] border border-line bg-white px-4 font-bold text-[#263142]"
              href="/members"
            >
              解除
            </Link>
            <button
              className="inline-flex h-10 min-w-[88px] items-center justify-center rounded-[7px] border border-primary bg-primary px-4 font-bold text-white"
              type="submit"
            >
              適用
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
