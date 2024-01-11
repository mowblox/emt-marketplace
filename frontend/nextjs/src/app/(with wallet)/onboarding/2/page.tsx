import React from 'react'
import Image from 'next/image'
const onboardingPhoto = require('@/assets/onboarding-2.png')
import ProfileDetailsForm from '../_components/profile-details-form'

const OnboardingPageOne = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-9 md:h-full gap-4 mx-4 md:mx-8"
    >
      <div className="mt-0 md:mt-0 md:col-span-3 md:col-start-2">
        <div className="w-full relative h-[346px] md:h-full">
          <Image src={String(onboardingPhoto.default.src)} fill className="object-contain" alt="Onboarding photo" />
        </div>
      </div>
      <div className="md:col-span-3 md:col-start-6 flex flex-col gap-6 justify-start md:justify-center items-center py-[120px]">
        <h4 className='text-xl md:text-xl font-semibold tracking-wider'>Your identity on MEMM! is essential for building connections.</h4>
        <ProfileDetailsForm />
      </div>
    </div>
  )
}

export default OnboardingPageOne