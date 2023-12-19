import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { HOME_PAGE } from "./(with wallet)/_components/page-links"
import Link from "next/link"
const welcomePhoto = require('@/assets/welcome-photo.png')

const WelcomePage = () => {
  return (
    <div className="bg-[url('/img/sky-bg.png')] h-screen w-full">
      <section className="grid grid-cols-1 md:grid-cols-9 md:h-full gap-4 mx-4 md:mx-8"
      >
        <div className="mt-24 md:mt-0 md:col-span-3 md:col-start-2 w-full relative h-[346px] md:h-full">
          <Image src={String(welcomePhoto.default.src)} fill className="object-contain" alt="Onboarding photo" />
        </div>
        <div className="md:col-span-3 md:col-start-6 flex flex-col gap-6 justify-start md:justify-center items-center">
          <Link href={HOME_PAGE}>
            <h2 className="text-xl font-semibold text-accent-3">MEMM!</h2>
          </Link>
          <h4 className='text-xl md:text-xl font-semibold tracking-wider'>Unlock Your Personal Growth</h4>

          <p className="text-sm text-foreground text-center">
            Embark on a journey of growth and learning with MEMM! Whether you're eager to share your expertise or seeking guidance to navigate your professional journey, MEMM! is your gateway to a community of mentors and learners.
          </p>
        </div>
      </section>

      <section className="text-center md:h-full gap-4 mx-4 md:mx-8"
      >
        <div className="flex flex-col gap-6 justify-start md:justify-center items-center">
          <h4 className='text-xl md:text-xl font-semibold tracking-wider'>How Does MEMM! Work?</h4>

          <p className="text-sm text-foreground text-center">
            At MEMM!, we're redefining mentorship through innovation and decentralization. Imagine a world where knowledge flows freely, connections are genuine, and growth is boundless.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-9 md:h-full gap-4 mx-4 md:mx-8"
      >
        <div className="mt-24 md:mt-0 md:col-span-3 md:col-start-2 w-full relative h-[346px] md:h-full">
          <Image src={String(welcomePhoto.default.src)} fill className="object-contain" alt="Onboarding photo" />
        </div>
        <div className="md:col-span-3 md:col-start-6 flex flex-col gap-6 justify-start md:justify-center items-center">
          <Link href={HOME_PAGE}>
            <h2 className="text-xl font-semibold text-accent-3">MEMM!</h2>
          </Link>
          <h4 className='text-xl md:text-xl font-semibold tracking-wider'>Unlock Your Personal Growth</h4>

          <p className="text-sm text-foreground text-center">
            Embark on a journey of growth and learning with MEMM! Whether you're eager to share your expertise or seeking guidance to navigate your professional journey, MEMM! is your gateway to a community of mentors and learners.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-9 md:h-full gap-4 mx-4 md:mx-8"
      >
        <div className="mt-24 md:mt-0 md:col-span-3 md:col-start-2 w-full relative h-[346px] md:h-full">
          <Image src={String(welcomePhoto.default.src)} fill className="object-contain" alt="Onboarding photo" />
        </div>
        <div className="md:col-span-3 md:col-start-6 flex flex-col gap-6 justify-start md:justify-center items-center">
          <Link href={HOME_PAGE}>
            <h2 className="text-xl font-semibold text-accent-3">MEMM!</h2>
          </Link>
          <h4 className='text-xl md:text-xl font-semibold tracking-wider'>Unlock Your Personal Growth</h4>

          <p className="text-sm text-foreground text-center">
            Embark on a journey of growth and learning with MEMM! Whether you're eager to share your expertise or seeking guidance to navigate your professional journey, MEMM! is your gateway to a community of mentors and learners.
          </p>
        </div>
      </section>
    </div>
  )
}

export default WelcomePage