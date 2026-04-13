'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, Settings, Upload, Zap } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border/50 bg-card/50 p-6 hidden md:flex flex-col">
        <Link href="/dashboard" className="font-bold text-xl mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ClipForge AI
        </Link>

        <nav className="space-y-2 flex-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition"
          >
            <Zap className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/uploads"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition"
          >
            <Upload className="w-4 h-4" />
            Uploads
          </Link>
          <Link
            href="/dashboard/clips"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition"
          >
            <Zap className="w-4 h-4" />
            Generated Clips
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </nav>

        <div className="space-y-4 pt-4 border-t border-border/50">
          <div className="px-4 py-2">
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="font-semibold truncate">{session.user?.email}</p>
          </div>
          <Button
            onClick={() => signOut()}
            variant="outline"
            className="w-full justify-start cursor-pointer"
          >
            <LogOut className="mr-2 w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64">
        <div className="sticky top-0 z-40 md:hidden border-b border-border/50 bg-background/80 backdrop-blur-sm px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ClipForge AI
            </Link>
            <Button
              onClick={() => signOut()}
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
