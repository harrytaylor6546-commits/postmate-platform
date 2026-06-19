import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '../../../../lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorised' }, { status: 401 })

    const { priceId, planName } = await req.json()
    if (!priceId) return Response.json({ error: 'No price selected' }, { status: 400 })

    const db = supabaseAdmin()
    const { data: profile } = await db.from('profiles').select('*').eq('clerk_user_id', userId).single()

 // Get or create Stripe customer (and verify the saved one still exists in this mode)
    let customerId = profile?.stripe_customer_id
    if (customerId) {
      try {
        const existing = await stripe.customers.retrieve(customerId)
        if (existing.deleted) customerId = null
      } catch (e) {
        customerId = null
      }
    }
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { clerk_user_id: userId },
      })
      customerId = customer.id
      await db.from('profiles').update({ stripe_customer_id: customerId }).eq('clerk_user_id', userId)
    }
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://postmate-platform-syka.vercel.app'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { clerk_user_id: userId, plan: planName },
      },
      success_url: `${appUrl}/api/stripe/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/subscribe`,
      allow_promotion_codes: true,
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
