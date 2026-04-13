'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ArrowRight, Zap, Sparkles, TrendingUp, Users, Rocket } from 'lucide-react'

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'AI-Powered Analysis',
      description: 'Automatic viral moment detection using GPT and Whisper'
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Multi-Platform Ready',
      description: 'Generate clips optimized for YouTube Shorts, TikTok, Instagram Reels, and Facebook'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Smart Captions',
      description: 'Auto-generated captions with customizable styles and fonts'
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: 'Fast Processing',
      description: 'Queue-based processing with real-time status updates'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Team Collaboration',
      description: 'Share projects and clips with team members (Pro plans)'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: '99.9% Uptime',
      description: 'Enterprise-grade infrastructure with automatic backups'
    },
  ]

  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'YouTube Creator',
      image: '👨‍💼',
      text: 'ClipForge AI saved me 20 hours a week. Now I can focus on content creation, not editing!'
    },
    {
      name: 'Sarah Patel',
      role: 'Podcast Producer',
      image: '👩‍💼',
      text: 'Automatically turning my 2-hour podcast into 15 viral clips. This is a game-changer!'
    },
    {
      name: 'Mike Johnson',
      role: 'Digital Agency Owner',
      image: '👨‍💻',
      text: 'Tripled our client output with half the team. ClipForge is now core to our workflow.'
    },
  ]

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for trying ClipForge',
      features: [
        '3 videos/month',
        'SD quality (480p)',
        'Watermark included',
        'Basic support',
      ],
      cta: 'Start Free',
      popular: false,
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
        'Analytics dashboard',
      ],
      cta: 'Start Pro',
      popular: true,
    },
    {
      name: 'Business',
      price: '$199',
      description: 'For teams and agencies',
      features: [
        'Unlimited videos',
        '4K quality export',
        'Team dashboard',
        '24/7 support',
        'API access',
        'Custom integrations',
        'Dedicated manager',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Transform Long Videos Into Viral Clips
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8">
              Upload your videos and let AI automatically generate optimized short-form clips for YouTube Shorts, TikTok, Instagram Reels, and more.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 cursor-pointer"
              onClick={() => router.push(session ? '/dashboard' : '/auth/register')}
            >
              Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="cursor-pointer"
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 rounded-lg border border-border/50 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-8 backdrop-blur"
          >
            <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-pulse" />
                <p className="text-white font-semibold">Your AI Video Processing Dashboard</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Powerful Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-lg border border-border/50 bg-card hover:border-border transition-colors"
              >
                <div className="mb-4 text-blue-600">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Loved by Creators</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-lg bg-card border border-border/50"
              >
                <p className="text-lg mb-4">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Simple Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-8 rounded-lg border transition-all ${
                  plan.popular
                    ? 'border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-blue-500/10 scale-105'
                    : 'border-border/50 bg-card'
                }`}
              >
                {plan.popular && (
                  <div className="mb-4 inline-block px-4 py-1 rounded-full bg-purple-500/20 text-purple-600 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full cursor-pointer"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Video Strategy?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of creators who are saving hours every week with ClipForge AI.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 cursor-pointer"
            onClick={() => router.push(session ? '/dashboard' : '/auth/register')}
          >
            Start Your Free Account <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
