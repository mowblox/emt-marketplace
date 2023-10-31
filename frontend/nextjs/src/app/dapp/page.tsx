import React from 'react'

type Props = {}

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
  
        < >{children}</>
  
    )
  }
  