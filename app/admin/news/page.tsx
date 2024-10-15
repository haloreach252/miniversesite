// app/admin/news/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableRow, Button, TextField } from "@mui/material";
import { useState } from "react";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

const fetchNews = async (): Promise<NewsItem[]> => {
  const response = await axios.get("/api/admin/news");
  return response.data;
};

const deleteNews = async (id: number) => {
  await axios.delete(`/api/admin/news/${id}`);
};

const AdminNewsPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<NewsItem[]>({
    queryKey: ['admin-news'],
    queryFn: fetchNews,
  });

  const mutation = useMutation({
    mutationFn: deleteNews,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-news"]);
    },
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleAddNews = async () => {
    try {
      await axios.post("/api/admin/news", { title, content });
      setTitle("");
      setContent("");
      queryClient.invalidateQueries(["admin-news"]);
    } catch (error) {
      console.error("Failed to add news.");
    }
  };

  if (isLoading) return <p>Loading news...</p>;
  if (error) return <p>Error loading news.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Manage News</h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Add New Article</h2>
        <TextField
          label="Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-2"
        />
        <TextField
          label="Content"
          multiline
          rows={4}
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-2"
        />
        <Button variant="contained" color="primary" onClick={handleAddNews}>
          Add News
        </Button>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((news) => (
            <TableRow key={news.id}>
              <TableCell>{news.title}</TableCell>
              <TableCell>{new Date(news.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => mutation.mutate(news.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminNewsPage;
