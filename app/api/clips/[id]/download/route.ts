import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'
import { getSignedUrlForObject } from '@/lib/s3'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const clipId = params.id

    const clip = await prisma.generatedClip.findUnique({
      where: { id: clipId },
    })

    if (!clip || clip.userId !== userId) {
      return NextResponse.json({ error: 'Clip not found' }, { status: 404 })
    }

    if (!clip.s3Key) {
      return NextResponse.json(
        { error: 'Clip not ready for download' },
        { status: 400 }
      )
    }

    // Get signed URL
    const url = await getSignedUrlForObject(clip.s3Key, 3600) // 1 hour expiry

    // Increment download count
    await prisma.generatedClip.update({
      where: { id: clipId },
      data: { downloadCount: { increment: 1 } },
    })

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
