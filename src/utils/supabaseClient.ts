import { createClient } from '@supabase/supabase-js';

// Configuration Supabase côté frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://onevlbtqovhsgqcsoqva.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZXZsYnRxb3Zoc2dxY3NvcXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODc3NTEsImV4cCI6MjA4MTQ2Mzc1MX0.Dxnm1X33WDxfHm7ROsu-LLt2-icERkvc4LShy2on4E8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

