import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '../../lib/supabase'
import DashboardClient from '../../components/DashboardClient'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = supabaseAdmin()
  const { data: profile } = await db.from('profiles').select('*').eq('clerk_user_id', userId).single()
  if (!profile?.onboarding_complete) redirect('/onboarding')

  const { data: history } = await db.from('content_history').select('id,month,year,created_at').eq('clerk_user_id', userId).order('created_at', { ascending: false }).limit(5)

  const now = new Date()
  const currentMonth = MONTHS[now.getMonth()]
  const currentYear = now.getFullYear()
  const alreadyGenerated = history?.some(h => h.month === currentMonth && h.year === currentYear)

  return <DashboardClient profile={profile} history={history||[]} currentMonth={currentMonth} currentYear={currentYear} alreadyGenerated={!!alreadyGenerated}/>
}
