import { useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trash2, RefreshCw, Download } from "lucide-react";
import { useTransactions, useDeleteTransaction } from "./hooks/useTransactions";
import type { TransactionDTO } from "./hooks/useTransactions";
import { money } from "./format";

function exportToCsv(transactions: TransactionDTO[]): void {
  const headers = [
    "Date",
    "Type",
    "Source",
    "Category",
    "Amount",
    "Description",
    "Created",
  ];
  const rows = transactions.map((t) => [
    t.date,
    t.transactionType,
    `"${t.source.replace(/"/g, '""')}"`,
    t.category,
    t.amount.toFixed(2),
    `"${(t.description ?? "").replace(/"/g, '""')}"`,
    t.createdAt,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pecunia-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Validated categorical order (dark + light surfaces); 6th+ fold into "Other".
const CATEGORY_COLORS = ["#2FA47C", "#4F8FD6", "#E0614B", "#A06BCB", "#B08A2E"];
const OTHER_COLOR = "#7B8A81";
const SERIES = { income: "#2FA47C", expense: "#E0614B", all: "#B08A2E" };
const VIEWS = [
  { mode: "income", label: "Income" },
  { mode: "expense", label: "Expenses" },
  { mode: "all", label: "Everything" },
] as const;

const axis = { stroke: "var(--ink-3)", fontSize: 12, tickLine: false, axisLine: false };

export default function Dashboard() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isFetching,
  } = useTransactions();
  const deleteMutation = useDeleteTransaction();

  const allEntries = data?.pages.flatMap((p) => p.items) ?? [];
  const [chartType, setChartType] = useState<"bar" | "pie" | "line">("bar");
  const [viewMode, setViewMode] = useState<"income" | "expense" | "all">(
    "income",
  );

  const activeData =
    viewMode === "all"
      ? allEntries
      : allEntries.filter((e) =>
          viewMode === "expense"
            ? e.transactionType === "expense"
            : e.transactionType !== "expense",
        );
  const MAIN = SERIES[viewMode];

  const grouped = Object.entries(
    activeData.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const pieData =
    grouped.length > 5
      ? [
          ...grouped.slice(0, 4),
          { name: "Other", value: grouped.slice(4).reduce((s, g) => s + g.value, 0) },
        ]
      : grouped;
  const pieTotal = pieData.reduce((s, g) => s + g.value, 0);
  const lineData = [...activeData].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section className="panel p-5 sm:p-6" aria-labelledby="breakdown-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="breakdown-title" className="panel-title">
          Where it goes
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCsv(allEntries)}
            className="btn-quiet h-8 px-3"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => refetch()}
            className="btn-quiet w-8 h-8"
            aria-label="Refresh transactions"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="seg" role="group" aria-label="Show">
          {VIEWS.map((v) => (
            <button
              key={v.mode}
              aria-pressed={viewMode === v.mode}
              onClick={() => setViewMode(v.mode)}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="seg" role="group" aria-label="Chart type">
          {(
            [
              ["bar", "By category"],
              ["pie", "Share"],
              ["line", "Over time"],
            ] as const
          ).map(([t, label]) => (
            <button
              key={t}
              aria-pressed={chartType === t}
              onClick={() => setChartType(t)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 mt-5 rounded-xl animate-pulse" style={{ background: "var(--surface-2)" }} />
      ) : activeData.length === 0 ? (
        <div className="h-64 mt-5 flex flex-col items-center justify-center text-center rounded-xl" style={{ border: "1px dashed var(--line-strong)" }}>
          <p className="font-display text-lg">Nothing here yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--ink-3)" }}>
            Add an entry on the left and it shows up here.
          </p>
        </div>
      ) : chartType === "pie" ? (
        <div className="mt-5 grid sm:grid-cols-[220px_1fr] gap-6 items-center">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={62}
                  stroke="var(--surface)"
                  strokeWidth={2}
                >
                  {pieData.map((g, i) => (
                    <Cell
                      key={g.name}
                      fill={g.name === "Other" ? OTHER_COLOR : CATEGORY_COLORS[i]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => money(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2.5">
            {pieData.map((g, i) => (
              <li key={g.name} className="flex items-center gap-3 text-sm">
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{
                    background: g.name === "Other" ? OTHER_COLOR : CATEGORY_COLORS[i],
                  }}
                />
                <span className="flex-1">{g.name}</span>
                <span style={{ color: "var(--ink-3)" }}>
                  {Math.round((g.value / pieTotal) * 100)}%
                </span>
                <span className="w-28 text-right font-medium">{money(g.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="h-64 mt-5">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={grouped} barCategoryGap="30%">
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="name" {...axis} />
                <YAxis {...axis} width={56} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(v) => [money(Number(v)), "Total"]}
                  cursor={{ fill: "var(--surface-2)" }}
                />
                <Bar dataKey="value" fill={MAIN} radius={[4, 4, 0, 0]} maxBarSize={44} />
              </BarChart>
            ) : (
              <LineChart data={lineData}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="date" {...axis} />
                <YAxis {...axis} width={56} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => [money(Number(v)), "Amount"]} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={MAIN}
                  strokeWidth={2}
                  dot={{ r: 4, fill: MAIN, stroke: "var(--surface)", strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {activeData.length > 0 && (
        <div className="mt-7">
          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--ink-2)" }}>
            Ledger
          </h3>
          <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
            {activeData.map((entry) => {
              const isExpense = entry.transactionType === "expense";
              return (
                <li
                  key={entry.id}
                  className="group grid grid-cols-[4.5rem_1fr_auto_2rem] sm:grid-cols-[6rem_1fr_auto_2rem] items-center gap-3 py-3"
                  style={{ borderColor: "var(--line)" }}
                >
                  <time className="text-sm" style={{ color: "var(--ink-3)" }}>
                    {new Date(entry.date + "T00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <div className="min-w-0">
                    <p className="text-[0.9375rem] font-medium truncate">{entry.source}</p>
                    <p className="text-[0.8125rem]" style={{ color: "var(--ink-3)" }}>
                      {entry.category}
                    </p>
                  </div>
                  <span
                    className="text-[0.9375rem] font-semibold text-right"
                    style={{ color: isExpense ? "var(--expense)" : "var(--income)" }}
                  >
                    {isExpense ? "−" : "+"}
                    {money(entry.amount)}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${entry.source}"?`))
                        deleteMutation.mutate(entry.id);
                    }}
                    aria-label={`Delete ${entry.source}`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:text-[var(--expense)]"
                    style={{ color: "var(--ink-3)" }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="btn-quiet w-full h-10 mt-3"
            >
              {isFetchingNextPage ? "Loading…" : "Show older entries"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
