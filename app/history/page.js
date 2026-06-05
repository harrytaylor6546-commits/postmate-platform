import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '../../lib/supabase'
import HistoryClient from '../../components/HistoryClient'

export default async function HistoryPage({ searchParams }) {
  const { userId } = await auth()
  const db = supabaseAdmin()
  const { data: history } = await db.from('content_history').select('*').eq('clerk_user_id', userId).order('created_at', { ascending: false }).limit(24)
  const activeId = searchParams?.id || history?.[0]?.id
  const active = history?.find(h => h.id === activeId) || history?.[0]
  return <HistoryClient history={history||[]} active={active||null}/>
}
