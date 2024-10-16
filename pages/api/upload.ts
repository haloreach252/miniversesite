// pages/api/upload.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { getSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';

// Disable Next.js's default body parser to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Utility function to check if the user is an admin
const isAdmin = (session: any): boolean => {
  return session?.user?.role === UserRole.ADMIN;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only handle POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the session to verify if the user is authenticated and is an admin
  const session = await getSession({ req });

  if (!session || !isAdmin(session)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Ensure the uploads directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    multiples: true, // Allow multiple files
    uploadDir, // Directory to save files
    keepExtensions: true, // Preserve file extensions
    maxFileSize: 5 * 1024 * 1024, // 5MB max file size
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error parsing the files:', err);
      return res.status(500).json({ error: 'Error parsing the files' });
    }

    // Handle single and multiple files
    const uploadedFiles: string[] = [];

    if (Array.isArray(files.file)) {
      files.file.forEach((file: File) => {
        const fileUrl = `/uploads/${path.basename(file.filepath)}`;
        uploadedFiles.push(fileUrl);
      });
    } else if (files.file) {
      const fileUrl = `/uploads/${path.basename(files.file.filepath)}`;
      uploadedFiles.push(fileUrl);
    }

    return res.status(200).json({ urls: uploadedFiles });
  });
}
