import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Mailgun from 'mailgun.js';
import formData from 'form-data';

const prisma = new PrismaClient();

const mg = new Mailgun(formData);
const mgClient = mg.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY!,
});

export async function POST(request: Request) {
    try {
        const { name, email, subject, message } = await request.json();

        // Store in the database
        await prisma.contactSubmission.create({
            data: {
                name,
                email,
                subject,
                message,
            },
        });

        // Send email via mailgun
        const data = {
            from: `Miniverse Studios <mailgun@${process.env.MAILGUN_DOMAIN}>`,
            to: "nathan@miniversestudios.com",
            subject: `New Contact Submission: ${subject}`,
            text: `You have a new contact submission:
            Name: ${name}
            Email: ${email}
            Subject: ${subject}
            Message:
            ${message}
            `
        };

        await mgClient.messages.create(process.env.MAILGUN_DOMAIN!, data);

        return NextResponse.json({ message: "Contact form submitted successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to submit contact form.' }, { status: 500 });
    }
}