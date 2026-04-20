import { useCallback, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import BudgetModal from "../components/BudgetModal";
import { CATEGORIES, currentMonthKey, formatMoney } from "../constants";
import { useBudgets } from "../hooks/useBudgets";
import { useTransactions } from "../hooks/useTransactions";

function progressColor(pct) {
  if (pct >= 100) return "bg-red-500";
  if (pct >= 70) return "bg-yellow-500";
  return "bg-green-500";
}

export default function Budgets() {
  const [month, setMonth] = useState(currentMonthKey());

  const txFilters = useMemo(() => ({ month }), [month]);
  const { transactions, loading: txLoading, error: txError } = useTransactions(txFilters);
  const {
    budgets,
    loading: bLoading,
    error: bError,
    refetch: refetchBudgets,
  } = useBudgets(month);

  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  const rows = useMemo(() => {
    const budgetByCat = new Map(budgets.map((b) => [b.category, b]));
    const spentByCat = new Map();
    (transactions ?? [])
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        spentByCat.set(
          t.category,
          (spentByCat.get(t.category) || 0) + Number(t.amount || 0)
        );
      });

    return CATEGORIES.map((cat) => {
      const budget = budgetByCat.get(cat) || null;
      const limit = budget ? Number(budget.limit_amount) : 0;
      const spent = spentByCat.get(cat) || 0;
      const pct = limit > 0 ? Math.min(999, (spent / limit) * 100) : 0;
      const over = limit > 0 && spent > limit;
      return { category: cat, budget, limit, spent, pct, over };
    });
  }, [budgets, transactions]);

  const openEdit = useCallback((category) => {
    setEditCategory(category);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const loading = txLoading || bLoading;
  const error = txError || bError;

  const editingBudget = editCategory
    ? budgets.find((b) => b.category === editCategory) || null
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
            <p className="text-sm text-gray-500">Track spending against monthly limits.</p>
          </div>
          <label className="block">
            <span className="block text-xs font-medium text-gray-600 mb-1">Month</span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
        </header>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error.message || "Failed to load budgets"}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rows.map((r) => (
              <div
                key={r.category}
                className="bg-white rounded-2xl shadow-md p-6 flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{r.category}</h3>
                    <p className="text-xs text-gray-500">
                      {r.budget ? `Limit ${formatMoney(r.limit)}` : "No budget set"}
                    </p>
                  </div>
                  {r.over && (
                    <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                      ⚠️ Over budget
                    </span>
                  )}
                </div>

                <div className="mb-2">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-semibold text-gray-900">
                      {formatMoney(r.spent)}
                      {r.budget && (
                        <span className="text-gray-400 font-normal">
                          {" "}
                          / {formatMoney(r.limit)}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full ${progressColor(r.pct)} transition-all`}
                    style={{ width: `${r.budget ? Math.min(100, r.pct) : 0}%` }}
                  />
                </div>
                {r.budget && (
                  <p className="mt-1 text-xs text-gray-500">
                    {r.pct.toFixed(0)}% used
                  </p>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => openEdit(r.category)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    {r.budget ? "Edit budget" : "Set budget"}
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      <BudgetModal
        open={modalOpen}
        onClose={closeModal}
        onSaved={refetchBudgets}
        category={editCategory}
        month={month}
        initial={editingBudget}
      />
    </div>
  );
}
