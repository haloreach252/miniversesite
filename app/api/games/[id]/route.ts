// app/api/games/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient, ContentType } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
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
      return NextResponse.json({ error: "Game not found." }, { status: 404 });
    }

    return NextResponse.json(game, { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
  } catch (error) {
    console.error("Error fetching game details:", error);
    return NextResponse.json({ error: "Failed to fetch game details." }, { status: 500 });
  }
}
