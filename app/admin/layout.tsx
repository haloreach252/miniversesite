"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
import { UserRole } from "@prisma/client";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const { data: session } = useSession();
    const router = useRouter();

    if (!session || (session.user as any).role !== UserRole.ADMIN) {
        router.push("/auth/sign-in");
        return null;
    }

    return (
        <div className="flex">
            <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
                <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
                <ul className="space-y-2">
                    <li>
                        <Link href="/admin/dashboard">Dashboard</Link>
                    </li>
                    <li>
                        <Link href="/admin/users">Users</Link>
                    </li>
                    <li>
                        <Link href="/admin/news">News</Link>
                    </li>
                    <li>
                        <Link href="/admin/gallery">Gallery</Link>
                    </li>
                    <li>
                        <Link href="/admin/contact">Contact Submissions</Link>
                    </li>
                </ul>
            </aside>
            <main className="flex-1 p-6">{children}</main>
        </div>
    )
}

export default AdminLayout;