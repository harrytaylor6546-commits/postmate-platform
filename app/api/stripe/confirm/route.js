import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '../../../../lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function GET(req) {
  const { userId } = await auth()
  const url = new URL(req.url)
  if (!userId) return Response.redirect(new URL('/sign-in', url.origin))

  const sessionId = url.searchParams.get('session_id')
  if (!sessionId) return Response.redirect(new URL('/dashboard', url.origin))

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status === 'paid') {
      await supabaseAdmin().from('profiles').update({
        plan: 'active',
        stripe_subscription_id: session.subscription,
      }).eq('clerk_user_id', userId)
    }
  } catch (err) {
    console.error('Stripe confirm error:', err)
  }

  return Response.redirect(new URL('/dashboard', url.origin))
}
