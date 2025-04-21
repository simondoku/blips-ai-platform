// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Supabase project URL and public anon key
// These must be set as environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Authentication will not work.');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;