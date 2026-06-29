import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Meal Forge',
  description: 'Meal planning, recipe management, and shopping lists.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
