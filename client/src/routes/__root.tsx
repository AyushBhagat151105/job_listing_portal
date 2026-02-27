import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import Header from '../components/Header'

import TanStackQueryProvider from '../integrations/tanstack-query/root-provider'
import { ThemeProvider } from '../components/theme-provider'
import { Toaster } from '#/components/ui/sonner'

import { useEffect } from 'react'
import { authClient } from '../lib/auth-client'
import { api } from '../lib/api'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'NexHire | The Supreme Gateway to Your Next Career Move',
      },
      {
        name: 'description',
        content:
          'NexHire connects ambitious job seekers with top-tier employers. Browse thousands of jobs, apply instantly, and track your applications.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap',
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '96x96',
        href: '/favicon-96x96.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  const { data: session } = authClient.useSession()

  useEffect(() => {
    async function checkAndApplyRole() {
      if (!session?.user) return

      const pendingRole = localStorage.getItem('signUpRole')
      if (pendingRole && (pendingRole === 'job_seeker' || pendingRole === 'employer')) {
        try {
          // Update role on backend
          await api.patch('/api/v1/profile/role', { role: pendingRole })
          // Clear it so it doesn't fire again
          localStorage.removeItem('signUpRole')
          // Refresh session to reflect new role globally
          await authClient.getSession({
            fetchOptions: {
              // Force better auth to refresh
              headers: {
                'Cache-Control': 'no-cache'
              }
            }
          })
          window.location.reload() // Force reload to apply layout changes
        } catch (error) {
          console.error("Failed to apply pending role:", error)
        }
      }
    }

    checkAndApplyRole()
  }, [session])

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <Outlet />
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <TanStackQueryProvider>
            {children}
          </TanStackQueryProvider>
          <Toaster />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
