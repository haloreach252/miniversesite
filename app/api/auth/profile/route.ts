// app/api/auth/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await request.json();

    await prisma.user.update({
      where: { email: session.user.email },
      data: { name },
    });

    return NextResponse.json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.user.delete({
      where: { email: session.user.email },
    });

    // Optionally, destroy the session

    return NextResponse.json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete account." }, { status: 500 });
  }
}
