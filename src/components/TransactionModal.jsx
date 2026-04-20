import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "../constants";
import { addTransaction, updateTransaction } from "../services/transactions";
import { useAuth } from "../context/AuthContext";

const empty = {
  title: "",
  amount: "",
  type: "expense",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
};

export default function TransactionModal({ open, onClose, onSaved, initial }) {
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef(null);

  const mode = initial ? "edit" : "add";

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title ?? "",
        amount: String(initial.amount ?? ""),
        type: initial.type ?? "expense",
        category: initial.category ?? "Food",
        date: initial.date ?? new Date().toISOString().slice(0, 10),
      });
    } else {
      setForm(empty);
    }
    setError("");
    const t = setTimeout(() => titleRef.current?.focus(), 20);
    return () => clearTimeout(t);
  }, [open, initial]);

  if (!open) return null;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const title = form.title.trim();
    const amount = Number(form.amount);
    if (!title) return setError("Title is required");
    if (!Number.isFinite(amount) || amount <= 0) return setError("Amount must be greater than 0");
    if (!["income", "expense"].includes(form.type)) return setError("Invalid type");
    if (!CATEGORIES.includes(form.category)) return setError("Invalid category");
    if (!form.date) return setError("Date is required");

    const payload = {
      title,
      amount,
      type: form.type,
      category: form.category,
      date: form.date,
    };

    setSubmitting(true);
    const { error: err } =
      mode === "edit"
        ? await updateTransaction(initial.id, payload)
        : await addTransaction({ ...payload, user_id: user.id });
    setSubmitting(false);

    if (err) {
      setError(err.message || "Failed to save");
      return;
    }
    onSaved?.();
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === "edit" ? "Edit transaction" : "Add transaction"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title">
            <input
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Groceries, Salary, etc."
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount">
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </Field>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60"
            >
              {submitting ? "Saving..." : mode === "edit" ? "Save changes" : "Add transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}
