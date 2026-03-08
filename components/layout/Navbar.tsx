'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useState } from 'react'
import { Menu, X, Search } from 'lucide-react'
import SearchBar from './SearchBar'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/vision', label: 'La Vision' },
  { href: '/sessions', label: 'Sessions' },
  { href: '/membres', label: 'Membres' },
  { href: '/profil', label: 'Profil' },
  { href: '/admin', label: 'Admin' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-heading text-xl font-bold text-primary tracking-wide">
            Impact Disciple
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-muted hover:text-foreground transition-colors"
            >
              <Search size={18} />
            </button>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-primary text-background px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
                  Connexion
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <button
              className="md:hidden p-2 text-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="pb-4">
            <SearchBar onClose={() => setSearchOpen(false)} />
          </div>
        )}

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? 'text-primary bg-card-hover'
                    : 'text-muted hover:text-foreground hover:bg-card-hover'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
