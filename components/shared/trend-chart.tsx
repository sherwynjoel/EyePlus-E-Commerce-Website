import type { TrendPoint } from "@/lib/services/report-service";

export function TrendChart({
  points,
  valueFormatter = (v) => String(v),
}: {
  points: TrendPoint[];
  valueFormatter?: (value: number) => string;
}) {
  const max = Math.max(1, ...points.map((p) => p.value));

  return (
    <div className="flex h-40 gap-1.5">
      {points.map((point, index) => (
        <div key={`${point.label}-${index}`} className="flex flex-1 flex-col justify-end gap-1.5">
          <div
            className="w-full rounded-t-sm bg-foreground/80 transition-colors hover:bg-foreground"
            style={{ height: `${Math.max(2, (point.value / max) * 100)}%` }}
            title={`${point.label}: ${valueFormatter(point.value)}`}
          />
          <span className="text-center text-[10px] text-muted-foreground">{point.label}</span>
        </div>
      ))}
    </div>
  );
}
