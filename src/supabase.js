import { createClient } from "@supabase/supabase-js";

// ── Replace these two values with your own from supabase.com ──────────────────
// Project Settings → API → Project URL + anon/public key
const SUPABASE_URL  = "https://olbmsxainxvkuyvikaro.supabase.co";
const SUPABASE_ANON = "sb_publishable_A9f-PHXZqhvsfP6uMD74jA_U8rhC82k";
// ─────────────────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
