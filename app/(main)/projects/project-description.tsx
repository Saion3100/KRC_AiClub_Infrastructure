"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "../nav";

export function ProjectDescription({ text, className = "" }: { text: string; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setCanExpand(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  return (
    <div>
      <p ref={ref} className={`leading-[1.7] text-[#344054] ${className} ${expanded ? "" : "line-clamp-2"}`}>
        {text}
      </p>
      {canExpand ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setExpanded((value) => !value);
          }}
          className="relative z-1 mt-1.5 inline-flex h-6 items-center gap-1 rounded-full border border-line bg-white px-2.5 text-[11px] font-bold text-[#263142] hover:bg-soft"
        >
          {expanded ? "折りたたむ" : "続きを読む"}
          <Icon name="chevron-down" className={`block h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      ) : null}
    </div>
  );
}
