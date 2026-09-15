// Replace these two values with your Supabase project's public URL and publishable/anon key.
// Never put the Supabase service-role/secret key in this file.
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_PUBLIC_KEY";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
