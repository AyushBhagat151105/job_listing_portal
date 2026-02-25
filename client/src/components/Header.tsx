import { Link, useNavigate } from '@tanstack/react-router'
import { authClient } from '../lib/auth-client'
import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
  FileText,
  Plus,
} from 'lucide-react'

export default function Header() {
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const user = session?.user
  const role = (user as any)?.role as string | undefined

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate({ to: '/' })
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-teal-500/20 transition-shadow">
              <Briefcase size={16} className="text-zinc-900" />
            </div>
            <span className="text-lg font-bold text-zinc-100 tracking-tight">
              Job<span className="text-teal-400">Portal</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
              activeProps={{
                className:
                  'px-3 py-2 rounded-lg text-sm font-medium text-teal-400 bg-teal-500/10',
              }}
            >
              Browse Jobs
            </Link>

            {user && role === 'employer' && (
              <>
                <Link
                  to="/jobs/create"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
                  activeProps={{
                    className:
                      'px-3 py-2 rounded-lg text-sm font-medium text-teal-400 bg-teal-500/10',
                  }}
                >
                  Post Job
                </Link>
                <Link
                  to="/dashboard/jobs"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
                  activeProps={{
                    className:
                      'px-3 py-2 rounded-lg text-sm font-medium text-teal-400 bg-teal-500/10',
                  }}
                >
                  Manage Jobs
                </Link>
                <Link
                  to="/dashboard/employer"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
                  activeProps={{
                    className:
                      'px-3 py-2 rounded-lg text-sm font-medium text-teal-400 bg-teal-500/10',
                  }}
                >
                  Dashboard
                </Link>
              </>
            )}

            {user && role === 'job_seeker' && (
              <>
                <Link
                  to="/applications"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
                  activeProps={{
                    className:
                      'px-3 py-2 rounded-lg text-sm font-medium text-teal-400 bg-teal-500/10',
                  }}
                >
                  My Applications
                </Link>
                <Link
                  to="/dashboard/seeker"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
                  activeProps={{
                    className:
                      'px-3 py-2 rounded-lg text-sm font-medium text-teal-400 bg-teal-500/10',
                  }}
                >
                  Dashboard
                </Link>
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer">
                    <Avatar className="w-8 h-8 border border-zinc-700">
                      <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-zinc-900 text-xs font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium text-zinc-300 max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-zinc-900 border-zinc-800"
                >
                  <DropdownMenuLabel className="text-zinc-400 font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-zinc-200">
                        {user.name}
                      </p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full w-fit">
                        {role?.replace('_', ' ')}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800" />

                  <DropdownMenuItem
                    onClick={() =>
                      navigate({
                        to:
                          role === 'employer'
                            ? '/profile/employer'
                            : '/profile/seeker',
                      })
                    }
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
                  >
                    <User size={14} className="mr-2" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      navigate({
                        to:
                          role === 'employer'
                            ? '/dashboard/employer'
                            : '/dashboard/seeker',
                      })
                    }
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
                  >
                    <LayoutDashboard size={14} className="mr-2" />
                    Dashboard
                  </DropdownMenuItem>

                  {role === 'job_seeker' && (
                    <DropdownMenuItem
                      onClick={() => navigate({ to: '/applications' })}
                      className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
                    >
                      <FileText size={14} className="mr-2" />
                      My Applications
                    </DropdownMenuItem>
                  )}

                  {role === 'employer' && (
                    <DropdownMenuItem
                      onClick={() => navigate({ to: '/jobs/create' })}
                      className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
                    >
                      <Plus size={14} className="mr-2" />
                      Post a Job
                    </DropdownMenuItem>
                  )}

                  {role === 'employer' && (
                    <DropdownMenuItem
                      onClick={() => navigate({ to: '/dashboard/jobs' })}
                      className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
                    >
                      <FileText size={14} className="mr-2" />
                      Manage Jobs
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                  >
                    <LogOut size={14} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/sign-in' })}
                  className="text-zinc-400 hover:text-zinc-100 cursor-pointer"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate({ to: '/sign-up' })}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-zinc-900 font-semibold shadow-lg shadow-teal-500/20 cursor-pointer"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors cursor-pointer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-zinc-800/60 bg-zinc-950/95 backdrop-blur-xl">
            <nav className="flex flex-col p-4 gap-1">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              >
                Browse Jobs
              </Link>

              {user && role === 'employer' && (
                <>
                  <Link
                    to="/jobs/create"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  >
                    Post Job
                  </Link>
                  <Link
                    to="/dashboard/jobs"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  >
                    Manage Jobs
                  </Link>
                  <Link
                    to="/dashboard/employer"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  >
                    Dashboard
                  </Link>
                </>
              )}

              {user && role === 'job_seeker' && (
                <>
                  <Link
                    to="/applications"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  >
                    My Applications
                  </Link>
                  <Link
                    to="/dashboard/seeker"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  >
                    Dashboard
                  </Link>
                </>
              )}

              {!user && (
                <div className="flex gap-2 mt-2 px-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigate({ to: '/sign-in' })
                      setMobileOpen(false)
                    }}
                    className="text-zinc-400 hover:text-zinc-100 flex-1 cursor-pointer"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigate({ to: '/sign-up' })
                      setMobileOpen(false)
                    }}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-900 font-semibold flex-1 cursor-pointer"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
