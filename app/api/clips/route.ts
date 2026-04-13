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
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all'

    const query: any = { userId }

    if (status !== 'all') {
      query.processingStatus = status
    }

    const clips = await prisma.generatedClip.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(clips)
  } catch (error) {
    console.error('Fetch clips error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
