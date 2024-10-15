"use client";

import Link from "next/link";
import { useSession, signOut } from 'next-auth/react';
import { UserRole, User } from '@prisma/client';

const Header = () => {
    const { data: session } = useSession();

    return (
        <header className="bg-gray-800 text-white py-4">
            <nav className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">
                    Miniverse Studios
                </Link>
                <ul className="flex space-x-4">
                    <li>
                        <Link href="/about">About</Link>
                    </li>
                    <li>
                        <Link href="/gallery">Gallery</Link>
                    </li>
                    <li>
                        <Link href="/games/ebon-gates">Games</Link>
                    </li>
                    <li>
                        <Link href="/contact">Contact</Link>
                    </li>
                    {session ? (
                        <>
                            <li>
                                <Link href="/auth/profile">Profile</Link>
                            </li>
                            {(session.user as any).role === UserRole.ADMIN && (
                                <li>
                                    <Link href="/admin/dashboard">Admin</Link>
                                </li>
                            )}
                            <li>
                                <button onClick={() => signOut()}>Logout</button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link href="/auth/sign-in">Sign In</Link>
                            </li>
                            <li>
                                <Link href="/auth/sign-up">Sign Up</Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    )
}

export default Header;