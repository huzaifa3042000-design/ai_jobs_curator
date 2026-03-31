import supabase from './supabase.js';

// Standard Query Function
export async function getSomething(userId) {
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
  return data;
}

// Standard Upsert Function
export async function upsertSomething(userId, payload) {
  const { data, error } = await supabase
    .from('table_name')
    .upsert({ ...payload, user_id: userId, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
}
