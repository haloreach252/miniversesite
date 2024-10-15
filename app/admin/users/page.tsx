"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios';
import {
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableRow, 
    Button, 
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Snackbar,
    Alert,
    TextField,
    Box} from '@mui/material'
import { useState, useEffect } from 'react';
import { UserRole, User } from '@prisma/client'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const availableRoles: UserRole[] = ["USER", "ADMIN", "MODERATOR", "DEVELOPER"];

const fetchUsers = async(): Promise<User[]> => {
    const response = await axios.get("/api/admin/users");
    return response.data;
}

const updateUserRole = async ({
    userId,
    newRole,
}: {
    userId: number;
    newRole: UserRole;
}) => {
    const response = await axios.put("/api/admin/users", { userId, newRole });
    return response.data;
};

const deleteUser = async(id: number) => {
    await axios.delete(`/api/admin/users/${id}`);
}

const AdminUsersPage = () => {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            // Redirect to login if not authenticated
            router.push('/login');
        },
        // Refresh the session every 30 seconds to ensure it reflects role changes
        // Adjust the interval as needed
        // Note: This uses setInterval under the hood
        // If using react-query, you might consider react-query's refetchInterval
    });
    const router = useRouter();
    const queryClient = useQueryClient();

    // Protect the admin page
    useEffect(() => {
        if (status === 'loading') return; // Do nothing while loading
        if (!session || (session.user as any).role !== UserRole.ADMIN) {
            router.push('/'); // Redirect non-admin users to home
        }
    }, [session, status, router]);

    const { data: users, isLoading, error } = useQuery<User[]>({
        queryKey: ["admin-users"],
        queryFn: fetchUsers,
        // Refetch the users list every 60 seconds to get the latest data
        // Adjust the interval based on your needs
        refetchInterval: 60 * 1000, // 60 seconds
    });

    const updateMutation = useMutation({
        mutationFn: updateUserRole,
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-users"]);
            setSnackbar({
                open: true,
                message: "User role updated successfully",
                severity: "success"
            });
        },
        onError: () => {
            setSnackbar({
                open: true,
                message: "Failed to update user role.",
                severity: 'error',
            });
        },
    });

    const mutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-users"]);
            setSnackbar({
                open: true,
                message: "User deleted successfully",
                severity: "success"
            });
        },
        onError: () => {
            setSnackbar({
                open: true,
                message: "Failed to delete user",
                severity: 'error',
            });
        },
    });

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success"
    });

    const handleRoleChange = (userId: number, newRole: UserRole) => {
        updateMutation.mutate({ userId, newRole });
    }

    const handleDelete = (userId: number) => {
        if (confirm("Are you sure you want to delete this user?")) {
            mutation.mutate(userId);
        }
    }

    if (status === 'loading') {
        return (
            <Box className="flex justify-center items-center h-full">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <p className='text-red-500'>Error loading users. Please try again.</p>
        )
    }

    return (
        <div>
            <h1 className='text-3xl font-bold mb-4'>User Management</h1>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>Role</strong></TableCell>
                        <TableCell><strong>Joined</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users?.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.name || "N/A"}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <FormControl variant='standard' fullWidth>
                                    <InputLabel id={`role-select-label-${user.id}`}>
                                    Role
                                    </InputLabel>
                                    <Select
                                        labelId={`role-select-label-${user.id}`}
                                        id={`role-select-${user.id}`}
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                        disabled={updateMutation.isPending}
                                    >
                                        {availableRoles.map((role) => (
                                            <MenuItem key={role} value={role}>
                                                {role}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </TableCell>
                            <TableCell>
                                {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant='outlined'
                                    color='secondary'
                                    onClick={() => handleDelete(user.id)}
                                    disabled={mutation.isPending}
                                >
                                    {mutation.isPending ? "Deleting..." : "Delete"}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() =>
                    setSnackbar({...snackbar, open: false})
                }
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center'}}
            >
                <Alert
                    onClose={() =>
                        setSnackbar({...snackbar, open: false})
                    }
                    severity={snackbar.severity}
                    sx={{ width: "100%"}}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default AdminUsersPage;