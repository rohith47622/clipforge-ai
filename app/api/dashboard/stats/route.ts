import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Get stats
    const videosCount = await prisma.uploadedVideo.count({
      where: { userId },
    })

    const clipsCount = await prisma.generatedClip.count({
      where: { userId },
    })

    // Get this month's clips
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthClips = await prisma.generatedClip.count({
      where: {
        userId,
        createdAt: { gte: monthStart },
      },
    })

    // Calculate storage used
    const videos = await prisma.uploadedVideo.findMany({
      where: { userId },
      select: { fileSize: true },
    })

    const storageUsed = videos.reduce((total, video) => total + video.fileSize, 0)

    return NextResponse.json({
      videosProcessed: videosCount,
      clipsGenerated: clipsCount,
      storageUsed,
      thisMonthClips,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
