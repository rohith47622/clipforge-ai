'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { Upload, ArrowRight, FileVideo, AlertCircle } from 'lucide-react'
import axios from 'axios'

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024 // 5GB
const ALLOWED_FORMATS = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm']

export default function UploadPage() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [videoDescription, setVideoDescription] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size exceeds 5GB limit')
        return
      }

      // Validate file type
      if (!ALLOWED_FORMATS.includes(file.type)) {
        toast.error('Invalid file format. Please upload MP4, MOV, MKV, or WebM')
        return
      }

      setSelectedFile(file)
      toast.success('Video ready for upload')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.mkv', '.webm'],
    },
  })

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error('Please select a video file')
      return
    }

    if (!videoTitle.trim()) {
      toast.error('Please enter a video title')
      return
    }

    setIsUploading(true)

    try {
      // Create FormData
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', videoTitle)
      formData.append('description', videoDescription)

      // Upload file
      const response = await axios.post('/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )
          setUploadProgress(percentCompleted)
        },
      })

      toast.success('Video uploaded successfully! Processing started...')
      router.push(`/dashboard/video/${response.data.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Video</h1>
        <p className="text-muted-foreground">
          Upload your long-form video and we'll generate viral clips automatically
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Video File</CardTitle>
          <CardDescription>
            Supports MP4, MOV, MKV, and WebM files up to 5GB
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Drop Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                isDragActive
                  ? 'border-purple-600 bg-purple-500/10'
                  : 'border-border/50 hover:border-border'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <>
                  <p className="font-semibold mb-2">Drop your video here</p>
                  <p className="text-sm text-muted-foreground">
                    We'll upload and process it immediately
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold mb-2">Drag and drop your video here</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse your computer
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 5GB
                  </p>
                </>
              )}
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="rounded-lg border border-border/50 bg-card/50 p-4 flex items-center gap-4">
                <FileVideo className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Change
                </button>
              </div>
            )}

            {/* Video Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Video Title *</Label>
                <Input
                  id="title"
                  placeholder="My Awesome Podcast Episode"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  disabled={isUploading}
                  className="mt-2"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {videoTitle.length}/100 characters
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <textarea
                  id="description"
                  placeholder="Add some context about your video..."
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  disabled={isUploading}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {videoDescription.length}/500 characters
                </p>
              </div>
            </div>

            {/* Info Alert */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-50/5 p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Processing Timeline</p>
                <p>
                  After uploading, we'll transcribe your video (5-10 min per hour), analyze it for
                  viral moments, and generate clips automatically using AI.
                </p>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-border/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 cursor-pointer"
              >
                {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload & Process'}
                {!isUploading && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isUploading}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
