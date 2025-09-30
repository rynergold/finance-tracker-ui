'use client'

import '@mantine/core/styles.css';
import 'mantine-react-table/styles.css';
import '@mantine/notifications/styles.css';

import {createTheme, MantineProvider } from "@mantine/core";
import {ModalsProvider} from '@mantine/modals';
import {Notifications} from "@mantine/notifications";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useState} from 'react'

const theme = createTheme({
  colors: {
    dark: [
      '#fafaf9',
      '#e7e5e4',
      '#d6d3d1',
      '#a8a29e',
      '#78716c',
      '#57534e',
      '#44403c',
      '#292524',
      '#1c1917',
      '#0c0a09',
    ],
    sky: [
      '#f0f9ff',  // Lightest sky
      '#e0f2fe',  // Soft sky blue
      '#bae6fd',  // Light sky
      '#7dd3fc',  // Clear sky
      '#38bdf8',  // Bright sky
      '#0ea5e9',  // Sky blue
      '#0284c7',  // Deep sky
      '#0369a1',  // Ocean blue
      '#075985',  // Deep ocean
      '#0c4a6e',  // Darkest
    ],
  },
  white: '#fafaf9',
  black: '#1c1917',
  primaryColor: 'sky',
  defaultRadius: 'md',
});

export function Providers({children}: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications />
        <ModalsProvider>
          {children}
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}