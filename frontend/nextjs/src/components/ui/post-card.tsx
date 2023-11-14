import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Image from 'next/image'
import Link from 'next/link';
import { HiCheckBadge, HiOutlineHandThumbUp, HiOutlineHandThumbDown, HiOutlineShare } from "react-icons/hi2";
import { Button } from '@/components/ui/button';


const PostCard = ({data}: any) => {
    const {post, author, metadata} = data
    
    return (
        <Link href={metadata.permalink}>
            <Card className='border-none p-5 hover:bg-accent-shade'>
                <CardHeader className='px-0 pt-0'>
                    <div className='flex items-center'>
                        <div className="w-10 h-10 relative">
                            <Image 
                                // width={24}
                                // height={24}
                                fill
                                // placeholder="blur"
                                className='rounded-full object-cover'
                                loading="eager"
                                src={author.avatar}
                                alt={`${author.name}-avatar`}
                                quality={80}
                            />
                        </div>
                        <div className='ml-3'>
                            <div className="flex items-center">
                                <p className='text-md text-foreground'>{author.name}</p>
                                {author.mentor === "true" && <HiCheckBadge className="w-4 h-4 ml-1 text-accent-3" />}
                            </div>
                            <Button variant="ghost" className='text-xs px-0 py-0 rounded-sm h-auto hover:bg-transparent hover:text-accent-3 text-muted'>Follow</Button>
                        </div>
                    </div>
                    
                </CardHeader>
                <CardContent className='space-y-3 px-0'>
                    <CardTitle className='font-bold text-md text-foreground tracking-wide'>{post.title}</CardTitle>
                    <CardDescription className='text-muted text-sm'>{post.body}</CardDescription>
                    <div className="w-full h-[400px] relative">
                    <Image 
                        fill
                        src={post.image}
                        className='rounded-md object-cover'
                        loading="lazy"
                        alt={`${post.title} cover photo`}
                    />
                    </div>
                </CardContent>
                <CardFooter className='pb-0 px-0 flex justify-between'>
                    <div className='flex items-center'>
                        <div className="flex items-center">
                            <Button variant="ghost" aria-label='Upvote a post' size="icon">
                                <HiOutlineHandThumbUp className="h-5 w-5 text-foreground" />
                            </Button>
                            <div className='text-sm text-foreground ml-1'>
                                {metadata.upvotes}
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

        </Link>
    )
}

export default PostCard