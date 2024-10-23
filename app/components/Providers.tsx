// /app/components/Providers.tsx

'use client'

import { SessionProvider } from "next-auth/react"
import { ReactNode, useState } from "react"
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from "../lib/get-query-client";

interface ProvidersProps {
    children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
    const queryClient = getQueryClient();

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </SessionProvider>
    )
}

export default Providers;