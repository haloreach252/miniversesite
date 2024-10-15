import NextAuth from "next-auth";
import { UserRole } from '@prisma/client'

declare module "next-auth" {
    interface Session {
        user: {
            id: number;
            name?: string | null;
            email?: string | null;
            role: UserRole;
            image: string | null;
        }
    }
}