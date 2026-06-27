declare const require: (dkd_module_name: string) => any;
declare const process: {
  env: Record<string, string | undefined>;
};

const dkd_supabase_module = require('@supabase/supabase-js');
const dkd_async_storage_module = require('@react-native-async-storage/async-storage');

const dkd_create_client = dkd_supabase_module.createClient;
const dkd_async_storage = dkd_async_storage_module.default;

export const dkd_supabase_url = process.env.EXPO_PUBLIC_DKD_SUPABASE_URL ?? '';
export const dkd_supabase_publishable_key = process.env.EXPO_PUBLIC_DKD_SUPABASE_PUBLISHABLE_KEY ?? '';

export const dkd_is_supabase_env_ready =
  dkd_supabase_url.includes('supabase.co') && dkd_supabase_publishable_key.length > 20;

const dkd_safe_supabase_url = dkd_is_supabase_env_ready
  ? dkd_supabase_url
  : 'https://example.supabase.co';

const dkd_safe_supabase_key = dkd_is_supabase_env_ready
  ? dkd_supabase_publishable_key
  : 'missing-supabase-publishable-key';

export const dkd_supabase_client = dkd_create_client(dkd_safe_supabase_url, dkd_safe_supabase_key, {
  auth: {
    storage: dkd_async_storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
