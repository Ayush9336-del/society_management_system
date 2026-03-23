import './globals.css'

export const metadata = {
  title: 'Society Subscription Management',
  description: 'Manage society subscriptions and payments',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
