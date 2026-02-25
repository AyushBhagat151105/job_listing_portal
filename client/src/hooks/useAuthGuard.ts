import { useEffect } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { authClient } from '../lib/auth-client'
import { api } from '../lib/api'

/**
 * Hook that redirects to /sign-in if the user is not authenticated.
 * Optionally restricts to a specific role.
 * Optionally enforces that the user has completed their profile.
 * Returns { user, role, profile, isPending } for convenience.
 */
export function useAuthGuard(
    requiredRole?: 'job_seeker' | 'employer',
    options?: { requireProfile?: boolean }
) {
    const { data: session, isPending: authPending } = authClient.useSession()
    const navigate = useNavigate()
    const location = useLocation()

    const user = session?.user
    const role = (user as any)?.role as string | undefined

    const { data: profile, isPending: profilePending } = useQuery({
        queryKey: ['profile', role],
        queryFn: async () => {
            if (!user || !role) return null;
            try {
                const endpoint = role === 'employer' ? '/api/v1/profile/employer' : '/api/v1/profile/job-seeker';
                const res = await api.get(endpoint)
                return res.data?.data || null
            } catch {
                return null
            }
        },
        enabled: !!options?.requireProfile && !!user && !!role
    })

    const isPending = authPending || (!!options?.requireProfile && !!user && !!role && profilePending)

    useEffect(() => {
        if (authPending) return

        if (!user) {
            navigate({ to: '/sign-in' })
            return
        }

        if (requiredRole && role !== requiredRole) {
            navigate({ to: '/' })
            return
        }

        if (options?.requireProfile && !profilePending && role) {
            if (!profile) {
                // Determine redirect path
                const targetPath = role === 'employer' ? '/profile/employer' : '/profile/seeker'
                // Prevent infinite redirect if already on the profile page
                if (location.pathname !== targetPath) {
                    navigate({ to: targetPath as any })
                }
            }
        }
    }, [authPending, profilePending, user, role, requiredRole, options?.requireProfile, profile, navigate, location.pathname])

    return { user, role, profile, isPending, isAuthenticated: !!user }
}
