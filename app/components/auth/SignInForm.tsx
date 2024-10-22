"use client"

import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from "axios"
import { useState } from "react"
import { Alert, Button, TextField, Box, Typography } from '@mui/material';
import { useRouter } from "next/navigation"

const schema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

type FormData = z.infer<typeof schema>

const SignInForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    })

    const [serverError, setServerError] = useState<string | null>(null);
    const router = useRouter();

    const onSubmit = async (data: FormData) => {
        const res = await signIn("credentials", {
            redirect: false,
            email: data.email,
            password: data.password
        });

        if (res?.error) {
            setServerError(res.error);
        } else {
            reset();
            setServerError(null);
            router.push('/');
        }
    }

    return (
        <Box className='container mx-auto my-8 max-w-lg px-4'>
            <Typography variant='h4' component='h1' gutterBottom>
                Sign In
            </Typography>
            {serverError && (
                <Alert severity="error" className='mb-4' role='alert'>
                    {serverError}
                </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
                <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    id="email"
                    name="email"
                    aria-invalid={!!errors.email}
                    aria-describedby="email-error"
                    required
                />
                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    id="password"
                    name="password"
                    aria-invalid={!!errors.password}
                    aria-describedby="password-error"
                    required
                />
                <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    disabled={isSubmitting}
                    fullWidth
                    aria-label="Sign Up"
                >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
            </form>
        </Box>
    )
}

export default SignInForm;