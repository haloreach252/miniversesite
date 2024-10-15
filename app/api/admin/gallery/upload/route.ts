// app/api/admin/gallery/upload/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient, UserRole } from "@prisma/client";
import formidable from 'formidable';
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), "/public/uploads");
  form.keepExtensions = true;

  return new Promise((resolve) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        return resolve(
          NextResponse.json({ error: "Failed to upload image." }, { status: 500 })
        );
      }

      const file = files.file as formidable.File;
      const filePath = `/uploads/${path.basename(file.path)}`;

      try {
        const newImage = await prisma.galleryImage.create({
          data: {
            url: filePath,
            title: fields.title as string | undefined,
            order: 0, // Adjust ordering as needed
          },
        });
        resolve(NextResponse.json(newImage));
      } catch (error) {
        console.error(error);
        resolve(
          NextResponse.json({ error: "Failed to save image to database." }, { status: 500 })
        );
      }
    });
  });
}
