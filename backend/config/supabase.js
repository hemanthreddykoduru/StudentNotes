const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();


const supabaseUrl = process.env.SUPABASE_URL;
// Use Service Role Key for backend to bypass RLS (since we handle auth in middleware)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key is missing from .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
