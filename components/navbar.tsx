'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ClipForge AI
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition">
              Features
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition">
              Pricing
            </Link>
            <Link href="#docs" className="text-muted-foreground hover:text-foreground transition">
              Docs
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/dashboard')}
                  className="cursor-pointer"
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => signOut()}
                  className="cursor-pointer"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/auth/login')}
                  className="cursor-pointer"
                >
                  Sign In
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 cursor-pointer"
                  onClick={() => router.push('/auth/register')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-4 border-t border-border/50"
          >
            <Link href="#features" className="block py-2 text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="block py-2 text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <div className="flex gap-4 mt-4">
              {session ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                    className="cursor-pointer flex-1"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => signOut()}
                    className="cursor-pointer flex-1"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/auth/login')}
                    className="cursor-pointer flex-1"
                  >
                    Sign In
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 cursor-pointer flex-1"
                    onClick={() => router.push('/auth/register')}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}
