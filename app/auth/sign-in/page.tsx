"use client"

import { useForm } from "react-hook-form"
import { signIn } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Alert, Button, TextField } from '@mui/material'
import { useRouter } from "next/navigation"

const schema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>

const SignInPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const [serverError, setServerError] = useState<string | null>(null);
    const router = useRouter();

    const onSubmit = async (data: FormData) => {
        const res = await signIn("credentials", {
            redirect: false,
            email: data.email,
            password: data.password,
        });

        if (res?.error) {
            setServerError(res.error);
        } else {
            reset();
            setServerError(null);
            router.push('/');
        }
    };

    return (
        <section className="container mx-auto my-8 max-w-lg">
            <h1 className="text-3xl font-bold mb-4">Sign In</h1>
            {serverError && (
                <Alert severity="error" className="mb-4">
                    {serverError}
                </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                />
                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                />
                <Button type='submit' variant='contained' color='primary' disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
            </form>
        </section>
    )
}

export default SignInPage;