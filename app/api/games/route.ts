import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const games = await prisma.game.findMany({
            select: {
                id: true,
                title: true,
                shortDescription: true,
                plannedReleaseDate: true,
            },
            orderBy: { createdAt: "desc" }
        });
        
        return NextResponse.json(games, { status: 200 });
    } catch (error) {
        console.error("Error fetching games:", error);
        return NextResponse.json({ error: "Failed to fetch games." }, { status: 500 });
    }
}