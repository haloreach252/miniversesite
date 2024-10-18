export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const news = await prisma.news.findMany({
            orderBy: { createdAt: "desc" },
            take: 10
        });
        return NextResponse.json(news, { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }});
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch news' }, {status: 500});
    }
}