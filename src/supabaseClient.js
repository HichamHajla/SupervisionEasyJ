import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mirjgkoamfswhuahyhoq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcmpna29hbWZzd2h1YWh5aG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NTMyMjcsImV4cCI6MjA4MDQyOTIyN30.CxpL1rsIgenUo-e1SjXN9shQZ5rLABME1lTo4-5Ks-0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);