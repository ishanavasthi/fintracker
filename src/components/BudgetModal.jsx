import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { upsertBudget } from "../services/budgets";

export default function BudgetModal({ open, onClose, onSaved, category, month, initial }) {
  const { user } = useAuth();
  const [limit, setLimit] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setLimit(initial?.limit_amount != null ? String(initial.limit_amount) : "");
    setError("");
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(t);
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const amount = Number(limit);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Limit must be greater than 0");
      return;
    }

    setSubmitting(true);
    const { error: err } = await upsertBudget({
      user_id: user.id,
      category,
      month,
      limit_amount: amount,
    });
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
            {initial ? "Edit budget" : "Set budget"} · {category}
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
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Monthly limit ({month})
            </span>
            <input
              ref={inputRef}
              type="number"
              step="0.01"
              min="0"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </label>

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
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
