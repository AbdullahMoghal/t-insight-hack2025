'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'
import { cn } from '@/lib/utils'

interface NavbarProps {
  userEmail?: string
}

export function Navbar({ userEmail }: NavbarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/pm/opportunities', label: 'PM Workbench' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/dashboard/geo', label: 'GeoMap' },
  ]

  return (
    <header className="sticky top-0 z-[100] border-b border-white/10">
      {/* Glass morphism background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#E8258E] via-[#E20074] to-[#C4006D]" />
      <div className="absolute inset-0 backdrop-blur-xl bg-white/5" />

      {/* Content */}
      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 group transition-all duration-300 hover:scale-[1.02]"
          >
            <Image
              src="/navbar-logo.png"
              alt="T-Insight Logo"
              width={140}
              height={65}
              className="relative transition-all duration-300 group-hover:brightness-110"
              priority
            />
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                    "hover:bg-white/15 active:scale-95",
                    isActive
                      ? "text-white bg-white/20 shadow-lg shadow-black/10"
                      : "text-white/90 hover:text-white"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-white rounded-full" />
                  )}
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            {/* User Email */}
            {userEmail && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />
                <span className="text-sm text-white/95 font-medium">
                  {userEmail}
                </span>
              </div>
            )}

            {/* Sign Out Button */}
            <form action={signOut}>
              <Button
                type="submit"
                size="sm"
                className={cn(
                  "relative overflow-hidden",
                  "bg-white/15 hover:bg-white/25 backdrop-blur-sm",
                  "text-white border border-white/30 hover:border-white/50",
                  "shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20",
                  "transition-all duration-300 active:scale-95",
                  "font-medium"
                )}
              >
                {/* Shine effect on hover */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative">Sign out</span>
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom shine line */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </header>
  )
}
