"use client";

import { useQuery } from "@tanstack/react-query";
import axios from 'axios';
import Image from "next/image";
import { motion } from 'framer-motion';

interface Game {
    id: number;
    title: string;
    description: string;
    screenshots: string[];
    mediaLinks: string[];
}

const fetchEldritchDawn = async (): Promise<Game> => {
    const response = await axios.get("/api/games/eldritchdawn");
    return response.data;
}

const EbonGatesPage = () => {
    const { data, isLoading, error } = useQuery<Game>({
        queryKey: ["eldritchdawn"],
        queryFn: fetchEldritchDawn,
    });

    if (isLoading) return <p>Loading game details...</p>
    if (error) return <p>Error loading game details.</p>

    return (
        <section className="container mx-auto my-8">
            <motion.h1
                className="text-3xl font-bold mb-4"
                initial={{ opacity: 0}}
                animate={{ opacity: 1}}
            >
                {data?.title}
            </motion.h1>
            <p className="mb-4">{data?.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {data?.screenshots.map((src, index) => (
                    <motion.div
                        key={index}
                        className="relative w-full h-64"
                        whileHover={{ scale: 1.05 }}
                    >
                        <Image src={src} alt={`Screenshot ${index + 1}`} layout="fill" objectFit="cover" className="rounded" />
                    </motion.div>
                ))}
            </div>
            <div className="mt-4">
                <h2 className="text-2xl font-semibold">Media Links</h2>
                <ul className="list-disc list-inside">
                    {data?.mediaLinks.map((link, index) => (
                        <li key={index}>
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                Link {index + 1}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

export default EbonGatesPage;