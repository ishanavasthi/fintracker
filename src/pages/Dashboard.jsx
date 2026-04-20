import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Navbar from "../components/Navbar";
import { useTransactions } from "../hooks/useTransactions";

const PIE_COLORS = [
  "#6366f1",
  "#22c55e",
  "#ef4444",
  "#f59e0b",
  "#06b6d4",
  "#ec4899",
  "#8b5cf6",
];

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n || 0);
}

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString(undefined, { month: "short" });
}

export default function Dashboard() {
  const now = new Date();
  const currentMonth = monthKey(now);

  const { transactions, loading, error } = useTransactions({});

  const { income, expenses, net, pieData, barData, recent } = useMemo(() => {
    const txs = transactions ?? [];

    const currentTxs = txs.filter((t) => (t.date || "").startsWith(currentMonth));

    const income = currentTxs
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const expenses = currentTxs
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const net = income - expenses;

    const catMap = new Map();
    currentTxs
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        catMap.set(t.category, (catMap.get(t.category) || 0) + Number(t.amount || 0));
      });
    const pieData = Array.from(catMap, ([name, value]) => ({ name, value }));

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(monthKey(d));
    }
    const barMap = new Map(months.map((k) => [k, { month: k, income: 0, expenses: 0 }]));
    txs.forEach((t) => {
      const k = (t.date || "").slice(0, 7);
      const row = barMap.get(k);
      if (!row) return;
      if (t.type === "income") row.income += Number(t.amount || 0);
      else if (t.type === "expense") row.expenses += Number(t.amount || 0);
    });
    const barData = months.map((k) => {
      const row = barMap.get(k);
      return { ...row, label: monthLabel(k) };
    });

    const recent = [...txs]
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
      .slice(0, 5);

    return { income, expenses, net, pieData, barData, recent };
  }, [transactions, currentMonth, now]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Overview for{" "}
            {now.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </p>
        </header>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error.message || "Failed to load data"}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <SummaryCard label="Income this month" value={formatMoney(income)} tone="income" />
              <SummaryCard label="Expenses this month" value={formatMoney(expenses)} tone="expense" />
              <SummaryCard
                label="Net balance"
                value={formatMoney(net)}
                tone={net >= 0 ? "income" : "expense"}
              />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card title="Expenses by category">
                {pieData.length === 0 ? (
                  <EmptyState text="No expenses this month yet." />
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={(entry) => entry.name}
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => formatMoney(v)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>

              <Card title="Income vs Expenses (last 6 months)">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip formatter={(v) => formatMoney(v)} />
                      <Legend />
                      <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </section>

            <section>
              <Card title="Recent transactions">
                {recent.length === 0 ? (
                  <EmptyState text="No transactions yet. Add one to get started." />
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {recent.map((t) => (
                      <li key={t.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{t.title}</p>
                          <p className="text-xs text-gray-500">
                            {t.category} · {t.date}
                          </p>
                        </div>
                        <span
                          className={`font-semibold whitespace-nowrap ${
                            t.type === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {t.type === "income" ? "+" : "-"}
                          {formatMoney(Number(t.amount))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ label, value, tone }) {
  const color = tone === "income" ? "text-green-600" : "text-red-600";
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-10 text-center text-sm text-gray-500">{text}</div>
  );
}
