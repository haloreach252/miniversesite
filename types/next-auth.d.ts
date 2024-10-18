import NextAuth from "next-auth";
import { UserRole } from '@prisma/client'

declare module "next-auth" {
    interface Session {
        user: {
            id: number;
            name?: string | null;
            email?: string | null;
            role: UserRole;
            isSuperUser: boolean;
            image: string | null;
        }
    }
}