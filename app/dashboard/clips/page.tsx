'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Download, ExternalLink, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Clip {
  id: string
  title: string
  description: string
  duration: number
  s3Url: string
  thumbnailUrl: string
  processingStatus: string
  downloadCount: number
  createdAt: string
}

export default function ClipsPage() {
  const { data: session } = useSession()
  const [clips, setClips] = useState<Clip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchClips()
  }, [filter])

  const fetchClips = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/clips?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setClips(data)
      }
    } catch (error) {
      toast.error('Failed to fetch clips')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (clipId: string) => {
    try {
      const response = await fetch(`/api/clips/${clipId}/download`)
      if (response.ok) {
        const { url } = await response.json()
        window.open(url, '_blank')
        toast.success('Download started')
      }
    } catch (error) {
      toast.error('Download failed')
    }
  }

  const handleDelete = async (clipId: string) => {
    if (!window.confirm('Are you sure you want to delete this clip?')) return

    try {
      const response = await fetch(`/api/clips/${clipId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setClips(clips.filter(c => c.id !== clipId))
        toast.success('Clip deleted')
      }
    } catch (error) {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generated Clips</h1>
        <p className="text-muted-foreground">
          View and manage all your generated short-form video clips
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {['all', 'completed', 'processing', 'failed'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
            className="cursor-pointer capitalize whitespace-nowrap"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Clips Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg bg-card/50 h-64 animate-pulse" />
          ))}
        </div>
      ) : clips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No clips found</p>
            <Link href="/dashboard/upload">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 cursor-pointer">
                Upload Video Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clips.map((clip, idx) => (
            <motion.div
              key={clip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="overflow-hidden hover:border-border transition-colors h-full flex flex-col">
                {/* Thumbnail */}
                <div className="relative aspect-[9/16] bg-muted overflow-hidden">
                  {clip.thumbnailUrl && (
                    <img
                      src={clip.thumbnailUrl}
                      alt={clip.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <span className="text-white text-sm font-semibold">
                      {clip.duration}s
                    </span>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="flex-1 flex flex-col">
                  <h3 className="font-semibold truncate mt-4 mb-2">{clip.title}</h3>
                  <p className="text-sm text-muted-foreground flex-1 line-clamp-2 mb-4">
                    {clip.description}
                  </p>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      clip.processingStatus === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : clip.processingStatus === 'processing'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {clip.processingStatus}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="text-xs text-muted-foreground mb-4">
                    <p>📥 {clip.downloadCount} downloads</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {clip.processingStatus === 'completed' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(clip.id)}
                          className="flex-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(clip.s3Url, '_blank')}
                          className="cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(clip.id)}
                      className="cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
