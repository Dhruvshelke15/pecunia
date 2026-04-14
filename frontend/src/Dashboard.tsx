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
  DollarSign,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTransactions, useDeleteTransaction } from "./hooks/useTransactions";
import type { TransactionDTO } from "./hooks/useTransactions";

import { useState } from "react";

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
  link.download = `pecunia-export-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

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

  const allEntries = data?.pages.flatMap((page) => page.items) ?? [];

  const [chartType, setChartType] = useState<"bar" | "pie" | "line">("bar");
  const [viewMode, setViewMode] = useState<"income" | "expense">("income");

  const incomeEntries = allEntries.filter(
    (e) => e.transactionType !== "expense",
  );
  const expenseEntries = allEntries.filter(
    (e) => e.transactionType === "expense",
  );

  const totalIncome = incomeEntries.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expenseEntries.reduce((sum, i) => sum + i.amount, 0);
  const net = totalIncome - totalExpense;

  const activeData = viewMode === "income" ? incomeEntries : expenseEntries;

  const groupedData = activeData.reduce(
    (acc: { name: string; value: number }[], curr) => {
      const existing = acc.find((i) => i.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    },
    [],
  );

  const INCOME_COLORS = ["#10b981", "#3b82f6", "#6366f1", "#8b5cf6", "#06b6d4"];
  const EXPENSE_COLORS = [
    "#f43f5e",
    "#f97316",
    "#e11d48",
    "#db2777",
    "#dc2626",
  ];
  const CURRENT_COLORS = viewMode === "income" ? INCOME_COLORS : EXPENSE_COLORS;
  const MAIN_COLOR = viewMode === "income" ? "#10b981" : "#f43f5e";

  const handleDelete = (sk: string) => {
    if (!confirm("Delete this entry?")) return;
    deleteMutation.mutate(sk);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div onClick={() => setViewMode("income")} className="cursor-pointer">
          <StatCard
            title="Income"
            value={totalIncome}
            icon={TrendingUp}
            color="emerald"
            active={viewMode === "income"}
          />
        </div>
        <div onClick={() => setViewMode("expense")} className="cursor-pointer">
          <StatCard
            title="Expenses"
            value={totalExpense}
            icon={TrendingDown}
            color="rose"
            active={viewMode === "expense"}
          />
        </div>
        <StatCard
          title="Net Balance"
          value={net}
          icon={DollarSign}
          color={net >= 0 ? "indigo" : "orange"}
        />
      </div>

      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">
              {viewMode === "income" ? "Income Breakdown" : "Expense Breakdown"}
            </h2>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                viewMode === "income"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/20 text-rose-400"
              }`}
            >
              {viewMode}
            </span>
          </div>

          <div className="flex gap-2">
            <div className="flex bg-black/30 p-1 rounded-lg">
              {(["bar", "pie", "line"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                    chartType === type
                      ? "bg-white/10 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              onClick={() => exportToCsv(allEntries)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-black/30 rounded-lg transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>

            <button
              onClick={() => refetch()}
              className="p-2 bg-black/30 rounded-lg text-slate-400 hover:text-white"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-72 flex items-center justify-center text-slate-500">
            Loading...
          </div>
        ) : (
          <div className="h-72 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              {activeData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  No {viewMode} data to display.
                </div>
              ) : chartType === "bar" ? (
                <BarChart data={groupedData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "#334155",
                      color: "#f8fafc",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill={MAIN_COLOR}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : chartType === "pie" ? (
                <PieChart>
                  <Pie
                    data={groupedData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    stroke="none"
                  >
                    {groupedData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CURRENT_COLORS[index % CURRENT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "#334155",
                      color: "#f8fafc",
                    }}
                  />
                </PieChart>
              ) : (
                <LineChart data={activeData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    vertical={false}
                  />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "#334155",
                      color: "#f8fafc",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke={MAIN_COLOR}
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#1e293b" }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            Recent {viewMode} Transactions
          </h3>
          <AnimatePresence>
            {activeData.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="group flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      entry.transactionType === "expense"
                        ? "bg-rose-500/20"
                        : "bg-emerald-500/20"
                    }`}
                  >
                    {entry.transactionType === "expense" ? (
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">
                      {entry.source || "Unknown"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{entry.date}</span>
                      <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                      <span>{entry.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`font-mono font-bold ${
                      entry.transactionType === "expense"
                        ? "text-rose-400"
                        : "text-emerald-400"
                    }`}
                  >
                    ${entry.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(entry.id);
                    }}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all disabled:opacity-50"
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  active,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  active?: boolean;
}) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };

  const activeStyle =
    active !== undefined
      ? active
        ? "ring-2 ring-offset-2 ring-offset-slate-900 ring-indigo-500"
        : "opacity-75 hover:opacity-100"
      : "";

  return (
    <div
      className={`p-5 rounded-2xl border backdrop-blur-sm transition-all ${
        colorMap[color] ?? colorMap.indigo
      } ${activeStyle}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium opacity-80">{title}</h3>
        <Icon className="w-5 h-5 opacity-80" />
      </div>
      <p className="text-2xl font-bold tracking-tight">${value.toFixed(2)}</p>
    </div>
  );
}
