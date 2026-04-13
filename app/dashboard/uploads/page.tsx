'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Upload, Clock, FileVideo, Trash2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface UploadedVideo {
  id: string
  title: string
  duration: number
  fileSize: number
  transcriptionStatus: string
  analysisStatus: string
  createdAt: string
}

export default function UploadsPage() {
  const { data: session } = useSession()
  const [videos, setVideos] = useState<UploadedVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/videos')
      if (response.ok) {
        const data = await response.json()
        setVideos(data)
      }
    } catch (error) {
      toast.error('Failed to fetch videos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (videoId: string) => {
    if (!window.confirm('Are you sure? This will delete the video and all associated clips.')) return

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setVideos(videos.filter(v => v.id !== videoId))
        toast.success('Video deleted')
      }
    } catch (error) {
      toast.error('Delete failed')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'processing':
        return 'bg-blue-100 text-blue-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Uploaded Videos</h1>
            <p className="text-muted-foreground">
              Manage your long-form videos and track their processing status
            </p>
          </div>
          <Link href="/dashboard/upload">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 cursor-pointer">
              <Upload className="mr-2 w-4 h-4" />
              Upload New
            </Button>
          </Link>
        </div>
      </div>

      {/* Videos List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-lg bg-card/50 h-24 animate-pulse" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileVideo className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No videos uploaded yet</p>
            <Link href="/dashboard/upload">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 cursor-pointer">
                Upload Your First Video
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {videos.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:border-border transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(video.duration)}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileVideo className="w-4 h-4" />
                          {formatFileSize(video.fileSize)}
                        </div>
                        <div>
                          Uploaded {new Date(video.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex gap-2 mt-3">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(video.transcriptionStatus)}`}>
                          Transcription: {video.transcriptionStatus}
                        </span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(video.analysisStatus)}`}>
                          Analysis: {video.analysisStatus}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/dashboard/video/${video.id}`}>
                        <Button
                          variant="outline"
                          className="cursor-pointer"
                        >
                          View Details
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(video.id)}
                        className="cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
