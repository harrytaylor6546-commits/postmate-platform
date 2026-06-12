import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '../../../lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorised' }, { status: 401 })

  const db = supabaseAdmin()
  const { data: profile } = await db.from('profiles').select('stripe_customer_id').eq('clerk_user_id', userId).single()

  if (!profile?.stripe_customer_id) {
    return Response.json({ error: 'No subscription found' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://postmate-platform-syka.vercel.app'
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${appUrl}/dashboard`,
  })

  return Response.json({ url: session.url })
}
