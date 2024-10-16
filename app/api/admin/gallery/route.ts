import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient, Gallery, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

// Utility function to check admin role
const isAdmin = (session: any): boolean => {
    return session?.user?.role === UserRole.ADMIN;
}

// Handle GET and POST requests
export async function GET(request: Request) {
    // Retrieve the session
    const session = await getServerSession(authOptions);

    // Authorization check
    if (!session || !isAdmin(session)) {
        console.error("Unauthorized access to admin gallery");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401})
    }

    try {
        // Fetch all gallery items
        const galleries = await prisma.gallery.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(galleries);
    } catch (error) {
        console.error("Error fetching galleries:", error);
        return NextResponse.json({ error: "Failed to fetch galleries" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    // Retrieve the session
    const session = await getServerSession(authOptions);

    // Authorization check
    if (!session || !isAdmin(session)) {
        console.error("Unauthorized access to admin gallery");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { title, description, imageUrl } = await request.json();

        // Input validation
        if (!title || !imageUrl) {
            console.error("Title and image url are required and not found")
            return NextResponse.json(
                { error: "Title and Image URL are required." },
                { status: 400 }
            );
        }

        // Create a new gallery item
        const newGallery: Gallery = await prisma.gallery.create({
            data: {
                title,
                description,
                imageUrl,
            },
        });

        return NextResponse.json(newGallery, { status: 201 });
    } catch (error) {
        console.error("Error creating gallery item:", error);
        return NextResponse.json({ error: "Failed to create gallery item." }, { status: 500 });
    }
}

// Handle PUT and DELETE requests based on the request method and URL
export async function PUT(request: Request) {
    // Retrieve the session
    const session = await getServerSession(authOptions);

    // Authorization check
    if (!session || !isAdmin(session)) {
        console.error("Unauthorized access to admin gallery");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, title, description, imageUrl } = await request.json();

        // Input validation
        if (!id || !title || !imageUrl) {
            return NextResponse.json(
                { error: "ID, Title, and Image URL are required." },
                { status: 400 },
            );
        }

        // Update the gallery item
        const updatedGallery: Gallery = await prisma.gallery.update({
            where: { id },
            data: {
                title,
                description,
                imageUrl,
            },
        });

        return NextResponse.json(updatedGallery, { status: 200 });
    } catch (error) {
        console.error("Error updating gallery item:", error);
        if (error instanceof prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                // Record not found
                return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
            }
        }
        return NextResponse.json({ error: "Failed to update gallery item."}, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    // Retrieve the session
    const session = await getServerSession(authOptions);

    // Authorization check
    if (!session || !isAdmin(session)) {
        console.error("Unauthorized access to admin gallery");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await request.json();

        // Input validation
        if (!id) {
            return NextResponse.json(
                { error: "ID is required" },
                { status: 400 },
            );
        }

        // Delete the gallery item
        await prisma.gallery.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Gallery item deleted successfully" }, { status: 200});
    } catch (error) {
        console.error("Error deleting gallery item:", error);
        if (error instanceof prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
            // Record not found
            return NextResponse.json({ error: "Gallery item not found." }, { status: 404 });
        }
        }
        return NextResponse.json({ error: "Failed to delete gallery item." }, { status: 500 });
    }
}