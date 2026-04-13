import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'
import { uploadToS3 } from '@/lib/s3'
import { extractVideoMetadata } from '@/lib/ffmpeg'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5gb',
    },
  },
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Parse form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedMimes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm']
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (5GB)
    if (file.size > 5 * 1024 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Check user's storage usage
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Upload to S3
    const buffer = await file.arrayBuffer()
    const s3Key = `videos/${userId}/${Date.now()}-${file.name}`
    const s3Url = await uploadToS3(Buffer.from(buffer), s3Key, file.type)

    // Extract video metadata
    const metadata = await extractVideoMetadata(buffer)

    // Create database record
    const video = await prisma.uploadedVideo.create({
      data: {
        userId,
        title,
        description,
        duration: metadata.duration || 0,
        fileSize: file.size,
        s3Key,
        s3Url,
        transcriptionStatus: 'pending',
        analysisStatus: 'pending',
      },
    })

    // Queue transcription job
    // In production, this would use BullMQ + Redis
    console.log(`Queued transcription for video ${video.id}`)

    return NextResponse.json({
      id: video.id,
      title: video.title,
      duration: video.duration,
      message: 'Video uploaded successfully. Processing started...',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
