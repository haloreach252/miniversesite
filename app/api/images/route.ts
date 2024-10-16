import { NextResponse } from 'next/server';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
    region: process.env.AWS_REGION, // e.g. 'us-east-1'
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

export async function GET(request: Request) {
    const url = new URL(request.url);
    let key = url.searchParams.get('key');

    if (!key) {
        return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
    }

    if (key.startsWith('/')) {
        key = key.substring(1);
    }

    try {
        await s3.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
    } catch (error) {
        console.error('Error accessing S3 object:', error);
        return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({ url: imageUrl }, { status: 200});
}