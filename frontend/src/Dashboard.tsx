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
import {
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Download,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTransactions, useDeleteTransaction } from "./hooks/useTransactions";
import type { TransactionDTO } from "./hooks/useTransactions";

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

const TOOLTIP_STYLE = {
  backgroundColor: "#111620",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  padding: "10px 14px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
  fontFamily: "'DM Mono', monospace",
  fontSize: "13px",
  color: "#f0f0f0",
};

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
  const [viewMode, setViewMode] = useState<"income" | "expense">("income");

  const incomeEntries = allEntries.filter(
    (e) => e.transactionType !== "expense",
  );
  const expenseEntries = allEntries.filter(
    (e) => e.transactionType === "expense",
  );

  const totalIncome = incomeEntries.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenseEntries.reduce((s, i) => s + i.amount, 0);
  const net = totalIncome - totalExpense;

  const activeData = viewMode === "income" ? incomeEntries : expenseEntries;
  const isIncome = viewMode === "income";

  const groupedData = activeData.reduce(
    (acc: { name: string; value: number }[], curr) => {
      const ex = acc.find((i) => i.name === curr.category);
      if (ex) ex.value += curr.amount;
      else acc.push({ name: curr.category, value: curr.amount });
      return acc;
    },
    [],
  );

  const INCOME_COLORS = ["#00d4aa", "#00b894", "#55efc4", "#81ecec", "#74b9ff"];
  const EXPENSE_COLORS = [
    "#ff5c5c",
    "#fd79a8",
    "#e17055",
    "#fab1a0",
    "#ff7675",
  ];
  const COLORS = isIncome ? INCOME_COLORS : EXPENSE_COLORS;
  const MAIN = isIncome ? "#00d4aa" : "#ff5c5c";

  const handleDelete = (sk: string) => {
    if (!confirm("Delete this entry?")) return;
    deleteMutation.mutate(sk);
  };

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Income",
            value: totalIncome,
            color: "#00d4aa",
            dimColor: "rgba(0,212,170,0.08)",
            borderColor: "rgba(0,212,170,0.15)",
            mode: "income" as const,
            icon: TrendingUp,
          },
          {
            label: "Expenses",
            value: totalExpense,
            color: "#ff5c5c",
            dimColor: "rgba(255,92,92,0.08)",
            borderColor: "rgba(255,92,92,0.15)",
            mode: "expense" as const,
            icon: TrendingDown,
          },
          {
            label: "Net",
            value: net,
            color: net >= 0 ? "#00d4aa" : "#ff5c5c",
            dimColor:
              net >= 0 ? "rgba(0,212,170,0.08)" : "rgba(255,92,92,0.08)",
            borderColor:
              net >= 0 ? "rgba(0,212,170,0.15)" : "rgba(255,92,92,0.15)",
            mode: null,
            icon: null,
          },
        ].map(
          ({
            label,
            value,
            color,
            dimColor,
            borderColor,
            mode,
            icon: Icon,
          }) => (
            <div
              key={label}
              onClick={() => mode && setViewMode(mode)}
              className="rounded-2xl p-4 transition-all duration-200"
              style={{
                background: dimColor,
                border: `1px solid ${viewMode === mode ? borderColor : "var(--border)"}`,
                cursor: mode ? "pointer" : "default",
                outline:
                  viewMode === mode ? `1px solid ${borderColor}` : "none",
              }}
              onMouseEnter={(e) => {
                if (mode) e.currentTarget.style.borderColor = borderColor;
              }}
              onMouseLeave={(e) => {
                if (mode && viewMode !== mode)
                  e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs tracking-widest uppercase font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  {label}
                </span>
                {Icon && <Icon className="w-3.5 h-3.5" style={{ color }} />}
              </div>
              <p
                className="text-2xl font-bold mono tracking-tight"
                style={{ color }}
              >
                ${value.toFixed(2)}
              </p>
            </div>
          ),
        )}
      </div>

      {/* Main card */}
      <div className="card p-5">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <h2
              className="font-bold text-base"
              style={{ color: "var(--text-primary)" }}
            >
              {isIncome ? "Income" : "Expenses"}
            </h2>
            <span
              className="text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
              style={{
                background: isIncome
                  ? "rgba(0,212,170,0.1)"
                  : "rgba(255,92,92,0.1)",
                color: isIncome ? "#00d4aa" : "#ff5c5c",
              }}
            >
              {viewMode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex rounded-lg p-0.5 gap-0.5"
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--border)",
              }}
            >
              {(["bar", "pie", "line"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className="px-3 py-1.5 text-xs rounded-md capitalize font-medium transition-all duration-200"
                  style={
                    chartType === t
                      ? {
                          background: "var(--surface-hover)",
                          color: "var(--text-primary)",
                        }
                      : { color: "var(--text-muted)" }
                  }
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() => exportToCsv(allEntries)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200"
              style={{
                color: "var(--text-secondary)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.borderColor = "var(--border-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>

            <button
              onClick={() => refetch()}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{
                color: "var(--text-secondary)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.borderColor = "var(--border-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Chart */}
        {isLoading ? (
          <div className="h-56 flex items-center justify-center">
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{
                borderColor: "var(--border)",
                borderTopColor: "var(--accent)",
              }}
            />
          </div>
        ) : (
          <div className="h-56 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              {activeData.length === 0 ? (
                <div
                  className="flex items-center justify-center h-full text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  No {viewMode} data yet
                </div>
              ) : chartType === "bar" ? (
                <BarChart data={groupedData} barSize={32}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="value" fill={MAIN} radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : chartType === "pie" ? (
                <PieChart>
                  <Pie
                    data={groupedData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    stroke="none"
                  >
                    {groupedData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              ) : (
                <LineChart data={activeData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke={MAIN}
                    strokeWidth={2}
                    dot={{
                      r: 3,
                      fill: "#080c14",
                      strokeWidth: 2,
                      stroke: MAIN,
                    }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Transactions list */}
        <div>
          <p
            className="text-xs tracking-widest uppercase mb-3 font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Recent {viewMode} transactions
          </p>
          <div className="space-y-2">
            <AnimatePresence>
              {activeData.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-hover)";
                    e.currentTarget.style.borderColor = "var(--border-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--surface)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          entry.transactionType === "expense"
                            ? "rgba(255,92,92,0.1)"
                            : "rgba(0,212,170,0.1)",
                      }}
                    >
                      {entry.transactionType === "expense" ? (
                        <TrendingDown
                          className="w-3.5 h-3.5"
                          style={{ color: "#ff5c5c" }}
                        />
                      ) : (
                        <TrendingUp
                          className="w-3.5 h-3.5"
                          style={{ color: "#00d4aa" }}
                        />
                      )}
                    </div>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {entry.source}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {entry.date} · {entry.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="text-sm font-bold mono"
                      style={{
                        color:
                          entry.transactionType === "expense"
                            ? "#ff5c5c"
                            : "#00d4aa",
                      }}
                    >
                      {entry.transactionType === "expense" ? "-" : "+"}$
                      {entry.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entry.id);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,92,92,0.1)";
                        e.currentTarget.style.color = "#ff5c5c";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--text-muted)";
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-2.5 text-xs rounded-xl transition-all duration-200 font-medium"
                style={{
                  color: "var(--text-secondary)",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.borderColor = "var(--border-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
