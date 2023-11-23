import React from 'react'
import Image from 'next/image'
const onboardingPhoto = require('@/assets/onboarding-1.png')
import { Button } from '@/components/ui/button'

const OnboardingPage = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-9 md:h-full gap-4 mx-4 md:mx-8"
    >
      <div className="mt-24 md:mt-0 md:col-span-3 md:col-start-2 w-full relative h-[346px] md:h-full">
        <Image src={String(onboardingPhoto.default.src)} fill className="object-contain" alt="Onboarding photo"/>
      </div>
      <div className="md:col-span-3 md:col-start-6 flex flex-col gap-6 justify-start md:justify-center items-center">
        <h4 className='text-xl md:text-3xl text-center font-semibold tracking-wider'>In sed in velit lacus at. Ultricies morbi morbi pharetra nulla eget eget.</h4>
        <p className='text-muted text-center'>Ut accumsan accumsan molestie aliquam feugiat urna quisque eu. Sagittis adipiscing pellentesque massa vulputate curabitur scelerisque.</p>
        <div className="w-full lg:w-2/3 space-y-5 mb-20 md:mb-0">
          <Button className='w-full'>Create Wallet</Button>
          <Button className='w-full' variant="outline">I already have a Wallet</Button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage