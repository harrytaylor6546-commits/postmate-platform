import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '../../../lib/supabase'
import SettingsClient from '../../../components/SettingsClient'

export default async function SettingsPage() {
  const { userId } = auth()
  const db = supabaseAdmin()
  const { data: profile } = await db.from('profiles').select('*').eq('clerk_user_id', userId).single()
  return <SettingsClient profile={profile}/>
}
