"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Paper,
    IconButton,
    Snackbar,
    Alert,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { ContentType, UserRole } from '@prisma/client';

const availableRoles: UserRole[] = ["USER", "ADMIN", "MODERATOR", "DEVELOPER"];

interface Game {
    id: number;
    title: string;
    shortDescription: string;
    plannedReleaseDate: string;
    description: string;
    viewRole: UserRole;
    contentChunks: {
        id: number;
        type: ContentType;
        content: string;
        order: number;
    }[];
}

interface ContentChunk {
    id: number;
    type: ContentType;
    content: string;
    order: number;
}

const fetchGame = async (id: string): Promise<Game> => {
    const response = await axios.get(`/api/admin/games/${id}`)
    return response.data;
}

const updateGame = async (data: any): Promise<Game> => {
    const response = await axios.put(`/api/admin/games/${data.id}`, data);
    return response.data;
}

const uploadMedia = async (file: File): Promise<string[]> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

    return response.data.urls;
}

const AdminEditGamePage = () => {
    const router = useRouter();
    const { id } = useParams();

    const queryClient = useQueryClient();

    const { data: game, isLoading, error } = useQuery<Game>({
        queryKey: ['admin-game', id],
        queryFn: () => fetchGame(id),
        enabled: !!id
    });

    const mutation = useMutation({
        mutationFn: updateGame,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-games']);
            setSnackbar({
                open: true,
                message: "Game updated successfully",
                severity: "success",
            });
            router.push("/admin/games");
        },
        onError: () => {
            setSnackbar({
                open: true,
                message: "Failed to update game.",
                severity: 'error',
            });
        },
    });

    const [formData, setFormData] = useState<{
        id: number;
        title: string;
        shortDescription: string;
        plannedReleaseDate: string;
        description: string;
        viewRole: UserRole;
    }>({
        id: 0,
        title: "",
        shortDescription: "",
        plannedReleaseDate: "",
        description: "",
        viewRole: UserRole.USER,
    });

    const [contentChunks, setContentChunks] = useState<ContentChunk[]>([]);

    const [newChunk, setNewChunk] = useState<{
        type: ContentType;
        content: string;
    }>({
        type: ContentType.PARAGRAPH,
        content: "",
    });

    const [mediaFile, setMediaFile] = useState<File | null>(null);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({ open: false, message: "", severity: "success" });

    useEffect(() => {
        if (game) {
            setFormData({
                id: game.id,
                title: game.title,
                shortDescription: game.shortDescription,
                plannedReleaseDate: game.plannedReleaseDate.split("T")[0],
                description: game.description,
                viewRole: game.viewRole,
            });
            setContentChunks(game.contentChunks);
        }
    }, [game]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleAddChunk = async () => {
        let content = newChunk.content;

        if (newChunk.type === ContentType.IMAGE || newChunk.type === ContentType.VIDEO) {
            if (mediaFile) {
                try {
                    const urls = await uploadMedia(mediaFile);
                    content = urls[0];
                } catch (err) {
                    setSnackbar({
                        open: true,
                        message: "Failed to upload media",
                        severity: 'error',
                    });
                    return;
                }
            } else {
                setSnackbar({
                    open: true,
                    message: "Please select a media file to upload",
                    severity: 'error'
                });
                return;
            }
        }

        const newContentChunk: ContentChunk = {
            id: Date.now(),
            type: newChunk.type,
            content,
            order: contentChunks.length + 1,
        };

        setContentChunks((prev) => [...prev, newContentChunk]);
        setNewChunk({ type: ContentType.PARAGRAPH, content: ""});
        setMediaFile(null);
    };

    const handleDeleteChunk = (chunkId: number) => {
        setContentChunks((prev) => prev.filter((chunk) => chunk.id !== chunkId));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            id: formData.id,
            title: formData.title,
            shortDescription: formData.shortDescription,
            plannedReleaseDate: formData.plannedReleaseDate,
            description: formData.description,
            viewRole: formData.viewRole,
            contentChunks,
        });
    };

    if (isLoading) {
        return (
            <Box className='flex justify-center items-center h-screen'>
                <CircularProgress />
            </Box>
        )
    }

    if (error) {
        return (
            <Typography color='error'>Error loading game details.</Typography>
        )
    }

    return (
        <Box className='container mx-auto my-8 px-4'>
            <Typography variant='h4' component='h1' gutterBottom>
                Edit Game
            </Typography>
            <Paper className='p-6'>
                <form onSubmit={handleSubmit}>
                    <Box className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <TextField
                            label='Game Title'
                            name='title'
                            value={formData.title}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <TextField
                            label='Short Description'
                            name='shortDescription'
                            value={formData.shortDescription}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <TextField
                            label='Planned Release Date'
                            name='plannedReleaseDate'
                            type='date'
                            value={formData.plannedReleaseDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Description"
                            name='description'
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={4}
                            required
                        />
                        <FormControl variant='standard' fullWidth>
                            <InputLabel id={`role-select-label`}>
                            Role
                            </InputLabel>
                            <Select
                                labelId={`role-select-label`}
                                value={formData.viewRole}
                                onChange={(e) => setFormData({...formData, viewRole: e.target.value as UserRole})}
                                required
                            >
                                {availableRoles.map((role) => (
                                    <MenuItem key={role} value={role}>
                                        {role}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box className = 'mt-6'>
                        <Typography variant='h6' gutterBottom>
                            Content Chunks
                        </Typography>
                        {contentChunks.map((chunk, index) => (
                            <Box key={chunk.id} className='flex items-center mb-4'>
                                <Typography className='mr-2'>
                                    {index + 1}. {chunk.type}
                                </Typography>
                                {chunk.type === ContentType.PARAGRAPH && (
                                    <Typography className='flex-1'>{chunk.content}</Typography>
                                )}
                                {(chunk.type === ContentType.IMAGE || chunk.type === ContentType.VIDEO) && (
                                    <img
                                        src={chunk.content}
                                        alt={`Content Chunk ${index + 1}`}
                                        className='w-24 h-24 object-cover rounded mr-2'
                                    />
                                )}
                                <IconButton
                                    aria-label='delete'
                                    color='secondary'
                                    onClick={() => handleDeleteChunk(chunk.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}

                        <Box className='flex items-center mt-4'>
                            <FormControl className='mr-4' style={{ minWidth: 120 }}>
                                <InputLabel id="content-type-label">Type</InputLabel>
                                <Select
                                    labelId='content-type-label'
                                    value={newChunk.type}
                                    label='Type'
                                    onChange={(e) => setNewChunk((prev) => ({
                                        ...prev,
                                        type: e.target.value as ContentType
                                    }))}
                                >
                                    <MenuItem value={ContentType.PARAGRAPH}>Paragraph</MenuItem>
                                    <MenuItem value={ContentType.IMAGE}>Image</MenuItem>
                                    <MenuItem value={ContentType.VIDEO}>Video</MenuItem>
                                </Select>
                            </FormControl>
                            {newChunk.type === ContentType.PARAGRAPH && (
                                <TextField
                                    label="Content"
                                    value={newChunk.content}
                                    onChange={(e) =>
                                        setNewChunk((prev) => ({
                                            ...prev,
                                            content: e.target.value
                                        }))
                                    }
                                    className='flex-1 mr-4'
                                />
                            )}
                            {(newChunk.type === ContentType.IMAGE || newChunk.type === ContentType.VIDEO) && (
                                <input
                                    type="file"
                                    accept={newChunk.type === ContentType.IMAGE ? "image/*" : "video/*"}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setMediaFile(e.target.files[0]);
                                        }
                                    }}
                                    className='mr-4'
                                />
                            )}
                            <Button
                                variant='contained'
                                color='primary'
                                startIcon={<AddIcon />}
                                onClick={handleAddChunk}
                            >
                                Add Chunk
                            </Button>
                        </Box>
                    </Box>

                    <Box className='mt-6'>
                        <Button type='submit' variant='contained' color='primary'>
                            Save Changes
                        </Button>
                    </Box>
                </form>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({...snackbar, open: false})}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center'}}
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

export default AdminEditGamePage;