import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient, UserRole } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials) {
                    throw new Error("No credentials provided");
                }

                const fixedEmail = credentials?.email.toLowerCase();

                const user = await prisma.user.findUnique({
                    where: { email: fixedEmail },
                });

                if (!user) {
                    throw new Error("No user found with the given email");
                }

                // Check password
                const isValid = await compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Invalid password");
                }

                return { id: user.id, name: user.name, email: user.email, role: user.role, isSuperUser: user.isSuperUser };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 60 * 60 * 24, // 1 day
        updateAge: 60 * 15, // 15 minutes
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // Log sign-in
            await prisma.signIn.create({
                data: {
                    userId: user.id,
                    signedInAt: new Date(),
                },
            });
            return true;
        },
        async jwt({ token, user }) {
            // Initial sign-in
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.lastUpdated = new Date().getTime(); // Timestamp of last update
                token.isSuperUser = (user as any).isSuperUser
            } else {
                // Subsequent JWT callbacks (e.g., when refreshing token)
                // Fetch the latest user data from the database
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as number },
                    select: { role: true, updatedAt: true, isSuperUser: true }
                });

                if (dbUser) {
                    const userUpdatedAt = dbUser.updatedAt.getTime();
                    if (userUpdatedAt > (token.lastUpdated as number)) {
                        // If the users role has been updated after the token was issued
                        token.role = dbUser.role;
                        token.isSuperUser = dbUser.isSuperUser;
                        token.lastUpdated = userUpdatedAt;
                    }
                }
            }

            return token;
            /*
            if (user) {
                token.role = (user as any).role;
            }

            return token;*/
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as number;
                session.user.role = token.role as UserRole;
                session.user.isSuperUser = token.isSuperUser as boolean;
            }

            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };