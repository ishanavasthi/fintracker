import { supabase } from "./supabase";

export async function getBudgets(userId, month) {
  return await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .eq("month", month);
}

export async function upsertBudget(data) {
  return await supabase
    .from("budgets")
    .upsert(data, { onConflict: "user_id,category,month" })
    .select()
    .single();
}

export async function deleteBudget(id) {
  return await supabase.from("budgets").delete().eq("id", id);
}
