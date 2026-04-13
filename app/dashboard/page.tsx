'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  Upload,
  Zap,
  TrendingUp,
  Calendar,
  BarChart3,
  Video,
  ArrowRight,
} from 'lucide-react'

interface Stats {
  videosProcessed: number
  clipsGenerated: number
  storageUsed: number
  thisMonthClips: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    videosProcessed: 0,
    clipsGenerated: 0,
    storageUsed: 0,
    thisMonthClips: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchStats()
    }
  }, [session])

  const statCards = [
    {
      title: 'Videos Processed',
      value: stats.videosProcessed,
      icon: <Video className="w-8 h-8 text-blue-600" />,
      description: 'Total uploaded videos',
    },
    {
      title: 'Clips Generated',
      value: stats.clipsGenerated,
      icon: <Zap className="w-8 h-8 text-purple-600" />,
      description: 'Total generated clips',
    },
    {
      title: 'This Month',
      value: stats.thisMonthClips,
      icon: <Calendar className="w-8 h-8 text-green-600" />,
      description: 'Clips generated',
    },
    {
      title: 'Storage Used',
      value: `${(stats.storageUsed / (1024 * 1024 * 1024)).toFixed(2)} GB`,
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      description: 'Total storage',
    },
  ]

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {session?.user?.name}!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your ClipForge account today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="hover:border-border transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold">{isLoading ? '-' : card.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.description}
                    </p>
                  </div>
                  {card.icon}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Video Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>
                Upload a long-form video (30-120 minutes) and let AI generate viral clips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="max-w-md">
                  <div
                    className="border-2 border-dashed border-border/50 rounded-lg p-12 text-center hover:border-border transition cursor-pointer"
                    onClick={() => router.push('/dashboard/upload')}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-semibold mb-2">Drag and drop your video</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to select from your computer
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP4, MOV, MKV, WebM up to 5GB
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/upload')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 cursor-pointer"
                >
                  Start Uploading <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Usage Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Clips Generated</p>
                <p className="text-3xl font-bold">{stats.thisMonthClips}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  of your monthly limit
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={() => router.push('/dashboard/billing')}
                >
                  Upgrade Plan
                </Button>
                <Button
                  variant="ghost"
                  className="w-full cursor-pointer"
                  onClick={() => router.push('/dashboard/clips')}
                >
                  View All Clips
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
