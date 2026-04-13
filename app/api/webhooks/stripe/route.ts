import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') || ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id

        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

          // Update user subscription
          await prisma.subscription.upsert({
            where: { userId: userId! },
            create: {
              userId: userId!,
              stripeSubscriptionId: session.subscription as string,
              stripeCustomerId: session.customer as string,
              plan: 'PRO',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            update: {
              stripeSubscriptionId: session.subscription as string,
              stripeCustomerId: session.customer as string,
              plan: 'PRO',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const customer = await stripe.customers.retrieve(customerId)
        const userId = (customer as any).metadata?.userId

        if (userId) {
          await prisma.subscription.update({
            where: { userId },
            data: {
              stripeSubscriptionId: subscription.id,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              status: subscription.status,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const customer = await stripe.customers.retrieve(customerId)
        const userId = (customer as any).metadata?.userId

        if (userId) {
          await prisma.subscription.update({
            where: { userId },
            data: {
              plan: 'FREE',
              status: 'cancelled',
            },
          })
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const userId = paymentIntent.metadata?.userId

        if (userId) {
          await prisma.payment.update({
            where: { stripePaymentIntentId: paymentIntent.id },
            data: {
              status: 'COMPLETED',
            },
          })
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const userId = paymentIntent.metadata?.userId

        if (userId) {
          await prisma.payment.update({
            where: { stripePaymentIntentId: paymentIntent.id },
            data: {
              status: 'FAILED',
            },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
