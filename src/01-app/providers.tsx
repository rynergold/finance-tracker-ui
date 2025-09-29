'use client'

import '@mantine/core/styles.css';
import 'mantine-react-table/styles.css';
import '@mantine/notifications/styles.css';

import {MantineProvider} from "@mantine/core";
import {ModalsProvider} from '@mantine/modals';
import {Notifications} from "@mantine/notifications";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useState} from 'react'

export function Providers({children}: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Notifications />
        <ModalsProvider>
          {children}
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}