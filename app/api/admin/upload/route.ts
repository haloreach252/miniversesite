import { NextResponse } from "next/server";
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UserRole } from "@prisma/client";

export const config = {
    api: {
        bodyParser: false,
    }
}

const isAdmin = (session: any): boolean => {
    return session?.user?.role === UserRole.ADMIN;
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = new IncomingForm();

    // Ensure the uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        form.parse(request, (err, fields, files) => {
            if (err) {
                console.error("Error parsing form:", err);
                return resolve(
                    NextResponse.json({ error: "Error parsing form data." }, { status: 500 })
                );
            }

            const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file];

            const fileUrls: string[] = [];

            uploadedFiles.forEach((file: any) => {
                const oldPath = file.filepath;
                const fileName = `${Date.now()}_${file.originalFilename}`;
                const newPath = path.join(uploadDir, fileName);

                fs.renameSync(oldPath, newPath);

                const fileUrl = `/uploads/${fileName}`;

                fileUrls.push(fileUrl);
            });

            resolve(
                NextResponse.json({ urls: fileUrls }, { status: 200 })
            )
        })
    })
}