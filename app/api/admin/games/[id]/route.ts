import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient, ContentType, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const isAdmin = (session: any): boolean => {
    return session?.user?.role === UserRole.ADMIN;
}

export async function GET(request: Request, { params }: { params: { id: string }}) {
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    try {
        const game = await prisma.game.findUnique({
            where: { id: parseInt(id) },
            include: {
                contentChunks: {
                    orderBy: { order: "asc" },
                },
            },
        });

        if (!game) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        return NextResponse.json(game, { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
    } catch (error) {
        console.error("Error fetching game.", error);
        return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string }}) {
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    try {
        const body = await request.json();
        const { title, shortDescription, plannedReleaseDate, description, viewRole, contentChunks } = body;

        if (!title || !shortDescription || !plannedReleaseDate || !description || !viewRole) {
            return NextResponse.json(
                { error: "Title, short description, planned release date, view role, and description are required" },
                { status: 400 }
            );
        }

        for (const chunk of contentChunks) {
            if (
                (chunk.type === 'IMAGE' || chunk.type === 'VIDEO') &&
                ((chunk.width && chunk.width <= 0) ||
                (chunk.height && chunk.height <= 0))
            ) {
                return NextResponse.json({ error: 'Width and height must be positive integers' }, { status: 400 })
            }
        }

        // Update the game
        const updatedGame = await prisma.game.update({
            where: { id: parseInt(id) },
            data: {
                title,
                shortDescription,
                plannedReleaseDate: new Date(plannedReleaseDate),
                description,
                viewRole,
                contentChunks: {
                    deleteMany: {},
                    create: contentChunks.map((chunk: any) => ({
                        type: chunk.type,
                        content: chunk.content,
                        order: chunk.order,
                        width: chunk.width || null,
                        height: chunk.height || null,
                    }))
                }
            }
        });

        /*
        // Handle content chunks
        if (contentChunks && Array.isArray(contentChunks)) {
            // Delete existing content chunks
            await prisma.contentChunk.deleteMany({
                where: { gameId: parseInt(id) },
            });

            // Create new content chunks
            const chunksData = contentChunks.map((chunk: any, index: number) => ({
                type: chunk.type,
                content: chunk.content,
                order: index + 1,
                gameId: parseInt(id)
            }));

            await prisma.contentChunk.createMany({
                data: chunksData
            })
        }*/

        return NextResponse.json(updatedGame, { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
    } catch (error) {
        console.error("Error updating game:", error);
        return NextResponse.json({ error: "Failed to update game" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string }}) {
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    try {
        // Delete content chunks first due to foreign key constraints
        await prisma.contentChunk.deleteMany({
            where: { gameId: parseInt(id) },
        });

        // Delete the game
        await prisma.game.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ message: "Game deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting game:", error);
        return NextResponse.json({ error: "Failed to delete game." }, { status: 500 });
    }
}