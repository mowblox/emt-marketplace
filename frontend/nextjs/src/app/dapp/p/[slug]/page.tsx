import React from 'react'
import { HiCheckBadge, HiOutlineHandThumbUp, HiOutlineHandThumbDown, HiOutlineShare, HiOutlineFire } from 'react-icons/hi2'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RightSidebar } from '../../_components/right-sidebar'

const Post = ({ params }: { params: { slug: string } }) => {
  const post = {
    title: "I’m an experienced CEO. I applied for 1001 positions. This is what happened.",
    body: `Facilisi at lorem semper eget. Eget posuere dictumst velit lacus est. Fringilla quam sollicitudin diam sollicitudin magna. Arcu ullamcorper nisl at aliquet luctus. Vitae commodo dictum sed et. In ultrices eu curabitur neque pulvinar ac eget ullamcorper lorem. Velit vitae id sit gravida mi viverra. Non ipsum nunc sed risus fermentum sed in. Lectus donec dignissim diam sed non tortor. Nibh euismod id tincidunt scelerisque cras est. Tincidunt mollis commodo urna scelerisque nibh at sed. Amet odio erat congue diam in.

    Elit tellus velit diam suspendisse eget. Sed in et accumsan amet id sed ultrices lorem mollis. Donec tempus sapien pellentesque est pretium et. Ut euismod vitae feugiat donec amet euismod arcu egestas dis. Elementum neque suspendisse facilisis mi ullamcorper purus aliquam adipiscing. Sagittis non tristique sed sed purus magna sem. Integer non habitasse ornare in amet mauris id. Nulla condimentum ipsum aliquam urna vitae consequat. Nec lobortis aenean auctor imperdiet facilisis vel. Cras amet euismod neque dictumst vestibulum. Faucibus orci accumsan ipsum eget nunc magnis elit. Quam ultricies turpis scelerisque aliquet amet enim venenatis non. Iaculis hac in aliquet sed blandit vestibulum etiam. Adipiscing adipiscing augue senectus tempor. Mauris pellentesque consequat aliquet sagittis.
    
    In diam vestibulum eu tellus suspendisse non vestibulum. Ut ipsum risus suscipit amet quam a mi. Pellentesque est in amet in. Vitae urna laoreet non eu. Euismod ut quis elit risus massa. Posuere amet massa pulvinar cursus morbi nibh varius quam proin. Et tortor risus elementum morbi ante tortor adipiscing pretium vestibulum.`,
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    author: {
      name: "Naval",
      avatar: "https://images.unsplash.com/photo-1640960543409-dbe56ccc30e2?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      mentor: "true"
    },
    metadata: {
      upvotes: 314,
      downvotes: 42
    }
  }

  const topCreatorList = [
    {
      name: "Naval",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
      mentor: "false",
      skill: "UI Design",
      href: "/profile/naval",
      ment: 134
    },
    {
      name: "Naval",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
      mentor: "true",
      skill: "Java",
      href: "/profile/naval",
      ment: 693
    },
    {
      name: "Naval",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
      mentor: "true",
      skill: "Ruby",
      href: "/profile/naval",
      ment: 953
    },
    {
      name: "Naval",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
      mentor: "true",
      skill: "AI",
      href: "/profile/naval",
      ment: 422
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 col-span-4">
      <div className="h-full px-4 py-6 lg:px-6 col-span-1 md:col-span-4 md:border-x">
      <ScrollArea className="h-[90vh] w-full">
        <Card className='border-none'>
                <CardHeader className='px-0 pt-0'>
                    <div className='flex items-center'>
                        <div className="w-10 h-10 relative">
                            <Image
                                fill
                                className='rounded-full object-cover'
                                loading="eager"
                                src={post.author.avatar}
                                alt={`${post.author.name}-avatar`}
                                quality={80}
                            />
                        </div>
                        <div className='ml-3'>
                            <div className="flex items-center">
                                <p className='text-md text-foreground'>{post.author.name}</p>
                                {post.author.mentor === "true" && <HiCheckBadge className="w-4 h-4 ml-1 text-accent-3" />}
                                <div className='ml-2 text-[11px] text-muted'>20 secs. ago</div>
                            </div>
                            <Button variant="ghost" className='text-xs px-0 py-0 rounded-sm h-auto hover:bg-transparent hover:text-accent-3 text-muted'>Follow</Button>
                        </div>
                    </div>
                    
                </CardHeader>
                <CardContent className='space-y-5 px-0'>
                    <div className="w-full h-[400px] relative">
                      <Image 
                          fill
                          src={post.image}
                          className='rounded-md object-cover'
                          loading="lazy"
                          alt={`${post.title} cover photo`}
                      />
                    </div>
                    <CardTitle className='font-bold text-3xl text-foreground tracking-wide'>{post.title}</CardTitle>
                    <CardDescription className='text-muted text-sm'>{post.body}</CardDescription>
                </CardContent>
                <Separator className="bg-border mb-3" />
                <CardFooter className='pb-0 px-0 flex justify-between'>

                    <div className='flex items-center'>
                        <div className="flex items-center">
                            <Button variant="ghost" aria-label='Upvote a post' size="icon">
                                <HiOutlineHandThumbUp className="h-5 w-5 text-foreground" />
                            </Button>
                            <div className='text-sm text-foreground ml-1'>
                                {post.metadata.upvotes}
                            </div>
                            
                        </div>
                        <div className="flex items-center ml-2">
                            <Button variant="ghost" aria-label='Upvote a post' size="icon">
                                <HiOutlineHandThumbDown className="h-5 w-5 text-foreground" />
                            </Button>
                        </div>
                    </div>

                    <Button variant="ghost" aria-label='Upvote a post' size="icon">
                        <HiOutlineShare className="h-5 w-5 text-foreground" />
                    </Button>
                </CardFooter>
            </Card>
            </ScrollArea>
      </div>
      <RightSidebar className="hidden md:block min-h-[94vh] col-span-2 lg:col-span-2" >
        <>

          <div className="mb-8">
            <h2 className="mb-1 text-md pl-3 font-semibold tracking-tight">
              Top Creators
            </h2>
            <div className="flex flex-col gap-y-0">
              {topCreatorList.map((profile, key) => {
                return <Link href={profile.href} key={`top-creator-${key}`} className="px-3 py-2 rounded-md flex w-full items-center justify-between hover:bg-accent-shade">
                  <div className='flex items-center'>
                    <div className="w-10 h-10 relative">
                      <Image
                        fill
                        className='rounded-full object-cover'
                        loading="eager"
                        src={profile.avatar}
                        alt={`${profile.name}-avatar`}
                        quality={80}
                      />
                    </div>
                    <div className='ml-3'>
                      <div className="flex items-center">
                        <p className='text-md text-foreground'>{profile.name}</p>
                        {profile.mentor === "true" && <HiCheckBadge className="w-4 h-4 ml-1 text-accent-3" />}
                      </div>
                      <Badge>{profile.skill}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted">
                    <HiOutlineFire className="w-4 h-4 ml-1 text-muted" />
                    <div className="ml-1">
                      245 MENT
                    </div>
                  </div>
                </Link>
              })}


            </div>
          </div>

          <div className="">
            <h2 className="mb-1 text-md pl-3 font-semibold tracking-tight">
              Who to Follow
            </h2>
            <div className="flex flex-col gap-y-0">
              {topCreatorList.map((profile, key) => {
                return <Link href={profile.href} key={`top-creator-${key}`} className="px-3 py-2 rounded-md flex w-full items-center justify-between hover:bg-accent-shade">
                  <div className='flex items-center'>
                    <div className="w-10 h-10 relative">
                      <Image
                        fill
                        className='rounded-full object-cover'
                        loading="eager"
                        src={profile.avatar}
                        alt={`${profile.name}-avatar`}
                        quality={80}
                      />
                    </div>
                    <div className='ml-3'>
                      <div className="flex items-center">
                        <p className='text-md text-foreground'>{profile.name}</p>
                        {profile.mentor === "true" && <HiCheckBadge className="w-4 h-4 ml-1 text-accent-3" />}
                      </div>
                      <Badge>{profile.skill}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted">
                    <HiOutlineFire className="w-4 h-4 ml-1 text-muted" />
                    <div className="ml-1">
                      245 MENT
                    </div>
                  </div>
                </Link>
              })}


            </div>
          </div>
        </>
      </RightSidebar>
    </div>
  )
}

export default Post