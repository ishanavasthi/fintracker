import { useCallback, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import TransactionModal from "../components/TransactionModal";
import { SectionSpinner } from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import { CATEGORIES, currentMonthKey, formatMoney } from "../constants";
import { useTransactions } from "../hooks/useTransactions";
import { deleteTransaction } from "../services/transactions";

const TYPE_OPTIONS = ["All", "income", "expense"];

export default function Transactions() {
  const [month, setMonth] = useState(currentMonthKey());
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");

  const filters = useMemo(() => ({ month, category, type }), [month, category, type]);

  const { transactions, loading, error, refetch } = useTransactions(filters);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const openAdd = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((t) => {
    setEditing(t);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Delete this transaction?")) return;
      const { error: err } = await deleteTransaction(id);
      if (err) {
        window.alert(err.message || "Failed to delete");
        return;
      }
      refetch();
    },
    [refetch]
  );

  const sorted = useMemo(
    () =>
      [...(transactions ?? [])].sort((a, b) =>
        a.date < b.date ? 1 : a.date > b.date ? -1 : 0
      ),
    [transactions]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-sm text-gray-500">Manage your income and expenses.</p>
          </div>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500"
          >
            + Add transaction
          </button>
        </header>

        <section className="bg-white rounded-2xl shadow-md p-4 sm:p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-gray-600 mb-1">Month</span>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-gray-600 mb-1">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <div className="block">
              <span className="block text-xs font-medium text-gray-600 mb-1">Type</span>
              <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden w-full">
                {TYPE_OPTIONS.map((t) => {
                  const active = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 px-3 py-2 text-sm font-medium capitalize transition ${
                        active
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md">
          {error && <ErrorMessage error={error} className="m-4" />}

          {loading ? (
            <SectionSpinner />
          ) : sorted.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-500">
              No transactions match the current filters.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {sorted.map((t) => (
                <li
                  key={t.id}
                  className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{t.title}</p>
                    <p className="text-xs text-gray-500">
                      {t.category} · {t.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`font-semibold whitespace-nowrap ${
                        t.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatMoney(Number(t.amount))}
                    </span>
                    <button
                      onClick={() => openEdit(t)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-xs font-medium text-red-600 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <button
        onClick={openAdd}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-3xl leading-none shadow-lg grid place-items-center"
        aria-label="Add transaction"
      >
        +
      </button>

      <TransactionModal
        open={modalOpen}
        onClose={closeModal}
        onSaved={refetch}
        initial={editing}
      />
    </div>
  );
}
