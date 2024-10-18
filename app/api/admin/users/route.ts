// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // Retrieve the session
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated and has the ADMIN role
  if (!session || (session.user as any).role !== UserRole.ADMIN) {
    console.error("Unauthorized Request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users, { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }});
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  // Retrieve the session
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated and has the ADMIN role
  if (!session || (session.user as any).role !== UserRole.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, newRole } = await request.json();

    // Validate input
    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "User ID and new role are required" },
        { status: 400 },
      );
    }

    // Validate newRole against UserRole enum
    if (!Object.values(UserRole).includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Update the users role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    return NextResponse.json({ message: 'User role updated successfully', user: updatedUser})
  } catch (error) {
    console.error("Error updating user role:", error);

    if (error instanceof prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Record not found
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ error: "Failed to update user role." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  try {
    await prisma.user.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: "User deleted successfully." });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
  }
}
