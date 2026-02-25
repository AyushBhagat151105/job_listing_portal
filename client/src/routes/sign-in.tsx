import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useState } from 'react'
import { authClient } from '../lib/auth-client'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '#/components/ui/card'
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/sign-in')({
    component: SignInPage,
})

const signInSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
})

function SignInPage() {
    const navigate = useNavigate()
    const [serverError, setServerError] = useState('')

    const form = useForm({
        defaultValues: { email: '', password: '' },
        validators: {
            onSubmit: signInSchema,
        },
        onSubmit: async ({ value }) => {
            setServerError('')
            try {
                const result = await authClient.signIn.email({
                    email: value.email,
                    password: value.password,
                })
                if (result.error) {
                    setServerError(result.error.message || 'Sign in failed')
                } else {
                    navigate({ to: '/' })
                }
            } catch {
                setServerError('An unexpected error occurred')
            }
        },
    })

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-background" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />

            <Card className="w-full max-w-md border-border bg-card/80 backdrop-blur-xl shadow-2xl relative z-10">
                <CardHeader className="space-y-3 pb-6">
                    <div className="flex items-center gap-2 text-teal-400 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
                            <LogIn size={16} className="text-primary-foreground" />
                        </div>
                        <span className="text-sm font-semibold tracking-wider uppercase">
                            NexHire
                        </span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Welcome back to NexHire
                    </CardDescription>
                </CardHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                >
                    <CardContent className="space-y-4">
                        {serverError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {serverError}
                            </div>
                        )}

                        <form.Field name="email">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name} className="text-foreground">
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <Mail
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        />
                                        <Input
                                            id={field.name}
                                            type="email"
                                            placeholder="you@example.com"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-teal-500 focus:ring-teal-500/20"
                                        />
                                    </div>
                                    {field.state.meta.errors.length > 0 && (
                                        <p className="text-xs text-red-400">
                                            {field.state.meta.errors.join(', ')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="password">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name} className="text-foreground">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        />
                                        <Input
                                            id={field.name}
                                            type="password"
                                            placeholder="••••••••"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-teal-500 focus:ring-teal-500/20"
                                        />
                                    </div>
                                    {field.state.meta.errors.length > 0 && (
                                        <p className="text-xs text-red-400">
                                            {field.state.meta.errors.join(', ')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </form.Field>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 pt-2">
                        <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit]}>
                            {([isSubmitting, canSubmit]) => (
                                <Button
                                    type="submit"
                                    disabled={!canSubmit || isSubmitting}
                                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-primary-foreground font-semibold shadow-lg shadow-teal-500/20 cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={18} className="animate-spin mr-2" />
                                    ) : (
                                        <LogIn size={18} className="mr-2" />
                                    )}
                                    Sign In
                                </Button>
                            )}
                        </form.Subscribe>

                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card/80 px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                                await authClient.signIn.social({ provider: 'google', callbackURL: window.location.origin })
                            }}
                            className="w-full border-input bg-background/50 text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </Button>

                        <p className="text-sm text-muted-foreground text-center">
                            Don&apos;t have an account?{' '}
                            <Link
                                to="/sign-up"
                                className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
                            >
                                Create one
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
