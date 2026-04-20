import { supabase } from "./supabase";

function monthRange(month) {
  const [y, m] = month.split("-").map(Number);
  const start = `${month}-01`;
  const endDate = new Date(Date.UTC(y, m, 1));
  const end = endDate.toISOString().slice(0, 10);
  return { start, end };
}

export async function getTransactions(userId, filters = {}) {
  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.month) {
    const { start, end } = monthRange(filters.month);
    query = query.gte("date", start).lt("date", end);
  }
  if (filters.category && filters.category !== "All") {
    query = query.eq("category", filters.category);
  }
  if (filters.type && filters.type !== "All") {
    query = query.eq("type", filters.type);
  }

  return await query;
}

export async function addTransaction(data) {
  return await supabase.from("transactions").insert(data).select().single();
}

export async function updateTransaction(id, data) {
  return await supabase.from("transactions").update(data).eq("id", id).select().single();
}

export async function deleteTransaction(id) {
  return await supabase.from("transactions").delete().eq("id", id);
}
