// app/api/admin/news/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch news." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content } = await request.json();
    const newNews = await prisma.news.create({
      data: { title, content },
    });
    return NextResponse.json(newNews);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create news." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "News ID is required." }, { status: 400 });
  }

  try {
    await prisma.news.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: "News deleted successfully." });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete news." }, { status: 500 });
  }
}
