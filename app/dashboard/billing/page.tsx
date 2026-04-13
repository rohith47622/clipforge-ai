'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, Zap, Users, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface Subscription {
  plan: string
  status: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

export default function BillingPage() {
  const { data: session } = useSession()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/billing/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      toast.error('Failed to fetch subscription')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = async (plan: string) => {
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      }
    } catch (error) {
      toast.error('Failed to initiate checkout')
    }
  }

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for trying out',
      features: [
        '3 videos/month',
        'SD quality (480p)',
        'Watermark included',
        'Community support',
      ],
      current: subscription?.plan === 'FREE',
      cta: 'Current Plan',
      disabled: subscription?.plan === 'FREE',
    },
    {
      name: 'Pro',
      price: '$49',
      description: 'For serious creators',
      features: [
        '50 videos/month',
        'HD quality (1080p)',
        'No watermark',
        'Priority support',
        'Custom branding',
        'Analytics',
      ],
      current: subscription?.plan === 'PRO',
      cta: 'Upgrade to Pro',
      disabled: subscription?.plan === 'PRO',
      popular: true,
    },
    {
      name: 'Business',
      price: '$199',
      description: 'For teams & agencies',
      features: [
        'Unlimited videos',
        '4K quality export',
        'Team dashboard',
        '24/7 support',
        'API access',
        'Custom integrations',
      ],
      current: subscription?.plan === 'BUSINESS',
      cta: 'Upgrade to Business',
      disabled: subscription?.plan === 'BUSINESS',
    },
  ]

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view billing details
        </p>
      </div>

      {/* Current Subscription */}
      {!isLoading && subscription && (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold mb-2">{subscription.plan}</p>
                <p className="text-muted-foreground">
                  {subscription.status === 'active'
                    ? `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    : 'Subscription inactive'}
                </p>
              </div>
              <Button
                onClick={() => handleUpgrade(subscription.plan === 'FREE' ? 'pro' : 'business')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 cursor-pointer"
              >
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-8">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`h-full flex flex-col relative ${
                plan.popular ? 'border-purple-500/50 scale-105' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan.name.toLowerCase())}
                    disabled={plan.disabled}
                    className={`w-full cursor-pointer ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                    {!plan.disabled && <ArrowRight className="ml-2 w-4 h-4" />}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Can I change plans anytime?',
              a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
            },
            {
              q: 'What happens when I cancel?',
              a: 'Youll retain access until the end of your billing period. All your data remains available for download.',
            },
            {
              q: 'Do you offer refunds?',
              a: 'We offer a 30-day money-back guarantee for new subscriptions. Contact support for details.',
            },
            {
              q: 'Can I get a custom quote?',
              a: 'Yes! For Business plan or larger commitments, contact our sales team for custom pricing.',
            },
          ].map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-lg border border-border/50 p-6"
            >
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-muted-foreground">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
