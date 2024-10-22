"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useState } from 'react';
import { Alert, Button, TextField, Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

type FormData = z.infer<typeof schema>;

const SignUpForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isSubmitSuccessful },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const [serverError, setServerError] = useState<string | null>(null);
    const router = useRouter();

    const onSubmit = async (data: FormData) => {
        try {
            await axios.post('/api/auth/signup', data);
            reset();
            setServerError(null);
            router.push('/auth/sign-in');
        } catch (error: any) {
            setServerError(error.response?.data?.error || "Something went wrong");
        }
    }

    return (
        <Box className='container mx-auto my-8 max-w-lg px-4'>
            <Typography variant='h4' component='h1' gutterBottom>
                Sign Up
            </Typography>
            {serverError && (
                <Alert severity='error' className='mb-4'>
                    {serverError}
                </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <TextField
                    label='Name'
                    fullWidth
                    {...register("name")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />
                <TextField
                    label='Email'
                    type='email'
                    fullWidth
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                />
                <TextField
                    label='Password'
                    type='password'
                    fullWidth
                    {...register("password")}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                />
                <Button type='submit' variant='contained' color='primary' disabled={isSubmitting} fullWidth>
                    {isSubmitting ? "Creating Account..." : "Sign Up"}
                </Button>
            </form>
        </Box>
    )
}

export default SignUpForm;