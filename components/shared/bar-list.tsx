import type { TrendPoint } from "@/lib/services/report-service";

export function BarList({
  items,
  valueFormatter = (v) => String(v),
}: {
  items: TrendPoint[];
  valueFormatter?: (value: number) => string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet.</p>;
  }

  return (
    <div className="space-y-2.5">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-3 text-sm">
          <span className="w-32 shrink-0 truncate text-muted-foreground">{item.label}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground/80"
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
              title={valueFormatter(item.value)}
            />
          </div>
          <span className="w-16 shrink-0 text-right tabular-nums">{valueFormatter(item.value)}</span>
        </div>
      ))}
    </div>
  );
}
