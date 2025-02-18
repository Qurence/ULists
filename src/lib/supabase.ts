
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uthbwyximlfpkklrdqzl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0aGJ3eXhpbWxmcGtrbHJkcXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3ODk5ODUsImV4cCI6MjA1NTM2NTk4NX0.1cM2CA_Whwwha2uAGToVZ1jtau-uYpqcGApyClckWFg';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
