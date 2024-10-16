import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const isAdmin = (session: any): boolean => {
    return session?.user?.role === UserRole.ADMIN;
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const period = url.searchParams.get("period") || "day"; //default to day

    try {
        let data = [];

        switch (period) {
            case "day":
                data = await prisma.$queryRaw`
                    SELECT
                        DATE("createdAt") as label,
                        COUNT(*) as count
                    FROM "User"
                    GROUP BY DATE("createdAt")
                    ORDER BY DATE("createdAt") ASC
                `
                break;
            case "week":
                data = await prisma.$queryRaw`
                    SELECT
                        DATE_TRUNC('week', "createdAt") as label,
                        COUNT(*) as count
                    FROM "User"
                    GROUP BY DATE_TRUNC('week', "createdAt")
                    ORDER BY DATE_TRUNC('week', "createdAt") ASC
                `
                break;
            case "month":
                data = await prisma.$queryRaw`
                    SELECT
                        DATE_TRUNC('month', "createdAt") as label,
                        COUNT(*) as count
                    FROM "User"
                    GROUP BY DATE_TRUNC('month', "createdAt")
                    ORDER BY DATE_TRUNC('month', "createdAt") ASC
                `
                break;
            case "year":
                data = await prisma.$queryRaw`
                    SELECT
                        DATE_TRUNC('year', "createdAt") as label,
                        COUNT(*) as count
                    FROM "User"
                    GROUP BY DATE_TRUNC('year', "createdAt")
                    ORDER BY DATE_TRUNC('year', "createdAt") ASC
                `
                break;
            default:
                return NextResponse.json({ error: "Invalid period parameter." }, { status: 400 });
        }

        // Format the data
        const formattedData = data.map((item: any) => ({
            label: new Date(item.label).toLocaleDateString(undefined, {
                year: "numeric",
                month: period === 'year' ? undefined : "short",
                day: period === 'day' ? "numeric" : undefined,
            }),
            count: parseInt(item.count, 10),
        }));

        return NextResponse.json(formattedData, { status: 200 });
    } catch (error) {
        console.error("Error fetching user registrations:", error);
        return NextResponse.json({ error: "Failed to fetch user registrations. "}, { status: 500 });
    }
}