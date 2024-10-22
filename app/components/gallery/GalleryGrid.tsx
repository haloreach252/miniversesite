"use client";

import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import Image from 'next/image';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

interface Gallery {
    id: number;
    imageUrl: string;
    title?: string;
    description?: string;
}

const fetchGallery = async (): Promise<Gallery[]> => {
    const response = await axios.get('/api/gallery');
    return response.data;
}

const GalleryGrid = () => {
    const { data, isLoading, error } = useQuery<Gallery[]>({
        queryKey: ["gallery"],
        queryFn: fetchGallery,
    });

    if (isLoading) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <p>Loading gallery...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <p>Error loading gallery.</p>
            </div>
        );
    }

    return (
        <Box className='container mx-auto my-8 px-4'>
            <Typography variant='h3' component='h1' gutterBottom>
                Gallery
            </Typography>
            <Grid container spacing={4}>
                {data?.map((image) => (
                    <Grid item key={image.id} xs={12} sm={6} md={4} lg={3}>
                        <Box className='flex flex-col items-center'>
                            <Box className='relative w-full h-64'>
                                <Image
                                    src={image.imageUrl}
                                    alt={image.title || 'Gallery Image'}
                                    layout='fill'
                                    objectFit='cover'
                                    className='rounded shadow-md'
                                />
                            </Box>
                            {image.description && (
                                <Typography variant='body2' className='mt-2 text-center text-gray-700'>
                                    {image.description}
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                ))}
                {data?.length === 0 && (
                    <Typography variant='body1' className='text-center w-full'>
                        <br />
                        No images found in the gallery.
                    </Typography>
                )}
            </Grid>
        </Box>
    )
}

export default GalleryGrid;