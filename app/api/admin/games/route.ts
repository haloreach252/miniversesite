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
                plannedReleaseDate: true,
                viewRole: true,
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

    const body = await request.json();
    const { title, shortDescription, plannedReleaseDate, description, viewRole, contentChunks } = body;

    if (!title || !shortDescription || !plannedReleaseDate || !description || !viewRole) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

    try {
        for (const chunk of contentChunks) {
            if (
                (chunk.type === 'IMAGE' || chunk.type === 'VIDEO') &&
                ((chunk.width && chunk.width <= 0) ||
                    (chunk.height && chunk.height <= 0))
            ) {
                return NextResponse.json({ error: 'Width and height must be positive integers' }, { status: 400 })
            }
        }

        const newGame = await prisma.game.create({
            data: {
                title,
                shortDescription,
                plannedReleaseDate: new Date(plannedReleaseDate),
                description,
                viewRole,
                contentChunks: {
                    create: contentChunks.map((chunk: any) => ({
                        type: chunk.type,
                        content: chunk.content,
                        order: chunk.order,
                        width: chunk.width || null,
                        height: chunk.height || null,
                    })),
                },
            },
        });

        return NextResponse.json(newGame, { status: 201, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
    } catch (error) {
        console.error("Error creating game:", error);
        return NextResponse.json({ error: "Failed to create game." }, { status: 500 });
    }
}