export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { PrismaClient, UserRole } from '@prisma/client'
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { roleLevels } from '@/app/lib/roles';

const prisma = new PrismaClient();

// Use this is the role of the user is user
const UserViewRoles = [
    UserRole.USER,
  ]
  
  // Use this if the role of the user is moderator
  const ModeratorViewRoles = [
    UserRole.MODERATOR,
    UserRole.USER,
  ]
  
  // Use this if the role of the user is developer
  const DeveloperViewRoles = [
    UserRole.DEVELOPER,
    UserRole.MODERATOR,
    UserRole.USER,
  ]
  
  // Admin can see all
  const AdminViewRoles = [
    UserRole.ADMIN,
    UserRole.DEVELOPER,
    UserRole.MODERATOR,
    UserRole.USER,
  ]
  
  const getUserViewRoles = (role: UserRole): UserRole[] => {
    switch(role) {
      case UserRole.USER:
        return UserViewRoles;
      case UserRole.MODERATOR:
        return ModeratorViewRoles;
      case UserRole.DEVELOPER:
        return DeveloperViewRoles;
      case UserRole.ADMIN:
        return AdminViewRoles;
      default:
        return UserViewRoles;
    }
  }

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    let userRole = UserRole.USER as UserRole;

    if (session && session.user) {
        userRole = session.user.role as UserRole;
    }

    if (!Object.values(UserRole).includes(userRole)) {
        console.error("UNKNOWN ROLE");
    }

    const userRoleLevel = roleLevels[userRole];

    // Determine the roles the user is allowed to view
    const allowedRoles: UserRole[] = Object.values(UserRole).filter(
        (role) => roleLevels[role] <= userRoleLevel
    )

    try {
        const games = await prisma.game.findMany({
            where: {
                viewRole: {
                    in: allowedRoles
                }
            },
            select: {
                id: true,
                title: true,
                shortDescription: true,
                plannedReleaseDate: true,
            },
            orderBy: { createdAt: "desc" }
        });
        
        return NextResponse.json(games, { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
    } catch (error) {
        console.error("Error fetching games:", error);
        return NextResponse.json({ error: "Failed to fetch games." }, { status: 500 });
    }
}