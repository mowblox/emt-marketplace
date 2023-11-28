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
import { POST_PAGE } from '@/app/(with wallet)/_components/page-links';
import useBackend from '@/lib/hooks/useBackend';
import { Content } from "@/lib/types";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Voter from './Voter';
import { formatDistance } from 'date-fns';



const PostCard = ({data}:{data:Content}) => {
    const {post, author, metadata} = data

    return (
        <Card className='border-none p-4 hover:bg-accent-shade'>
                <Link href={POST_PAGE(metadata.id)}>

                <CardHeader className='px-0 pt-0'>
                    <div className='flex items-center'>
                        <div className="w-10 h-10 relative">
                            <Image
                                fill
                                className='rounded-full object-cover'
                                loading="eager"
                                src={author.photoURL!}
                                alt={`${author.displayName}-photoURL`}
                                quality={80}
                            />
                        </div>
                        <div className='ml-3'>
                            <div className="flex items-center">
                                <p className='text-md text-foreground'>{author.displayName}</p>
                                {author.isExpert === true && <HiCheckBadge className="w-4 h-4 ml-1 text-accent-3" />}
                                <div className='ml-2 text-[11px] text-muted'>{formatDistance(post.timestamp.toDate(), new Date(), { addSuffix: true })}</div>
                            </div>
                            <Button variant="ghost" className='text-xs px-0 py-0 rounded-sm h-auto hover:bg-transparent hover:text-accent-3 text-muted'>Follow</Button>
                        </div>
                    </div>
                    
                </CardHeader>
                <CardContent className='space-y-3 px-0'>
                    <CardTitle className='font-bold text-md text-foreground tracking-wide'>{post.title}</CardTitle>
                    <CardDescription className='text-muted text-sm' dangerouslySetInnerHTML={{ __html: post.body }} />
                    <div className="w-full h-[400px] relative">
                    <Image 
                        fill
                        src={post.imageURL as string}
                        className='rounded-md object-cover'
                        loading="lazy"
                        alt={`${post.title} cover photo`}
                    />
                    </div>
                </CardContent>
        </Link>

                <CardFooter className='pb-0 px-0 flex justify-between'>
<Voter   post={data}  />

                    <Button variant="ghost" aria-label='Share post' size="icon">
                        <HiOutlineShare className="h-5 w-5 text-foreground" />
                    </Button>
                </CardFooter>
            </Card>
    )
}

export default PostCard