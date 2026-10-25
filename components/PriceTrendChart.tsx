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

const ACCENT = "#0d9488";
const ACCENT_MUTED = "#0f766e";
const TICK = "#5b6b7c";
const GRID = "rgba(11, 18, 32, 0.1)";

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
    <div className="border border-line bg-ink-elevated px-3 py-2 shadow-sm">
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
  title = "Prisudvikling",
  emptyMessage = "Ingen prisdata tilgængelig for dette kort.",
}: PriceTrendChartProps) {
  if (!data.length) {
    return (
      <div className="w-full border border-line bg-ink-elevated p-6 text-parchment">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
          untap.dk
        </p>
        <h3 className="mt-2 font-display text-xl text-parchment">{title}</h3>
        <p className="mt-3 text-sm text-parchment-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full border border-line bg-ink-elevated p-4 text-parchment sm:p-6">
      <header className="mb-4 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
          untap.dk
        </p>
        <h3 className="font-display text-xl tracking-tight text-parchment">
          {title}
        </h3>
        <p className="text-xs text-parchment-muted">
          Markedsgennemsnit de seneste 30 dage
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
                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke={GRID}
              strokeDasharray="3 6"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatAxisDate}
              tick={{ fill: TICK, fontSize: 11 }}
              axisLine={{ stroke: GRID }}
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
              tick={{ fill: TICK, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={56}
              domain={["auto", "auto"]}
            />
            <Tooltip
              content={<PriceTooltip />}
              cursor={{
                stroke: "rgba(15, 118, 110, 0.45)",
                strokeWidth: 1,
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={ACCENT_MUTED}
              strokeWidth={2.25}
              fill="url(#priceTrendFill)"
              dot={{
                r: data.length <= 4 ? 3.5 : 0,
                fill: ACCENT,
                stroke: "#ffffff",
                strokeWidth: 1.5,
              }}
              activeDot={{
                r: 5,
                fill: ACCENT,
                stroke: "#ffffff",
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
