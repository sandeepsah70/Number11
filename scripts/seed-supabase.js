import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env manually without external package
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

try {
  const envContent = fs.readFileSync(path.resolve('.env'), 'utf-8');
  envContent.split('\n').forEach(line => {
    const [k, ...v] = line.trim().split('=');
    if (k && v.length) {
      const val = v.join('=').trim();
      if (k === 'VITE_SUPABASE_URL') supabaseUrl = val;
      if (k === 'VITE_SUPABASE_ANON_KEY') supabaseKey = val;
    }
  });
} catch {
  // ignore
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE URL or KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking Supabase connection...');
  console.log(`URL: ${supabaseUrl}`);
  
  const tables = ['profiles', 'virtual_numbers', 'orders', 'payments', 'subscriptions', 'messages'];
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`⚠️  Table [${t}]: ${error.message}`);
    } else {
      console.log(`✅ Table [${t}]: accessible (records: ${count ?? 0})`);
    }
  }

  const { data: numbers, error: numErr } = await supabase.from('virtual_numbers').select('*');
  if (numErr) {
    console.log('Virtual numbers query error:', numErr.message);
  } else {
    console.log(`📱 Available virtual numbers in DB: ${numbers?.length || 0}`);
  }
}

checkDatabase();
