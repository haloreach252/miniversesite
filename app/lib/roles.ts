import { UserRole } from "@prisma/client";

export const roleLevels: Record<UserRole, number> = {
    [UserRole.USER]: 1,
    [UserRole.MODERATOR]: 2,
    [UserRole.DEVELOPER]: 3,
    [UserRole.ADMIN]: 4,
};