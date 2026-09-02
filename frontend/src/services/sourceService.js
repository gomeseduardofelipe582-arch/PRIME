import { requireSupabase, throwIfError } from "@/lib/supabase";

export async function listLeadSources() {
  const { data, error } = await requireSupabase().from("lead_sources").select("*").eq("active", true).order("sort_order");
  throwIfError(error);
  return data.map((item) => ({ id: item.id, name: item.name, slug: item.slug }));
}

export async function getLeadSourceByName(name) {
  const { data, error } = await requireSupabase().from("lead_sources").select("*").eq("name", name).eq("active", true).maybeSingle();
  throwIfError(error);
  return data;
}
