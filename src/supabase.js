import { createClient } from "@supabase/supabase-js";

// ── Replace these two values with your own from supabase.com ──────────────────
// Project Settings → API → Project URL + anon/public key
const SUPABASE_URL  = "https://olbmsxainxvkuyvikaro.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYm1zeGFpbnh2a3V5dmlrYXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMzc3MDgsImV4cCI6MjA4NzYxMzcwOH0.lNyg5jJapJ58X7TfHDXVuqe8gd3aL6BdPq1YGDPoCsI";
// ─────────────────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
