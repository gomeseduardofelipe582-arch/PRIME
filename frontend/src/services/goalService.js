import { requireSupabase, throwIfError } from "@/lib/supabase";

export async function getMonthlyGoal(year, month) {
  const { data, error } = await requireSupabase().from("monthly_goals").select("*").eq("year", year).eq("month", month).maybeSingle();
  throwIfError(error);
  return data ? { revenue: Number(data.revenue_goal), count: data.enrollment_goal } : null;
}

export async function saveMonthlyGoal(year, month, goal) {
  const client = requireSupabase();
  const { data: { user }, error: authError } = await client.auth.getUser();
  throwIfError(authError);
  if (!user) throw new Error("Sessão expirada.");
  const { data, error } = await client.from("monthly_goals").upsert({
    owner_id: user.id, year, month, revenue_goal: Number(goal.revenue) || 0, enrollment_goal: Number(goal.count) || 0,
  }, { onConflict: "owner_id,year,month" }).select().single();
  throwIfError(error);
  return { revenue: Number(data.revenue_goal), count: data.enrollment_goal };
}
