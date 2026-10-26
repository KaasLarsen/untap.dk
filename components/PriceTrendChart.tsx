"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PricePoint } from "@/lib/pokewallet";

type PriceTrendChartProps = {
  data: PricePoint[];
  title?: string;
  emptyMessage?: string;
};

const eurFormatter = new Intl.NumberFormat("da-DK", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("da-DK", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatAxisDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "short",
  }).format(d);
}

function PriceTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;

  const price = payload[0]?.value;
  if (price == null || !Number.isFinite(price)) return null;

  const d = new Date(`${label}T00:00:00Z`);
  const dateLabel = Number.isNaN(d.getTime())
    ? label
    : dateFormatter.format(d);

  return (
    <div className="rounded-md border border-line bg-ink px-3 py-2 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.9)]">
      <p className="text-[11px] uppercase tracking-[0.14em] text-parchment-muted">
        {dateLabel}
      </p>
      <p className="mt-1 font-display text-lg text-accent-bright">
        {eurFormatter.format(price)}
      </p>
    </div>
  );
}

export function PriceTrendChart({
  data,
  title = "Prishistorik (EUR)",
  emptyMessage = "Ingen prisdata tilgængelig for dette kort.",
}: PriceTrendChartProps) {
  if (!data.length) {
    return (
      <div className="w-full rounded-2xl border border-line bg-ink-elevated p-6 text-parchment">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
          untap.dk
        </p>
        <h3 className="mt-2 font-display text-xl text-parchment">{title}</h3>
        <p className="mt-3 text-sm text-parchment-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-line bg-ink-elevated p-4 text-parchment sm:p-6">
      <header className="mb-4 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
          untap.dk
        </p>
        <h3 className="font-display text-xl tracking-tight text-parchment">
          {title}
        </h3>
        <p className="text-xs text-parchment-muted">
          Gennemsnit over 30 / 7 / 1 dag + trend
        </p>
      </header>

      <div className="h-56 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="priceTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e0b04a" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#e0b04a" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgba(214, 206, 192, 0.12)"
              strokeDasharray="3 6"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatAxisDate}
              tick={{ fill: "#9a9286", fontSize: 11 }}
              axisLine={{ stroke: "rgba(214, 206, 192, 0.12)" }}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis
              tickFormatter={(value: number) =>
                new Intl.NumberFormat("da-DK", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(value)
              }
              tick={{ fill: "#9a9286", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={56}
              domain={["auto", "auto"]}
            />
            <Tooltip
              content={<PriceTooltip />}
              cursor={{
                stroke: "rgba(201, 149, 42, 0.45)",
                strokeWidth: 1,
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#e0b04a"
              strokeWidth={2.25}
              fill="url(#priceTrendFill)"
              dot={{
                r: data.length <= 4 ? 3.5 : 0,
                fill: "#e0b04a",
                stroke: "#10131a",
                strokeWidth: 1.5,
              }}
              activeDot={{
                r: 5,
                fill: "#e0b04a",
                stroke: "#07080b",
                strokeWidth: 2,
              }}
              isAnimationActive
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
