// app/admin/gallery/page.tsx
"use client";

import { useDropzone } from "react-dropzone";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import Image from "next/image";

interface GalleryImage {
  id: number;
  url: string;
  title?: string;
  order: number;
}

const fetchGallery = async (): Promise<GalleryImage[]> => {
  const response = await axios.get("/api/admin/gallery");
  return response.data;
};

const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post("/api/admin/gallery/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

const deleteImage = async (id: number) => {
  await axios.delete(`/api/admin/gallery/${id}`);
};

const AdminGalleryPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<GalleryImage[]>({
    queryKey: ["admin-gallery"],
    queryFn: fetchGallery,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gallery"]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteImage,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gallery"]);
    },
  });

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      uploadMutation.mutate(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (isLoading) return <p>Loading gallery...</p>;
  if (error) return <p>Error loading gallery.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Manage Gallery</h1>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-6 text-center ${
          isDragActive ? "border-blue-500" : "border-gray-300"
        } mb-6`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the images here...</p>
        ) : (
          <p>Drag & drop images here, or click to select files</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data?.map((image) => (
          <div key={image.id} className="relative w-full h-64">
            <Image src={image.url} alt={image.title || "Gallery Image"} layout="fill" objectFit="cover" className="rounded" />
            <button
              onClick={() => deleteMutation.mutate(image.id)}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminGalleryPage;
