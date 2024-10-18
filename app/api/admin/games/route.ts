import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient, ContentType, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const isAdmin = (session: any): boolean => {
    return session?.user?.role === UserRole.ADMIN;
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const games = await prisma.game.findMany({
            select: {
                id: true,
                title: true,
                shortDescription: true,
                plannedReleaseDate: true
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(games, { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
    } catch (error) {
        console.error("Error fetching games:", error);
        return NextResponse.json({ error: "Failed to fetch games." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, shortDescription, plannedReleaseDate, description } = body;

        if (!title || !shortDescription || !plannedReleaseDate || !description) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        const newGame = await prisma.game.create({
            data: {
                title,
                shortDescription,
                plannedReleaseDate: new Date(plannedReleaseDate),
                description
            },
        });

        return NextResponse.json(newGame, { status: 201, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
    } catch (error) {
        console.error("Error creating game:", error);
        return NextResponse.json({ error: "Failed to create game." }, { status: 500 });
    }
}