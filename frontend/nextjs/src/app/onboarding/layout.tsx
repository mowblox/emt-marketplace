import React from 'react'

type Props = {
  children: React.ReactNode
}

const OnboardingLayout = ({children}: Props) => {
  return (
    <div className="bg-[url('/img/sky-bg.png')] h-screen w-full">
      {children}
    </div>
  )
}

export default OnboardingLayout