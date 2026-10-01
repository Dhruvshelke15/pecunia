import { useTransactions } from "../hooks/useTransactions";
import { money } from "../format";

// Banknote-style guilloche rosette: hypotrochoid curves, rotated copies.
function rosette(R: number, r: number, d: number, steps = 1440) {
  let path = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 * r;
    const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
    const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
    path += `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return path;
}
const ROSETTE = [rosette(150, 7, 62), rosette(150, 9, 40), rosette(110, 11, 30)];

export function Guilloche({
  className = "absolute -right-24 top-1/2 -translate-y-1/2 w-[520px] h-[520px]",
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="-220 -220 440 440"
      className={`${className} pointer-events-none`}
    >
      {ROSETTE.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#d4b062"
          strokeOpacity={0.22 - i * 0.05}
          strokeWidth={0.6}
        />
      ))}
    </svg>
  );
}

export default function BalanceHero() {
  const { data, isLoading } = useTransactions();
  const entries = data?.pages.flatMap((p) => p.items) ?? [];
  const income = entries
    .filter((e) => e.transactionType !== "expense")
    .reduce((s, e) => s + e.amount, 0);
  const expense = entries
    .filter((e) => e.transactionType === "expense")
    .reduce((s, e) => s + e.amount, 0);
  const net = income - expense;
  const total = income + expense;
  const incomeShare = total ? (income / total) * 100 : 50;
  const savingsRate = income ? Math.round((net / income) * 100) : null;

  return (
    <section
      className="relative overflow-hidden rounded-[20px] px-6 py-7 sm:px-9 sm:py-9"
      style={{
        background:
          "radial-gradient(120% 140% at 0% 0%, #1b3a33 0%, #10231f 55%, #0b1916 100%)",
        color: "#e9ede4",
        border: "1px solid rgba(212,176,98,0.25)",
      }}
    >
      <Guilloche />

      <div className="relative">
        <p className="text-sm" style={{ color: "#a9b5aa" }}>
          Net balance
        </p>
        <p
          className="font-display mt-1 leading-none tracking-tight"
          style={{
            fontSize: "clamp(2.75rem, 7vw, 4.75rem)",
            color: net < 0 ? "#ef7f68" : "#f1e4c2",
          }}
        >
          {isLoading ? "—" : money(net)}
        </p>
        {savingsRate !== null && (
          <p className="mt-3 text-sm" style={{ color: "#a9b5aa" }}>
            {savingsRate >= 0
              ? `You kept ${savingsRate}% of what came in.`
              : `You spent ${-savingsRate}% more than you earned.`}
          </p>
        )}

        <div className="mt-8 max-w-xl">
          <div
            className="flex h-2.5 rounded-full overflow-hidden gap-[2px]"
            role="img"
            aria-label={`Income ${money(income)}, expenses ${money(expense)}`}
          >
            <div
              className="rounded-l-full transition-[width] duration-700 ease-out"
              style={{ width: `${incomeShare}%`, background: "#2fa47c" }}
            />
            <div
              className="flex-1 rounded-r-full"
              style={{ background: "#e0614b" }}
            />
          </div>
          <dl className="mt-4 flex gap-10">
            <div>
              <dt className="flex items-center gap-2 text-sm" style={{ color: "#a9b5aa" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "#2fa47c" }} />
                Income
              </dt>
              <dd className="mt-1 text-xl font-semibold">{money(income)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-sm" style={{ color: "#a9b5aa" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "#e0614b" }} />
                Expenses
              </dt>
              <dd className="mt-1 text-xl font-semibold">{money(expense)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
