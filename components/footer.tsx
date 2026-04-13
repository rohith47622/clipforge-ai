'use client'

import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-4">ClipForge AI</h3>
            <p className="text-sm text-muted-foreground">
              Transform long videos into viral short-form clips with AI.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground transition">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-foreground transition">Pricing</Link></li>
              <li><Link href="/auth/register" className="hover:text-foreground transition">Get Started</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#about" className="hover:text-foreground transition">About</Link></li>
              <li><Link href="#blog" className="hover:text-foreground transition">Blog</Link></li>
              <li><Link href="#careers" className="hover:text-foreground transition">Careers</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#privacy" className="hover:text-foreground transition">Privacy</Link></li>
              <li><Link href="#terms" className="hover:text-foreground transition">Terms</Link></li>
              <li><Link href="#contact" className="hover:text-foreground transition">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} ClipForge AI. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#twitter" className="text-muted-foreground hover:text-foreground transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#github" className="text-muted-foreground hover:text-foreground transition">
                <Github className="w-5 h-5" />
              </a>
              <a href="#linkedin" className="text-muted-foreground hover:text-foreground transition">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#email" className="text-muted-foreground hover:text-foreground transition">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
