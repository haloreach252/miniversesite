"use client";

import React from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import GameCard from './GameCard';
import axios from 'axios';
import { useQuery } from "@tanstack/react-query";

interface Game {
    id: number;
    title: string;
    shortDescription: string;
    plannedReleaseDate: string;
}

const fetchGames = async (): Promise<Game[]> => {
  const response = await axios.get("/api/games");
  return response.data;
};

const GameGrid = () => {
    const router = useRouter();
    const { data, isLoading, error } = useQuery<Game[]>({
        queryKey: ['public-games'],
        queryFn: fetchGames,
    });

    const handleClick = (id: number) => {
        router.push(`/games/${id}`);
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
            <Typography color='error' className='text-center mt-8'>
                Error loading games.
            </Typography>
        )
    }

    return (
        <Box className='container mx-auto my-8 px-4'>
            <Typography variant='h4' component='h1' gutterBottom className='text-center'>
                Our Games
            </Typography>
            <Grid container spacing={4}>
                {data?.map((game) => (
                    <Grid item key={game.id} xs={12} sm={6} md={4} lg={3}>
                        <GameCard game={game} onClick={handleClick} />
                    </Grid>
                ))}
                {data?.length === 0 && (
                    <Typography variant='body1' className='text-center w-full'>
                        <br />
                        No games available at the moment.
                    </Typography>
                )}
            </Grid>
        </Box>
    )
}

export default GameGrid;