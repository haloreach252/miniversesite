import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const game = await prisma.game.findUnique({
      where: { title: "Eldritch Dawn" },
    });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    return NextResponse.json(game);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch game details" }, { status: 500 });
  }
}
