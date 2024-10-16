"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';

interface S3ImageProps {
    imageKey: string; // The key or path of the image in S3, e.g., 'images/image1.jpg'
    alt?: string;
    width?: number;
    height?: number;
    className?: string;
}

const S3Image: React.FC<S3ImageProps> = ({ imageKey, alt = 'S3 Image', width = 500, height = 500, className }) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchImageUrl = async () => {
            try {
                const response = await axios.get('/api/images', {
                    params: { key: imageKey },
                });
                setImageUrl(response.data.url);
                setLoading(false);
            } catch (error) {
                console.error('Erro fetching image url:', error);
                setError('Failed to load image');
                setLoading(false);
            }
        };

        fetchImageUrl();
    }, [imageKey])

    if (loading) {
        return (
            <div className={`flex justify-center items-center ${className}`}>
                <p>Loading image...</p>
            </div>
        )
    }
    if (error) {
        return (
            <div className={`flex justify-center items-center ${className}`}>
                <p>{error}</p>
            </div>
        )
    }
    if (!imageUrl) {
        return (
            <div className={`flex justify-center items-center ${className}`}>
                <p>No image found.</p>
            </div>
        )
    }

    return (
        <div className={className}>
            <Image
                src={imageUrl}
                alt={alt}
                width={width}
                height={height}
                style={{ objectFit: 'cover' }}
                className='rounded'
            />
        </div>
    )
}

export default S3Image;