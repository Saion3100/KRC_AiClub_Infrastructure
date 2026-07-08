"use client";

import { useMemo, useState } from "react";
import type { BurndownPoint } from "./burndown";

const WIDTH = 640;
const HEIGHT = 260;
const MARGIN = { top: 20, right: 16, bottom: 28, left: 34 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

export function BurndownChart({
  points,
  total,
  remaining,
  todayDate,
}: {
  points: BurndownPoint[];
  total: number;
  remaining: number;
  todayDate: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const xForIndex = (index: number) =>
    MARGIN.left + (points.length > 1 ? (index / (points.length - 1)) * PLOT_WIDTH : 0);
  const yForValue = (value: number) => MARGIN.top + (1 - value / total) * PLOT_HEIGHT;

  const idealPath = useMemo(
    () => points.map((point, index) => `${index === 0 ? "M" : "L"}${xForIndex(index)},${yForValue(point.ideal)}`).join(" "),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [points, total],
  );

  const actualPoints = points
    .map((point, index) => ({ index, value: point.actual }))
    .filter((entry): entry is { index: number; value: number } => entry.value !== null);

  const actualPath = actualPoints
    .map((entry, order) => `${order === 0 ? "M" : "L"}${xForIndex(entry.index)},${yForValue(entry.value)}`)
    .join(" ");

  const lastActual = actualPoints[actualPoints.length - 1];
  const todayIndex = points.findIndex((point) => point.date === todayDate);
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  const yTicks = [0, Math.round(total / 2), total];

  function handlePointerMove(event: React.PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const index = Math.round(ratio * (points.length - 1));
    setHoverIndex(Math.min(points.length - 1, Math.max(0, index)));
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-5 text-xs text-[#596171]">
        <span className="inline-flex items-center gap-1.5">
          <svg width="16" height="8" aria-hidden="true"><line x1="0" y1="4" x2="16" y2="4" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" /></svg>
          実績
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="16" height="8" aria-hidden="true"><line x1="0" y1="4" x2="16" y2="4" stroke="var(--color-muted)" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" /></svg>
          理想
        </span>
        <span className="ml-auto font-bold text-[#101828]">残り {remaining} / {total} 件</span>
      </div>
      <div className="relative">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block w-full" role="img" aria-label={`バーンダウンチャート。残り${remaining}件、全${total}件。`}>
          {yTicks.map((tick) => (
            <g key={tick}>
              <line x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={yForValue(tick)} y2={yForValue(tick)} stroke="var(--color-line)" strokeWidth="1" opacity={tick === 0 ? 0.9 : 0.5} />
              <text x={MARGIN.left - 8} y={yForValue(tick)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="var(--color-muted)">{tick}</text>
            </g>
          ))}

          {todayIndex >= 0 ? (
            <>
              <line x1={xForIndex(todayIndex)} x2={xForIndex(todayIndex)} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} stroke="var(--color-line)" strokeWidth="1" />
              <text x={xForIndex(todayIndex)} y={MARGIN.top - 6} textAnchor="middle" fontSize="11" fill="var(--color-muted)">今日</text>
            </>
          ) : null}

          <path d={idealPath} fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" />
          {actualPath ? <path d={actualPath} fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> : null}

          {lastActual ? (
            <>
              <circle cx={xForIndex(lastActual.index)} cy={yForValue(lastActual.value)} r="5" fill="var(--color-primary)" stroke="var(--color-paper)" strokeWidth="2" />
              <text x={xForIndex(lastActual.index)} y={yForValue(lastActual.value) - 12} textAnchor="middle" fontSize="11" fill="#101828" fontWeight="bold">
                {lastActual.value}件
              </text>
            </>
          ) : null}

          {points.map((point, index) => (
            <text key={point.date} x={xForIndex(index)} y={HEIGHT - MARGIN.bottom + 18} textAnchor="middle" fontSize="10" fill="var(--color-muted)" opacity={index === 0 || index === points.length - 1 ? 1 : 0}>
              {formatShortDate(point.date)}
            </text>
          ))}

          {hovered ? (
            <>
              <line x1={xForIndex(hoverIndex!)} x2={xForIndex(hoverIndex!)} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} stroke="var(--color-ink)" strokeWidth="1" opacity="0.25" />
              <circle cx={xForIndex(hoverIndex!)} cy={yForValue(hovered.ideal)} r="4" fill="var(--color-paper)" stroke="var(--color-muted)" strokeWidth="2" />
              {hovered.actual !== null ? (
                <circle cx={xForIndex(hoverIndex!)} cy={yForValue(hovered.actual)} r="4" fill="var(--color-paper)" stroke="var(--color-primary)" strokeWidth="2" />
              ) : null}
            </>
          ) : null}

          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={PLOT_WIDTH}
            height={PLOT_HEIGHT}
            fill="transparent"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoverIndex(null)}
          />
        </svg>

        {hovered ? (
          <div
            className="pointer-events-none absolute top-1 rounded-md border border-line bg-paper px-3 py-2 text-xs shadow-[0_2px_8px_#00000022]"
            style={{
              left: `${(xForIndex(hoverIndex!) / WIDTH) * 100}%`,
              transform: hoverIndex! > points.length / 2 ? "translateX(-105%)" : "translateX(5%)",
            }}
          >
            <div className="mb-1 font-bold text-[#101828]">{formatFullDate(hovered.date)}</div>
            <div className="flex items-center gap-1.5 text-[#596171]">
              <svg width="12" height="8" aria-hidden="true"><line x1="0" y1="4" x2="12" y2="4" stroke="var(--color-primary)" strokeWidth="2" /></svg>
              実績 <strong className="text-[#101828]">{hovered.actual !== null ? `${hovered.actual}件` : "—"}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-[#596171]">
              <svg width="12" height="8" aria-hidden="true"><line x1="0" y1="4" x2="12" y2="4" stroke="var(--color-muted)" strokeWidth="2" strokeDasharray="3 2" /></svg>
              理想 <strong className="text-[#101828]">{hovered.ideal.toFixed(1)}件</strong>
            </div>
          </div>
        ) : null}
      </div>

      <details className="mt-3 text-xs text-[#596171]">
        <summary className="cursor-pointer select-none">表で見る</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[360px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[#596171]">
                <th className="py-1.5 pr-3 font-bold">日付</th>
                <th className="py-1.5 pr-3 font-bold">理想</th>
                <th className="py-1.5 font-bold">実績</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr className="border-b border-[#eef1f6]" key={point.date}>
                  <td className="py-1.5 pr-3">{formatFullDate(point.date)}</td>
                  <td className="py-1.5 pr-3 tabular-nums">{point.ideal.toFixed(1)}件</td>
                  <td className="py-1.5 tabular-nums">{point.actual !== null ? `${point.actual}件` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function formatShortDate(value: string) {
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatFullDate(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}
