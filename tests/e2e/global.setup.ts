import { ensureLocalSupabase, resetLocalDatabase } from './utils/local-supabase';
import { seedLocalSupabase } from './utils/seed';

async function globalSetup() {
  ensureLocalSupabase();
  resetLocalDatabase();
  const env = ensureLocalSupabase();
  await seedLocalSupabase(env);
}

export default globalSetup;
