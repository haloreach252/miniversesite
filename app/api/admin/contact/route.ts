import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient, ContactSubmission, UserRole } from "@prisma/client";
import { headers } from "next/headers";

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
        const submissions: ContactSubmission[] = await prisma.contactSubmission.findMany({
            orderBy: { createdAt: "desc"}
        });

        return NextResponse.json(submissions, { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
    } catch (error) {
        console.error("Error fetching contact submissions:", error);
        return NextResponse.json(
            { error: "Failed to fetch contact submissions." },
            { status: 500 }
        )
    }
}