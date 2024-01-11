import React, { useEffect, useLayoutEffect } from 'react'

type Props = {
  children: React.ReactNode
}

const OnboardingLayout = async ({children}: Props) => {

  return (
    <div className="bg-[url('/img/sky-bg.png')] min-h-screen w-full">
      {children}
    </div>
  )
}

export default OnboardingLayout