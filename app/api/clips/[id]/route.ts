import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'
import { deleteFromS3 } from '@/lib/s3'

export async function DELETE(
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

    // Delete from S3
    if (clip.s3Key) {
      try {
        await deleteFromS3(clip.s3Key)
      } catch (error) {
        console.error('S3 delete error:', error)
      }
    }

    // Delete from database
    await prisma.generatedClip.delete({
      where: { id: clipId },
    })

    return NextResponse.json({ message: 'Clip deleted' })
  } catch (error) {
    console.error('Delete clip error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
