// app/admin/games/create/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

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

const uploadMedia = async (file: File): Promise<string[]> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.urls;
};

const AdminCreateGamePage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => axios.post("/api/admin/games", data),
      onSuccess: () => {
        queryClient.invalidateQueries(["admin-games"]);
        setSnackbar({
          open: true,
          message: "Game created successfully.",
          severity: "success",
        });
        router.push("/admin/games");
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: "Failed to create game.",
          severity: "error",
        });
      },
    }
  );

  const [formData, setFormData] = useState<{
    title: string;
    shortDescription: string;
    plannedReleaseDate: string;
    description: string;
  }>({
    title: "",
    shortDescription: "",
    plannedReleaseDate: "",
    description: "",
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
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

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
          content = urls[0]; // Assuming single file upload
        } catch (err) {
          setSnackbar({
            open: true,
            message: "Failed to upload media.",
            severity: "error",
          });
          return;
        }
      } else {
        setSnackbar({
          open: true,
          message: "Please select a media file to upload.",
          severity: "error",
        });
        return;
      }
    }

    const newContentChunk: ContentChunk = {
      id: Date.now(), // Temporary ID
      type: newChunk.type,
      content,
      order: contentChunks.length + 1,
      width: 200,
      height: 200,
    };

    setContentChunks((prev) => [...prev, newContentChunk]);
    setNewChunk({ type: ContentType.PARAGRAPH, content: "" });
    setMediaFile(null);
  };

  const handleDeleteChunk = (chunkId: number) => {
    setContentChunks((prev) => prev.filter((chunk) => chunk.id !== chunkId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      title: formData.title,
      shortDescription: formData.shortDescription,
      plannedReleaseDate: formData.plannedReleaseDate,
      description: formData.description,
      contentChunks,
    });
  };

  return (
    <Box className="container mx-auto my-8 px-4">
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Game
      </Typography>
      <Paper className="p-6">
        <form onSubmit={handleSubmit}>
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Game Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Short Description"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Planned Release Date"
              name="plannedReleaseDate"
              type="date"
              value={formData.plannedReleaseDate}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              required
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              required
            />
          </Box>

          {/* Content Chunks */}
          <Box className="mt-6">
            <Typography variant="h6" gutterBottom>
              Content Chunks
            </Typography>
            {contentChunks.map((chunk, index) => (
              <Box key={chunk.id} className="flex items-center mb-4">
                <Typography className="mr-2">
                  {index + 1}. {chunk.type}
                </Typography>
                {chunk.type === ContentType.PARAGRAPH && (
                  <Typography className="flex-1">{chunk.content}</Typography>
                )}
                {(chunk.type === ContentType.IMAGE || chunk.type === ContentType.VIDEO) && (
                  <img
                    src={chunk.content}
                    alt={`Content Chunk ${index + 1}`}
                    className="w-24 h-24 object-cover rounded mr-2"
                  />
                )}
                <IconButton
                  aria-label="delete"
                  color="secondary"
                  onClick={() => handleDeleteChunk(chunk.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            {/* Add New Chunk */}
            <Box className="flex items-center mt-4">
              <FormControl className="mr-4" style={{ minWidth: 120 }}>
                <InputLabel id="content-type-label">Type</InputLabel>
                <Select
                  labelId="content-type-label"
                  value={newChunk.type}
                  label="Type"
                  onChange={(e) =>
                    setNewChunk((prev) => ({
                      ...prev,
                      type: e.target.value as ContentType,
                    }))
                  }
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
                      content: e.target.value,
                    }))
                  }
                  className="flex-1 mr-4"
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
                  className="mr-4"
                />
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddChunk}
              >
                Add Chunk
              </Button>
            </Box>
          </Box>

          {/* Submit Button */}
          <Box className="mt-6">
            <Button type="submit" variant="contained" color="primary">
              Create Game
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminCreateGamePage;
