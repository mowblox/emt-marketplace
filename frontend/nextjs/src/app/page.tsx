import Image from 'next/image'
import { CREATE_A_POST_PAGE, HOME_PAGE } from "./(with wallet)/_components/page-links"
import Link from "next/link"
import { LuUser2 } from "react-icons/lu";
import { RiTokenSwapLine } from "react-icons/ri";
import { HiOutlineIdentification } from "react-icons/hi2";
import { BiEdit } from "react-icons/bi";
import { Button } from '@/components/ui/button';

const welcomePhoto = require('@/assets/welcome-photo.png')

const WelcomePage = () => {
  const userSteps = [
    {
      icon: LuUser2,
      title: "Create Your Profile",
      body: "Join MEMM! by crafting a profile that showcases your skills and aspirations. Your blockchain-verified identity ensures a secure and trustworthy environment.",
    },
    {
      icon: HiOutlineIdentification,
      title: "Explore Mentor Profiles",
      body: "Discover a diverse range of mentors across industries. Upvote mentors who inspire you and downvote to help maintain a vibrant and respectful community.",
    },
    {
      icon: BiEdit,
      title: "Post & Share Knowledge",
      body: "Contribute to the mentorship ecosystem by posting insightful articles. Earn reputation points through upvotes, establishing yourself as a thought leader.",
    },
    {
      icon: RiTokenSwapLine,
      title: "Token-Based Sessions",
      body: "Invest in your growth journey with Mentor Tokens. Purchase tokens to book one-on-one sessions with your chosen mentor and elevate your skills to new heights.",
    },
  ]
  return (
    <>
      <header className="border-b">
        <div className=" flex-col md:flex">
          <div className="container flex items-center justify-between py-4 md:h-16">
            <Link href={HOME_PAGE}>
            <h2 className="text-lg font-semibold text-accent-3">MEMM!</h2>
            </Link>
            <div className="ml-auto flex items-center space-x-2 sm:justify-end">
            <Button
              variant="outline"
              className="w-full border"
              asChild>
              <Link
                href={HOME_PAGE}>
                Home
              </Link>
            </Button>
            <Button
              variant="default"
              className="w-full"
              asChild>
              <Link
                href={CREATE_A_POST_PAGE}>
                Create a Post
              </Link>
            </Button>
            </div>
          </div>
        </div>
      </header>
    
    <div className=" h-screen w-full container">
      <div className="bg-[url('/img/sky-bg.png')] bg-scroll fixed -z-50 h-screen w-full"></div>
      <section className="grid grid-cols-1 md:grid-cols-9 md:h-[80%] gap-4 relative "
      >
        <div className="mt-24 md:mt-0 md:col-span-3 md:col-start-2 w-full relative h-[346px] md:h-full">
          <Image src={String(welcomePhoto.default.src)} fill className="object-contain" alt="Onboarding photo" />
        </div>
        <div className="md:col-span-3 md:col-start-6 flex flex-col gap-6 justify-start md:justify-center items-center">
          <Link href={HOME_PAGE}>
            <h2 className="text-xl font-semibold text-accent-3">MEMM!</h2>
          </Link>
          <h4 className='text-xl md:text-xl font-semibold tracking-wider'>Unlock Your Personal Growth</h4>

          <p className="text-sm text-muted text-center">
            Embark on a journey of growth and learning with MEMM! Whether you're eager to share your expertise or seeking guidance to navigate your professional journey, MEMM! is your gateway to a community of mentors and learners.
          </p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute bottom-[4px] right-[250px] hidden md:block" width="99" height="155" viewBox="0 0 99 155" fill="none">
  <path d="M11.2 148.495C18.4784 145.82 25.4518 143.224 32.4299 140.656C33.819 140.138 34.7998 139.774 36.6482 139.411C38.0181 139.127 40.9361 138.588 40.9288 140.122C40.7907 141.388 40.5313 142.269 38.2032 143.405C32.1766 146.307 25.767 148.29 19.4183 150.291C13.811 152.054 9.5083 153.314 4.45521 154.581C2.09524 155.172 0.943237 154.148 0.862556 151.906C0.790866 149.894 0.681736 147.83 0.989887 145.842C2.06173 138.669 3.31638 131.552 4.50545 124.388C4.64763 123.497 4.70508 122.793 5.02572 121.757C5.42643 120.506 5.64841 119.573 6.91444 119.711C8.11953 119.83 8.34182 121.528 8.28408 122.405C7.96234 129.744 7.0461 144.872 7.18075 145.689C10.478 142.716 13.5918 140.034 16.5606 137.173C37.1401 117.154 56.1179 95.8372 69.7985 70.2768C80.6282 50.044 88.8754 28.8784 93.8511 6.45977C94.1535 5.13773 94.573 3.82526 95.0019 2.5691C95.5582 0.858222 96.1504 0.0666142 97.0552 0.293228C98.6955 0.947849 98.6137 2.20462 98.6355 3.21297C98.7072 5.22505 98.352 7.27859 98.0157 9.27122C93.2394 35.8782 82.6842 60.2291 68.8811 83.2943C54.7159 106.969 35.8489 126.503 15.254 144.501C14.1316 145.409 11.5668 147.914 11.2 148.495Z" fill="url(#paint0_linear_565_8899)"/>
  <defs>
    <linearGradient id="paint0_linear_565_8899" x1="120.569" y1="135.449" x2="-29.4791" y2="20.2222" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EC4899"/>
      <stop offset="1" stop-color="#F87171"/>
    </linearGradient>
  </defs>
</svg>
      </section>

      <section className="flex flex-col justify-center items-center text-center md:h-full my-12 mb-22 gap-4 "
      >
        <div className="flex flex-col gap-6 justify-start md:justify-center items-center max-w-[577px]">
          <h4 className='text-2xl md:text-xl font-semibold tracking-wider'>How Does MEMM! Work?</h4>

          <p className="text-sm text-muted text-center">
            At MEMM!, we're redefining mentorship through innovation and decentralization. Imagine a world where knowledge flows freely, connections are genuine, and growth is boundless.
          </p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="156" height="174" viewBox="0 0 156 174" fill="none">
  <path d="M61.3607 148.701C59.9737 146.414 59.0118 144.713 58.1095 143.118C56.9453 141.059 55.8801 139.175 54.1284 136.433C53.1145 134.845 51.9316 133.29 50.8502 131.871C49.6335 130.249 47.6058 128.795 45.4767 129.742C43.5841 130.485 43.9897 134 44.6656 135.419C48.8796 144.054 53.3764 152.56 57.8645 161.049L57.8665 161.053L57.9248 161.163C58.5637 162.372 59.2023 163.58 59.8399 164.788C61.0227 167.052 62.4083 169.249 63.9292 171.243C66.7342 174.893 70.4855 174.994 72.7499 171.04C78.6303 160.8 84.2066 150.391 89.7153 139.948C90.2899 138.867 90.6278 136.568 89.3098 135.622C87.9241 134.879 86.0654 136.501 85.4233 137.582C82.9599 141.534 80.6549 145.573 78.3432 149.624C77.4517 151.186 76.5593 152.75 75.6563 154.311C75.0818 155.325 74.4734 156.339 74.3721 156.508C74.3998 148.585 74.4402 140.609 74.4808 132.595C74.5885 111.313 74.6975 89.7643 74.5748 68.2334C74.4945 52.7815 74.011 37.3083 73.5278 21.8475C73.4012 17.797 73.2747 13.7474 73.1554 9.69917C72.9864 3.92004 71.398 1.21645 68.4916 1.68951C64.093 2.4126 64.2064 5.87511 64.3068 8.9406C64.319 9.31386 64.331 9.68124 64.3347 10.0371C64.3854 25.5832 64.4953 41.1292 64.6051 56.6753C64.715 72.2214 64.8248 87.7674 64.8755 103.313C64.8987 113.677 64.7462 124.04 64.5937 134.403C64.5244 139.113 64.4551 143.823 64.4023 148.532C64.4023 149.309 64.3685 152.959 64.3347 153.737C63.5236 152.25 62.4759 150.526 61.3607 148.701Z" fill="url(#paint0_linear_565_8900)"/>
  <path d="M15.6282 119.86L15.6289 119.858C17.5272 115.239 19.312 110.896 20.941 106.49C21.0217 106.275 21.1101 106.054 21.2024 105.828C21.262 105.682 21.3233 105.534 21.3853 105.384C22.4335 102.854 23.6721 99.8641 20.265 98.2781C16.718 96.6387 15.353 99.6524 14.2223 102.149C14.071 102.483 13.9238 102.808 13.7763 103.111C9.38284 112.033 5.22596 121.056 1.06908 130.114C-0.113807 132.716 -0.789706 135.318 1.64359 137.954C4.21208 140.759 6.91573 139.948 9.72076 138.934C20.5692 135.014 30.4714 129.404 39.1231 121.732C40.0018 120.955 41.1171 119.468 40.5087 118.049C39.5963 116.866 37.6699 117.474 36.5884 117.981C34.233 119.036 31.9488 120.287 29.2832 121.747C28.2772 122.298 27.2169 122.879 26.0779 123.49C38.0754 105.037 44.3952 85.5709 48.4507 65.3272C52.3034 46.1312 54.6016 26.8 52.2359 7.1985C52.0669 5.74532 51.8303 4.2244 51.3572 2.90637C51.3257 2.82112 51.2954 2.73845 51.266 2.65825C50.6318 0.926636 50.4225 0.35524 48.4845 0C46.8285 0 45.9837 2.19675 45.7471 3.48093C45.2946 6.16933 45.1565 8.94153 45.0192 11.6985C44.9822 12.442 44.9452 13.1844 44.9022 13.9238C43.2462 42.2109 39.2245 70.0924 29.4237 96.8924C25.8076 106.761 21.7859 116.46 14.8239 124.605C14.3846 125.044 13.9453 125.484 12.8638 126.633C13.8076 124.289 14.7306 122.044 15.6282 119.86Z" fill="url(#paint1_linear_565_8900)"/>
  <path d="M125.916 116.681C126.094 116.754 126.273 116.827 126.451 116.9C130.507 118.522 138.888 121.53 138.956 121.394C138.212 120.55 137.471 119.703 136.73 118.856C134.506 116.315 132.281 113.774 130 111.29C109.114 88.4098 93.4329 62.4209 84.2742 32.8158C82.1472 25.8823 81.1717 18.5425 80.2035 11.2576C79.9872 9.62981 79.7712 8.00468 79.5428 6.38745C79.3063 4.69768 80.1174 0.94635 82.0099 0.94635C83.7461 0.94635 84.6567 3.74043 85.2342 5.51253L85.2881 5.67778C86.5179 9.4447 87.6485 13.2464 88.7787 17.0467C90.5991 23.1679 92.4185 29.2857 94.6495 35.2491C105.836 65.2597 124.221 90.9107 144.464 115.345C144.735 115.649 146.391 117.44 145.952 116.19C145.508 113.829 145.059 111.515 144.615 109.233C143.605 104.035 142.627 99.0017 141.828 93.9523C141.766 93.5597 141.674 93.1387 141.58 92.7044C141.067 90.3348 140.468 87.5692 143.924 86.8552C147.538 86.1324 148.229 89.3545 148.771 91.8751C148.811 92.0652 148.851 92.2514 148.892 92.4315C151.291 103.179 153.589 113.926 155.685 124.74C157.138 132.142 153.488 135.386 146.391 132.817C143.042 131.597 139.833 129.918 136.625 128.241C135.657 127.734 134.689 127.228 133.717 126.734C132.981 126.357 132.242 125.982 131.503 125.607C127.936 123.796 124.358 121.979 120.943 119.907C119.726 119.164 117.8 117.88 118.374 115.953C118.746 114.906 120.537 114.939 122.7 115.514C123.772 115.804 124.844 116.242 125.916 116.681Z" fill="url(#paint2_linear_565_8900)"/>
  <defs>
    <linearGradient id="paint0_linear_565_8900" x1="0" y1="173.993" x2="163.646" y2="-4.06134" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EC4899"/>
      <stop offset="1" stop-color="#F87171"/>
    </linearGradient>
    <linearGradient id="paint1_linear_565_8900" x1="0" y1="173.993" x2="163.646" y2="-4.06134" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EC4899"/>
      <stop offset="1" stop-color="#F87171"/>
    </linearGradient>
    <linearGradient id="paint2_linear_565_8900" x1="0" y1="173.993" x2="163.646" y2="-4.06134" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EC4899"/>
      <stop offset="1" stop-color="#F87171"/>
    </linearGradient>
  </defs>
</svg>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 min-h-[500px] gap-8 w-full bg-accent-shade container py-12 md:py-0 rounded-lg"
      >
        {userSteps.map((step, key) => <div key={`user-steps-${key}`} className="flex flex-col gap-6 justify-start md:justify-center items-center ">
          <div className="rounded-full bg-accent-1 p-8">
            <step.icon className="text-muted" size="62px" />
          </div>
          <h4 className='text-lg md:text-xl font-semibold text-center tracking-wider'>{step.title}</h4>

          <p className="text-sm text-muted text-center leading-6">
            {step.body}
          </p>
        </div>)}
      </section>

      <section className="flex flex-col justify-center items-center text-center md:h-full gap-4 "
      >
        <div className="flex flex-col gap-6 justify-start md:justify-center items-center max-w-[577px] my-[110px]">
          <h4 className='text-xl md:text-xl font-semibold tracking-wider'>Ready to Dive In? Start Your MEMM! Journey Today!</h4>

          <p className="text-sm text-muted text-center">
            Whether you're a seasoned professional or just starting your career, there's a mentor waiting to guide you.
          </p>

          <div className="flex items-center flex-col md:flex-row w-full md:w-2/3 gap-4">
            <Button
              variant="outline"
              className="w-full border"
              asChild>
              <Link
                href={HOME_PAGE}>
                Home
              </Link>
            </Button>
            <Button
              variant="default"
              className="w-full"
              asChild>
              <Link
                href={CREATE_A_POST_PAGE}>
                Create a Post
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
    </div>
    </>
  )
}

export default WelcomePage