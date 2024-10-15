"use client"

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';

interface GalleryImage {
    id: number;
    url: string;
    title?: string;
    order: number;
}

const fetchGallery = async (): Promise<GalleryImage[]> => {
    const response = await axios.get('/api/gallery');
    return response.data;
}

const GalleryPage = () => {
    const { data, isLoading, error } = useQuery<GalleryImage[]>({
        queryKey: ["gallery"],
        queryFn: fetchGallery,
    });

    if (isLoading) return <p>Loading gallery...</p>
    if (error) return <p>Error loading gallery.</p>

    return (
        <section className='container mx-auto my-8'>
            <h1 className='text-3xl font-bold mb-4'>Gallery</h1>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {data?.map((image) => (
                    <div key={image.id} className='relative w-full h-64'>
                        <Image
                            src={image.url}
                            alt={image.title || "Gallery Image"}
                            layout="fill"
                            objectFit="cover"
                            className="rounded"
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}

export default GalleryPage;