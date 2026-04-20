import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTransactions } from "../services/transactions";

export function useTransactions(filters = {}) {
  const { user } = useAuth();
  const { month, category, type } = filters;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await getTransactions(user.id, { month, category, type });
    if (err) {
      setError(err);
      setTransactions([]);
    } else {
      setTransactions(data ?? []);
    }
    setLoading(false);
  }, [user, month, category, type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { transactions, loading, error, refetch: fetchData };
}

export default useTransactions;
