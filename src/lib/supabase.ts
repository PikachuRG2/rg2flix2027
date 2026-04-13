// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Garantindo que as variáveis de ambiente existem
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão definidos!');
}

try {
  new URL(supabaseUrl);
} catch (e) {
  throw new Error('VITE_SUPABASE_URL deve ser uma URL válida (começando com http:// ou https://)');
}

// Cria o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);