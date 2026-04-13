import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'
import { deleteFromS3 } from '@/lib/s3'

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Get all user's videos
    const videos = await prisma.uploadedVideo.findMany({
      where: { userId },
      select: { s3Key: true },
    })

    // Delete from S3
    for (const video of videos) {
      try {
        await deleteFromS3(video.s3Key)
      } catch (error) {
        console.error('S3 delete error:', error)
      }
    }

    // Get all clips
    const clips = await prisma.generatedClip.findMany({
      where: { userId },
      select: { s3Key: true },
    })

    // Delete clips from S3
    for (const clip of clips) {
      if (clip.s3Key) {
        try {
          await deleteFromS3(clip.s3Key)
        } catch (error) {
          console.error('S3 delete error:', error)
        }
      }
    }

    // Delete all user data
    await prisma.generatedClip.deleteMany({ where: { userId } })
    await prisma.uploadedVideo.deleteMany({ where: { userId } })
    await prisma.subscription.deleteMany({ where: { userId } })
    await prisma.session.deleteMany({ where: { user: { id: userId } } })
    await prisma.account.deleteMany({ where: { user: { id: userId } } })
    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({ message: 'Account deleted' })
  } catch (error) {
    console.error('Account delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
