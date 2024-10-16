"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    CircularProgress,
    IconButton,
    Box,
    Tooltip,
    Snackbar,
    Alert,
    Button,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { string } from "zod";

interface Game {
    id: number;
    title: string;
    shortDescription: string;
    plannedReleaseDate: string;
}

const fetchGames = async (): Promise<Game[]> => {
    const response = await axios.get("/api/admin/games");
    return response.data;
}

const AdminGamesPage = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data, isLoading, error } = useQuery<Game[]>({
        queryKey: ['admin-games'],
        queryFn: fetchGames,
        refetchOnWindowFocus: false,
    });

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({ open: false, message: "", severity: 'success'});

    const deleteMutation = useMutation({
        mutationFn: (id: number) => axios.delete(`/api/admin/games/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-games']),
            setSnackbar({
                open: true,
                message: "Game deleted successfully",
                severity: 'success'
            });
        },
        onError: () => {
            setSnackbar({
                open: true,
                message: "Failed to delete game",
                severity: 'error',
            })
        }
    })

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this game?")) {
            deleteMutation.mutate(id);
        }
    }

    const handleEdit = (id: number) => {
        router.push(`/admin/games/edit/${id}`);
    }

    if (isLoading) {
        return (
            <Box className='flex justify-center items-center h-screen'>
                <CircularProgress />
            </Box>
        )
    }

    if (error) {
        return (
            <Typography color='error'>Error loading games.</Typography>
        )
    }

    return (
        <Box className='container mx-auto my-8 px-4'>
            <Typography variant='h4' component='h1' gutterBottom>
                Manage Games
            </Typography>
            <Button
                variant="container"
                color='primary'
                onClick={() => router.push("/admin/games/create")}
                className='mb-4'
            >
                Add New Game
            </Button>
            <TableContainer component={Paper}>
                <Table aria-label="games table">
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Title</strong></TableCell>
                            <TableCell><strong>Short Description</strong></TableCell>
                            <TableCell><strong>Planned Release Date</strong></TableCell>
                            <TableCell align='right'><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.map((game) => (
                            <TableRow key={game.id}>
                                <TableCell>{game.title}</TableCell>
                                <TableCell>{game.shortDescription}</TableCell>
                                <TableCell>
                                    {new Date(game.plannedReleaseDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell align='right'>
                                    <Tooltip title='Edit'>
                                        <IconButton
                                            aria-label='edit'
                                            color='primary'
                                            onClick={() => handleEdit(game.id)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton
                                            aria-label="delete"
                                            color='secondary'
                                            onClick={() => handleDelete(game.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {data?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No games found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({...snackbar, open: false})}
                anchorOrigin={{ vertical: "bottom", horizontal: "center"}}
            >
                <Alert
                    onClose={() => setSnackbar({...snackbar, open: false})}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default AdminGamesPage;