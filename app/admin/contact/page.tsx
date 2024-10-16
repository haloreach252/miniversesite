"use client"

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Typography,
    CircularProgress,
    Box,
} from '@mui/material'
import { ContactSubmission, UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const fetchContactSubmissions = async (): Promise<ContactSubmission[]> => {
    const response = await axios.get("/api/admin/contact");
    return response.data;
}

const AdminContactSubmissionsPage = () => {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push("/");
        },
    });
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;
        if (!session || (session.user as any).role !== UserRole.ADMIN) {
            router.push("/");
        }
    }, [session, status, router]);

    const { data, isLoading, error } = useQuery<ContactSubmission[]>({
        queryKey: ['admin-contact'],
        queryFn: fetchContactSubmissions,
        refetchInterval: 60 * 1000, // Optional: Refresh every 60 seconds
    });

    if (isLoading) {
        return (
            <Box className='flex justify-center items-center h-screen'>
                <CircularProgress />
            </Box>
        )
    }

    if (error) {
        return (
            <Box className='flex justify-center items-center h-screen'>
                <Typography color='error'>Error loading contact submissions.</Typography>
            </Box>
        )
    }

    return (
        <Box className='container mx-auto my-8 px-4'>
            <Typography variant="h4" component="h1" gutterBottom>
                Contact Submissions
            </Typography>
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Subject</strong></TableCell>
                            <TableCell><strong>Message</strong></TableCell>
                            <TableCell><strong>Submitted At</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.map((submission) => (
                            <TableRow key={submission.id}>
                                <TableCell>{submission.id}</TableCell>
                                <TableCell>{submission.name}</TableCell>
                                <TableCell>{submission.email}</TableCell>
                                <TableCell>{submission.subject}</TableCell>
                                <TableCell>{submission.message}</TableCell>
                                <TableCell>
                                    {new Date(submission.createdAt).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {data?.length === 0 && (
                    <Box className='p-4'>
                        <Typography>No contact submissions found.</Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    )
}

export default AdminContactSubmissionsPage;