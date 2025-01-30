"use client"
import React, { ReactNode, useState } from 'react'
import {QueryClient , QueryClientProvider } from "@tanstack/react-query"
import {ReactQueryDevtools} from "@tanstack/react-query-devtools"
import { ThemeProvider } from "@/components/theme-provider"
import NextTopLoaderBar from '../NextTopLoader'
const AppProviders = ({children} : {children : ReactNode}) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider  client={queryClient}>
    <ThemeProvider
    attribute="class"
    defaultTheme="dark"
    enableSystem
    disableTransitionOnChange
    >
     < NextTopLoaderBar />
    {children}
  </ThemeProvider>
  <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default AppProviders