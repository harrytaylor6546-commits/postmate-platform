import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '../../../lib/supabase'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error:'Unauthorised' },{ status:401 })
  const { data } = await supabaseAdmin().from('profiles').select('*').eq('clerk_user_id',userId).single()
  return Response.json(data||{})
}

export async function POST(req) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error:'Unauthorised' },{ status:401 })
  const body = await req.json()
  const { data,error } = await supabaseAdmin().from('profiles').upsert({
    clerk_user_id:userId,
    business_name:body.name, business_type:body.type, location:body.location,
    website:body.website||'', voice:body.voice, offerings:body.offerings,
    audience:body.audience||'', instagram:body.instagram||'', facebook:body.facebook||'',
    images:body.images||[], onboarding_complete:body.onboarding_complete||false,
    updated_at:new Date().toISOString()
  },{ onConflict:'clerk_user_id' }).select().single()
  if (error) return Response.json({ error:error.message },{ status:500 })
  return Response.json(data)
}

export async function PATCH(req) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error:'Unauthorised' },{ status:401 })
  const body = await req.json()
  const { data,error } = await supabaseAdmin().from('profiles').update({ ...body, updated_at:new Date().toISOString() }).eq('clerk_user_id',userId).select().single()
  if (error) return Response.json({ error:error.message },{ status:500 })
  return Response.json(data)
}
