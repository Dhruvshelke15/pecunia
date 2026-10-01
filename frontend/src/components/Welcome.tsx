import { useTransactions } from "../hooks/useTransactions";
import { money } from "../format";
import { Guilloche } from "./BalanceHero";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

interface Props {
  email?: string;
  onContinue: (target: "dashboard" | "entry") => void;
}

export default function Welcome({ email, onContinue }: Props) {
  const { data, isLoading } = useTransactions();
  const entries = data?.pages.flatMap((p) => p.items) ?? [];
  const net = entries.reduce(
    (s, e) => s + (e.transactionType === "expense" ? -e.amount : e.amount),
    0,
  );
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = entries.filter((e) => e.date.startsWith(month)).length;
  const isNew = !isLoading && entries.length === 0;

  return (
    <main
      className="relative min-h-screen overflow-hidden flex items-center px-6 sm:px-12"
      style={{
        background:
          "radial-gradient(110% 120% at 15% 10%, #1b3a33 0%, #10231f 50%, #0b1916 100%)",
        color: "#e9ede4",
      }}
    >
      <Guilloche className="absolute -right-40 top-1/2 -translate-y-1/2 w-[860px] h-[860px] max-w-none opacity-90" />
      <div
        aria-hidden
        className="absolute inset-4 sm:inset-6 rounded-[18px] pointer-events-none"
        style={{ border: "1px solid rgba(212,176,98,0.3)" }}
      />

      <div className="welcome-rise relative max-w-2xl py-16">
        <p
          className="font-display text-sm tracking-[0.3em]"
          style={{ color: "#d4b062" }}
        >
          Pecunia
        </p>
        <h1
          className="font-display mt-4 leading-[1.05]"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: "#f1e4c2" }}
        >
          {greeting()}.
        </h1>
        {email && (
          <p className="mt-3" style={{ color: "#a9b5aa" }}>
            Signed in as {email}
          </p>
        )}

        <div
          className="mt-10 pt-6 max-w-md"
          style={{ borderTop: "1px solid rgba(212,176,98,0.3)" }}
        >
          {isLoading ? (
            <p style={{ color: "#a9b5aa" }}>Counting your money…</p>
          ) : isNew ? (
            <p className="text-lg leading-relaxed" style={{ color: "#c9d1c7" }}>
              Your ledger is empty. Log what you earn and spend, and Pecunia
              shows where it goes, scores your habits, and forecasts next month.
            </p>
          ) : (
            <dl className="grid grid-cols-2 gap-6">
              <div>
                <dt className="text-sm" style={{ color: "#a9b5aa" }}>
                  Net balance
                </dt>
                <dd
                  className="font-display text-3xl mt-1"
                  style={{ color: net < 0 ? "#ef7f68" : "#f1e4c2" }}
                >
                  {money(net)}
                </dd>
              </div>
              <div>
                <dt className="text-sm" style={{ color: "#a9b5aa" }}>
                  Entries this month
                </dt>
                <dd
                  className="font-display text-3xl mt-1"
                  style={{ color: "#f1e4c2" }}
                >
                  {thisMonth}
                </dd>
              </div>
            </dl>
          )}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={() => onContinue(isNew ? "entry" : "dashboard")}
            className="h-12 px-6 rounded-[10px] font-semibold"
            style={{ background: "#d4b062", color: "#10231f" }}
          >
            {isNew ? "Add my first entry" : "Open my dashboard"}
          </button>
          {!isNew && (
            <button
              onClick={() => onContinue("entry")}
              className="h-12 px-6 rounded-[10px] font-semibold"
              style={{
                border: "1px solid rgba(212,176,98,0.45)",
                color: "#e9ede4",
              }}
            >
              Add an entry
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
