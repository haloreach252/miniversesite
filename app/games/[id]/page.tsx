// app/games/[id]/page.tsx

"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import ContentChunkRenderer from "@/app/components/ContentChunkRenderer";
import { ContentChunk } from "@prisma/client";

enum ContentType {
  PARAGRAPH = "PARAGRAPH",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

interface GameDetail {
  id: number;
  title: string;
  shortDescription: string;
  plannedReleaseDate: string;
  description: string;
  contentChunks: ContentChunk[];
}

const fetchGameDetail = async (id: string): Promise<GameDetail> => {
  const response = await axios.get(`/api/games/${id}`);
  return response.data;
};

const GameDetailPage = () => {
  const router = useRouter();
  const { id } = useParams();

  const { data, isLoading, error } = useQuery<GameDetail>({
    queryKey: ["public-game-detail", id],
    queryFn: () => fetchGameDetail(id),
    enabled: !!id,
  });

  if (isLoading)
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );

  if (error || !data)
    return (
      <Typography color="error" className="text-center mt-8">
        Error loading game details.
      </Typography>
    );

  return (
    <Box className="container mx-auto my-8 px-4">
      <Typography variant="h3" component="h1" gutterBottom>
        {data.title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Planned Release: {new Date(data.plannedReleaseDate).toLocaleDateString()}
      </Typography>
      <Typography variant="body1" paragraph>
        {data.description}
      </Typography>
      <Divider className="my-4" />

      {/* Render Content Chunks */}
      {data.contentChunks.sort((a, b) => a.order - b.order).map((chunk) => (
        <ContentChunkRenderer key={chunk.id} chunk={chunk} />
      ))}
    </Box>
  );
};

export default GameDetailPage;
