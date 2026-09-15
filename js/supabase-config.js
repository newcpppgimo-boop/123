// Replace these two values with your Supabase project's public URL and publishable/anon key.
// Never put the Supabase service-role/secret key in this file.
const SUPABASE_URL = "https://adfusiumugdgbaieawqsw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZnVzaXVtdWdkYmFpZWF3cXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NzAxNjcsImV4cCI6MjEwNTA0NjE2N30.ZfFnsCoJxTEGxrtyLUpEnI-sFdbi1GXshSw_cTA3J8A";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
