
import { createClient } from '@supabase/supabase-js';
import { supabase as originalSupabase } from '@/integrations/supabase/client';

// We're re-exporting the existing supabase client from the integrations folder
export const supabase = originalSupabase;

// Export types for convenience
export type { User, Session } from '@supabase/supabase-js';
