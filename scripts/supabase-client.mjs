import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

// Load .env.local if present (Node.js 20.6+)
try {
  const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env.local");
  process.loadEnvFile?.(envPath);
} catch {
  // Ignore if .env.local does not exist
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  console.error("Please ensure .env.local exists in the project root or configure environment variables.");
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export { supabaseUrl, serviceKey };
