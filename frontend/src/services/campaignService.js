import { readCollection, KEYS, ensureSeeded } from "@/lib/storage";

export async function listCampaigns() {
  ensureSeeded();
  return readCollection(KEYS.campaigns, []);
}
