import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const images = await prisma.galleryImage.findMany({
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(images);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch gallery images' }, { status: 500});
    }
}