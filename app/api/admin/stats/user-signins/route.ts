// app/api/admin/stats/user-signins/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const isAdmin = (session: any): boolean => {
  return session?.user?.role === "ADMIN";
};

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const period = url.searchParams.get("period") || "day"; // default to day

  try {
    let data = [];

    switch (period) {
      case "day":
        data = await prisma.$queryRaw`
          SELECT 
            DATE("signedInAt") as label, 
            COUNT(*) as count
          FROM "SignIn"
          GROUP BY DATE("signedInAt")
          ORDER BY DATE("signedInAt") ASC
        `;
        break;
      case "week":
        data = await prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('week', "signedInAt") as label, 
            COUNT(*) as count
          FROM "SignIn"
          GROUP BY DATE_TRUNC('week', "signedInAt")
          ORDER BY DATE_TRUNC('week', "signedInAt") ASC
        `;
        break;
      case "month":
        data = await prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', "signedInAt") as label, 
            COUNT(*) as count
          FROM "SignIn"
          GROUP BY DATE_TRUNC('month', "signedInAt")
          ORDER BY DATE_TRUNC('month', "signedInAt") ASC
        `;
        break;
      case "year":
        data = await prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('year', "signedInAt") as label, 
            COUNT(*) as count
          FROM "SignIn"
          GROUP BY DATE_TRUNC('year', "signedInAt")
          ORDER BY DATE_TRUNC('year', "signedInAt") ASC
        `;
        break;
      default:
        return NextResponse.json({ error: "Invalid period parameter." }, { status: 400 });
    }

    // Format the data
    const formattedData = data.map((item: any) => ({
      label: new Date(item.label).toLocaleDateString(undefined, {
        year: "numeric",
        month: period === "year" ? undefined : "short",
        day: period === "day" ? "numeric" : undefined,
      }),
      count: parseInt(item.count, 10),
    }));

    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error("Error fetching user sign-ins:", error);
    return NextResponse.json({ error: "Failed to fetch user sign-ins." }, { status: 500 });
  }
}
