import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.https://pkkvnqfayvfhghwvfqeo.supabase.co;
const supabaseAnonKey = import.meta.env.sb_publishable_whK623SM48tce33NoztVeA_C5fF_8Ax;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);