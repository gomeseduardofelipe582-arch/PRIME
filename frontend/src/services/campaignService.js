import { requireSupabase, throwIfError } from "@/lib/supabase";

export async function listCampaigns() {
  const { data, error } = await requireSupabase().from("campaigns").select("*").eq("active", true).order("name");
  throwIfError(error);
  return data.map((item) => ({ id: item.id, name: item.name, channel: item.channel, description: item.description, active: item.active }));
}
