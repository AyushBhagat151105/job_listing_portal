import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { authClient } from '../lib/auth-client'

/**
 * Hook that redirects to /sign-in if the user is not authenticated.
 * Optionally restricts to a specific role.
 * Returns { user, role, isPending } for convenience.
 */
export function useAuthGuard(requiredRole?: 'job_seeker' | 'employer') {
    const { data: session, isPending } = authClient.useSession()
    const navigate = useNavigate()

    const user = session?.user
    const role = (user as any)?.role as string | undefined

    useEffect(() => {
        if (isPending) return

        if (!user) {
            navigate({ to: '/sign-in' })
            return
        }

        if (requiredRole && role !== requiredRole) {
            navigate({ to: '/' })
        }
    }, [isPending, user, role, requiredRole, navigate])

    return { user, role, isPending, isAuthenticated: !!user }
}
