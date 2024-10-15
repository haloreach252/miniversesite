"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useState } from 'react';
import { Alert, Button, TextField } from '@mui/material';

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(1, "Subject is required"),
    message: z.string().min(1, "Message is required")
});

type FormData = z.infer<typeof schema>;

const ContactPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isSubmitSuccessful },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const [serverError, setServerError] = useState<string | null>(null);

    const onSubmit = async (data: FormData) => {
        try {
            await axios.post("/api/contact", data);
            reset();
            setServerError(null);
        } catch (error: any) {
            setServerError(error.response?.data?.error || "Something went wrong");
        }
    };

    return (
        <section className='container mx-auto my-8 max-w-lg'>
            <h1 className='text-3xl font-bold mb-4'>Contact Us</h1>
            {isSubmitSuccessful && (
                <Alert severity='success' className='mb-4'>
                    Your message has been sent successfully!
                </Alert>
            )}
            {serverError && (
                <Alert severity='error' className='mb-4'>
                    {serverError}
                </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <TextField
                    label="Name"
                    fullWidth
                    {...register("name")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />
                <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                />
                <TextField
                    label="Subject"
                    fullWidth
                    {...register("subject")}
                    error={!!errors.subject}
                    helperText={errors.subject?.message}
                />
                <TextField
                    label="Message"
                    multiline
                    rows={4}
                    fullWidth
                    {...register("message")}
                    error={!!errors.message}
                    helperText={errors.message?.message}
                />
                <Button type="submit" variant='contained' color="primary" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
            </form>
        </section>
    )
}

export default ContactPage;