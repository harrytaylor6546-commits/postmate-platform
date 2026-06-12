import Stripe from 'stripe'
import { supabaseAdmin } from '../../../lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const db = supabaseAdmin()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      await db.from('profiles')
        .update({ stripe_subscription_id: session.subscription, plan: 'active' })
        .eq('stripe_customer_id', session.customer)
      console.log('Subscription started for customer:', session.customer)
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object
      const plan = sub.status === 'active' ? 'active' : sub.status === 'trialing' ? 'trial' : 'inactive'
      await db.from('profiles')
        .update({ plan, stripe_subscription_id: sub.id })
        .eq('stripe_customer_id', sub.customer)
      console.log('Subscription updated:', sub.customer, sub.status)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object
      await db.from('profiles')
        .update({ plan: 'cancelled', stripe_subscription_id: null })
        .eq('stripe_customer_id', sub.customer)
      console.log('Subscription cancelled:', sub.customer)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      await db.from('profiles')
        .update({ plan: 'past_due' })
        .eq('stripe_customer_id', invoice.customer)
      console.log('Payment failed for:', invoice.customer)
      break
    }
  }

  return Response.json({ received: true })
}
