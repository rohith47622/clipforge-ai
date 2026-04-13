import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    credits: 3,
    limit: 'month',
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    price: 4900, // $49 in cents
    credits: 50,
    limit: 'month',
  },
  business: {
    name: 'Business',
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID,
    price: 19900, // $199 in cents
    credits: -1, // unlimited
    limit: 'month',
  },
}

export async function createCheckoutSession(
  userId: string,
  planId: string,
  returnUrl: string
) {
  const plan = STRIPE_PLANS[planId as keyof typeof STRIPE_PLANS]

  if (!plan) {
    throw new Error('Invalid plan')
  }

  if (!plan.priceId) {
    throw new Error('Plan not available')
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
    client_reference_id: userId,
    subscription_data: {
      metadata: {
        userId,
        plan: planId,
      },
    },
  })

  return session
}

export async function createPaymentIntent(
  userId: string,
  amount: number,
  description: string
) {
  const intent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    payment_method_types: ['card'],
    metadata: {
      userId,
    },
    description,
  })

  return intent
}
