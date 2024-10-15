"use client"

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect } from 'react';

interface News {
    id: number;
    title: string;
    content: string;
    createdAt: string;
}

const fetchNews = async (): Promise<News[]> => {
    const response = await axios.get('/api/news');
    return response.data;
}

const NewsFeed = () => {
    const { data, isLoading, error } = useQuery<News[]>({
        queryKey: ["news"],
        queryFn: fetchNews,
    });

    if (isLoading) return <p>Loading News...</p>
    if (error) return <p>Error loading news.</p>

    return (
        <section className='container mx-auto my-8'>
            <h2 className='space-y-4'>
                {data?.map((newsItem) => (
                    <div key={newsItem.id} className='p-4 border rounded'>
                        <h3 className='text-xl font-semibold'>{newsItem.title}</h3>
                        <p className='text-gray-600 text-sm'>
                            {new Date(newsItem.createdAt).toLocaleDateString()}
                        </p>
                        <p>{newsItem.content}</p>
                    </div>
                ))}
            </h2>
        </section>
    )
}

export default NewsFeed;