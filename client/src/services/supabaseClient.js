// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Supabase project URL and public anon key
// You'll need to replace these with your actual Supabase project values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xdlychgbxznncynbvbmm.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbHljaGdieHpubmN5bmJ2Ym1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMTIyNjMsImV4cCI6MjA2MDc4ODI2M30.032wR69mJgJ5LJssiyIhD9dRb-JIDKj1KHciOFMSGIs';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;