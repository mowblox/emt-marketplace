import React from 'react'
import Image from 'next/image'
import FavouriteTopicsForm from '../_components/favourite-topics-form'

const onboardingPhoto = require('@/assets/onboarding-3.png')

const OnboardingPageOne = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-9 md:h-full gap-4 mx-4 md:mx-8"
    >
      <div className="mt-24 md:mt-0 md:col-span-3 md:col-start-2 w-full relative h-[346px] md:h-full">
        <Image src={String(onboardingPhoto.default.src)} fill className="object-contain" alt="Onboarding photo"/>
      </div>
      <div className="md:col-span-3 md:col-start-6 flex flex-col gap-6 justify-start md:justify-center items-center">
        <h4 className='text-xl font-semibold tracking-wider'>Now, let's highlight your areas of expertise. This will help us connect you with mentors and learners who align with your interests.</h4>
        <p className='text-muted'>Select the fields in which you excel or have knowledge to share. </p>
        <FavouriteTopicsForm />
      </div>
    </div>
  )
}

export default OnboardingPageOne