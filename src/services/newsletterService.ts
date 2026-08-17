import { supabase } from '../lib/supabase'

/**
 * Subscribes an email to the newsletter via a SECURITY DEFINER PostgreSQL function.
 * Handles upsert and profile linking server-side, bypassing RLS restrictions.
 */
export async function subscribeNewsletter(name: string, email: string): Promise<void> {
  const { error } = await supabase.rpc('subscribe_newsletter', {
    p_name: name.trim(),
    p_email: email.trim().toLowerCase(),
  })

  if (error) {
    console.error('[Newsletter] RPC error:', error.code, error.message, error.details)
    throw new Error(error.message)
  }
}
