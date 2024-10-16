// components/ContentChunkRenderer.tsx

import React, { Component } from "react";
import { Typography, Box } from "@mui/material";

enum ContentType {
  PARAGRAPH = "PARAGRAPH",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

interface ContentChunk {
  id: number;
  type: ContentType;
  content: string;
  order: number;
  width?: number;
  height?: number;
}

interface ContentChunkRendererProps {
  chunk: ContentChunk;
}

const ContentChunkRenderer: React.FC<ContentChunkRendererProps> = ({ chunk }) => {
  switch (chunk.type) {
    case ContentType.PARAGRAPH:
      return (
        <Typography variant="body1">
          {chunk.content}
        </Typography>
      );
    case ContentType.IMAGE:
      return (
        <Box
          component="img"
          src={chunk.content}
          alt={`Game Image ${chunk.id}`}
          sx={{ 
            width: chunk.width || '100%',
            height: chunk.height || 'auto',
            objectFit: 'cover',
          }}
          className="rounded mb-4"
        />
      );
    case ContentType.VIDEO:
      return (
        <Box className="w-full mb-4">
          <video controls className="w-full rounded" width={chunk.width || '100%'} height={chunk.height || 'auto'}>
            <source src={chunk.content} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box> 
      );
    default:
      return null;
  }
};

export default ContentChunkRenderer;
