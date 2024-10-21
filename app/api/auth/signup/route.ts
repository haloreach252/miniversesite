import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({ where: { email }});
        if (existingUser) {
            return NextResponse.json({ error: "User already exists with this email"}, { status: 400 });
        }

        // Hash password
        const hashedPassword = await hash(password, 12);
        const fixedEmail = email.toLowerCase();

        // Create user
        await prisma.user.create({
            data: {
                name,
                email: fixedEmail,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create user"}, { status: 500})
    }
}