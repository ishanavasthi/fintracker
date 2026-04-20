import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getBudgets } from "../services/budgets";

export function useBudgets(month) {
  const { user } = useAuth();

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!user || !month) {
      setBudgets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await getBudgets(user.id, month);
    if (err) {
      setError(err);
      setBudgets([]);
    } else {
      setBudgets(data ?? []);
    }
    setLoading(false);
  }, [user, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { budgets, loading, error, refetch: fetchData };
}

export default useBudgets;
