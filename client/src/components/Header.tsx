import { Link, useNavigate } from '@tanstack/react-router'
import { authClient } from '../lib/auth-client'
import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
  FileText,
  Plus,
  Settings,
} from 'lucide-react'
import { ModeToggle } from './mode-toggle'

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
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl p-0.5 shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/30 transition-all duration-300">
              <img src="/favicon-96x96.png" alt="NexHire Logo" className="w-7 h-7 rounded-[10px]" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
              Nex<span className="text-teal-500">Hire</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          {/* <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              activeProps={{
                className:
                  'px-3 py-2 rounded-lg text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-500/10',
              }}
            >
              Browse Jobs
            </Link>

            {user && role === 'employer' && (
              <>
                <Link
                  to="/jobs/create"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  activeProps={{
                    className:
                      'px-3 py-2 rounded-lg text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-500/10',
                  }}
                >
                  Post Job
                </Link>
                <Link
                  to="/dashboard/jobs"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  activeProps={{
                    className:
                      'px-3 py-2 rounded-lg text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-500/10',
                  }}
                >
                  Manage Jobs
                </Link>
                <Link
                  to="/dashboard/employer"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  activeProps={{
                    className:
                      'px-3 py-2 rounded-lg text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-500/10',
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
                  className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  activeProps={{
                    className:
                      'px-3 py-2 rounded-lg text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-500/10',
                  }}
                >
                  My Applications
                </Link>
                <Link
                  to="/dashboard/seeker"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  activeProps={{
                    className:
                      'px-3 py-2 rounded-lg text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-500/10',
                  }}
                >
                  Dashboard
                </Link>
              </>
            )}
          </nav> */}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <Avatar className="w-8 h-8 border border-border">
                      <AvatarImage src={user?.image || undefined} alt={user.name || 'User'} referrerPolicy="no-referrer" />
                      <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-zinc-900 text-xs font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-card border-border"
                >
                  <DropdownMenuLabel className="text-muted-foreground font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full w-fit">
                        {role?.replace('_', ' ')}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />

                  <DropdownMenuItem
                    onClick={() =>
                      navigate({
                        to: '/settings'
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
                    className="text-muted-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
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

                  <DropdownMenuSeparator className="bg-border" />

                  <DropdownMenuItem
                    onClick={() => navigate({ to: '/settings' })}
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
                  >
                    <Settings size={14} className="mr-2" />
                    Settings
                  </DropdownMenuItem>

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
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
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

            <ModeToggle />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
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
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    Post Job
                  </Link>
                  <Link
                    to="/dashboard/jobs"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    Manage Jobs
                  </Link>
                  <Link
                    to="/dashboard/employer"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
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
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    My Applications
                  </Link>
                  <Link
                    to="/dashboard/seeker"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
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
                    className="text-muted-foreground hover:text-foreground flex-1 cursor-pointer"
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
