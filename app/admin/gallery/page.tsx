"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { useState, useEffect } from "react";
import { Gallery, UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const fetchGalleries = async(): Promise<Gallery[]> => {
  const response = await axios.get("/api/admin/gallery");
  return response.data;
}

const createGallery = async ({
  title,
  description,
  imageUrl,
}: {
  title: string;
  description?: string;
  imageUrl: string;
}) => {
  const response = await axios.post("/api/admin/gallery", {
    title,
    description,
    imageUrl,
  });
  return response.data;
};

const updateGallery = async ({
  id,
  title,
  description,
  imageUrl
}: {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
}) => {
  const response = await axios.put("/api/admin/gallery", {
    id,
    title,
    description,
    imageUrl,
  });
  return response.data;
};

const deleteGallery = async (id: number) => {
  await axios.delete("/api/admin/gallery", { data: { id }});
};

const AdminGalleryPage = () => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // Redirect to sign in if not authenticated
      router.push("/auth/sign-in");
    },
  });
  const router = useRouter();
  const queryClient = useQueryClient();

  // Protect the admin page
  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!session || (session.user as any).role !== UserRole.ADMIN) {
      router.push("/"); // redirect non-admin users to home
    }
  }, [session, status, router]);

  const { data: galleries, isLoading, error } = useQuery<Gallery[]>({
    queryKey: ["admin-gallery"],
    queryFn: fetchGalleries,
    refetchInterval: 60 * 1000, // 60 seconds
  });

  const createMutation = useMutation({
    mutationFn: createGallery,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gallery"]);
      setSnackbar({
        open: true,
        message: "Gallery item created successfully",
        severity: "success",
      });
      handleCloseCreateDialog();
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: "Failed to create gallery item.",
        severity: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateGallery,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gallery"]);
      setSnackbar({
        open: true,
        message: "Gallery item updated successfully",
        severity: "success",
      });
      handleCloseEditDialog();
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: "Failed to update gallery item",
        severity: "error"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGallery,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gallery"]);
      setSnackbar({
        open: true,
        message: "Gallery item deleted successfully",
        severity: "success",
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: "Failed to delete gallery item",
        severity: "error",
      });
    }
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

  // Create dialog state
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  // Edit dialog state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  }

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setNewTitle("");
    setNewDescription("");
    setNewImageUrl("");
  }

  const handleOpenEditDialog = (gallery: Gallery) => {
    setEditId(gallery.id);
    setEditTitle(gallery.title);
    setEditDescription(gallery.description || "");
    setEditImageUrl(gallery.imageUrl);
    setOpenEditDialog(true);
  }

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditId(null);
    setEditTitle("");
    setEditDescription("");
    setEditImageUrl("");
  }

  const handleCreateGallery = () => {
    createMutation.mutate({
      title: newTitle,
      description: newDescription,
      imageUrl: newImageUrl,
    });
  };

  const handleUpdateGallery = () => {
    if (editId !== null) {
      updateMutation.mutate({
        id: editId,
        title: editTitle,
        description: editDescription,
        imageUrl: editImageUrl,
      });
    }
  };

  const handleDeleteGallery = (id: number) => {
    if (confirm("Are you sure you want to delete this gallery item?")) {
      deleteMutation.mutate(id);
    }
  };

  if (status === 'loading') {
    return (
      <Box className="flex justify-center items-center h-full">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <p className="text-red-500">Error loading gallery items. Please try again.</p>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Gallery Management</h1>
      <Button variant="contained" color='primary' onClick={handleOpenCreateDialog} className="mb-4">
        Add New Gallery Item
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Title</strong></TableCell>
            <TableCell><strong>Description</strong></TableCell>
            <TableCell><strong>Image</strong></TableCell>
            <TableCell><strong>Created At</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {galleries?.map((gallery) => (
            <TableRow key={gallery.id}>
              <TableCell>{gallery.title}</TableCell>
              <TableCell>{gallery.description || "N/A"}</TableCell>
              <TableCell>
                <img src={gallery.imageUrl} alt={gallery.title} width={100} />
              </TableCell>
              <TableCell>
                {new Date(gallery.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant='outlined'
                  color='primary'
                  onClick={() => handleOpenEditDialog(gallery)}
                  className="mr-2"
                >
                  Edit
                </Button>
                <Button
                  variant='outlined'
                  color='secondary'
                  onClick={() => handleDeleteGallery(gallery.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Create Gallery Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog}>
        <DialogTitle>Add New Gallery Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Image URL"
            type="text"
            fullWidth
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleCreateGallery} color='primary' disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Gallery Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Gallery Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Image URL"
            type="text"
            fullWidth
            value={editImageUrl}
            onChange={(e) => setEditImageUrl(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdateGallery} color="primary" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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
    </div>
  )
}

export default AdminGalleryPage;