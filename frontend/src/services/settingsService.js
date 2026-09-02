import { requireSupabase, throwIfError } from "@/lib/supabase";

export async function getAppSetting(key) {
  const { data, error } = await requireSupabase().from("app_settings").select("value").eq("key", key).maybeSingle();
  throwIfError(error);
  return data?.value ?? null;
}
