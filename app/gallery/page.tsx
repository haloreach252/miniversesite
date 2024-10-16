"use client"

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import S3Image from '../components/common/S3Image';
import { Gallery } from '@prisma/client';

const fetchGallery = async (): Promise<Gallery[]> => {
    const response = await axios.get('/api/gallery');
    return response.data;
}

const GalleryPage = () => {
    const { data, isLoading, error } = useQuery<Gallery[]>({
        queryKey: ["gallery"],
        queryFn: fetchGallery,
    });

    if (isLoading) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <p>Loading gallery...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <p>Error loading gallery.</p>
            </div>
        );
    }

    return (
        <section className='container mx-auto my-8'>
            <h1 className='text-3xl font-bold mb-4'>Gallery</h1>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {data?.map((image) => (
                    <div key={image.id} className='flex flex-col items-center'>
                        <div className='relative w-full h-64'>
                            <Image
                                src={image.imageUrl}
                                alt={image.title || 'Gallery Image'}
                                width={500}
                                height={500}
                                className='rounded shadow-md'
                            />
                        </div>
                        {image.description && (
                            <p className='mt-2 text-center text-gray-700'>
                                {image.description}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}

export default GalleryPage;