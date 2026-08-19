import React from 'react'

export const metadata = {
  description: 'Soyboy Saajan content management.',
  title: 'Soyboy CMS',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
