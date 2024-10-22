'use client'

import { SessionProvider } from "next-auth/react"
import { ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface ProvidersProps {
    children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 30, // 30 minutes
                retry: 2, // Retry failed requests twice
                refetchOnWindowFocus: false, // disable refetch on window focus
            }
        }
    }))

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </SessionProvider>
    )
}

export default Providers;