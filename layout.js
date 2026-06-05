import { ClerkProvider } from '@clerk/nextjs'
import '../styles/globals.css'

export const metadata = {
  title: 'PostMate — AI Content for Local Businesses',
  description: 'Generate a full month of content in 60 seconds.',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
