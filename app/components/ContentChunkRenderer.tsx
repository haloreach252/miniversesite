// components/ContentChunkRenderer.tsx

import React from "react";
import { ContentChunk } from "@prisma/client";
import { Typography, Box } from "@mui/material";
import { CldImage, CldVideoPlayer } from "next-cloudinary";

enum ContentType {
  PARAGRAPH = "PARAGRAPH",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
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
        <Box sx={{ mb: 2 }}>
          <CldImage
            src={chunk.content}
            alt="Game Content"
            width={chunk.width || undefined}
            height={chunk.height || undefined}
            layout='responsive'
            objectFit='cover'
          />
          {chunk.width && chunk.height && (
            <Typography variant='caption'>
              Dimensions: {chunk.width}px x {chunk.height}px
            </Typography>
          )}
        </Box>
      )
    case ContentType.VIDEO:
      return (
        <Box sx={{ mb: 2 }}>
          <CldVideoPlayer
            src={chunk.content}
            controls
            width={chunk.width || undefined}
            height={chunk.height || undefined}
            /*style={{ width: chunk.width ? `${chunk.width}px` : '100%', height: chunk.height ? `${chunk.height}px` : 'auto'}}*/
          />
        </Box>
      );
    default:
      return null;
  }
};

export default ContentChunkRenderer;
