export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { PrismaClient, Gallery } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Fetch all gallery items ordered by creation date (latest first)
        const galleries: Gallery[] = await prisma.gallery.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(galleries, { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
    } catch (error) {
        console.error("Error fetching gallery items:", error);
        return NextResponse.json(
            { error: "Failed to fetch gallery items." },
            { status: 500 }
        );
    }
}