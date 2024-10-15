"use client"

import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from 'axios';
import { useState } from "react"
import { Alert, Button, TextField, Avatar } from '@mui/material'
import { useRouter } from "next/navigation"

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof schema>

const ProfilePage = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isSubmitSuccessful },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: session?.user.name || "",
            email: session?.user.email || "",
        },
    });

    const [serverError, setServerError] = useState<string | null>(null);

    const onSubmit = async (data: FormData) => {
        try {
            await axios.put("/api/auth/profile", data);
            setServerError(null);
            alert("Profile updated successfully");
            router.refresh();
        } catch (error: any) {
            setServerError(error.response?.data?.error || "Failed to update profile");
        }
    };

    const handleDeleteAccount = async () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone")) {
            try {
                await axios.delete("/api/auth/profile");
                router.push('/');
            } catch (error) {
                alert("Failed to delete account");
            }
        }
    }

    if (!session) {
        return <p>Loading...</p>
    }

    return (
        <section className="container mx-auto my-8 max-w-lg">
            <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
            {serverError && (
                <Alert severity="error" className="mb-4">
                    {serverError}
                </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex items-center space-x-4">
                    <Avatar src={session.user.image || "/default-avatar.png"} alt={session.user.name || "User"} />
                    {/* Add functionality to update profile icon */}
                    <Button variant="outlined">Change Profile Icon</Button>
                </div>
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
                disabled
                />
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Profile"}
                </Button>
            </form>
            <div className="mt-8">
                <h1 className="font-semibold text-xl">Role:</h1>
                <p>{session.user.role}</p>
            </div>
            <div className="mt-8">
                <Button variant="outlined" color="secondary" onClick={handleDeleteAccount}>
                Delete Account
                </Button>
            </div>
        </section>
    )
}

export default ProfilePage;