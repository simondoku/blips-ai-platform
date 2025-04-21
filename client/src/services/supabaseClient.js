// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Supabase project URL and public anon key
// You'll need to replace these with your actual Supabase project values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;