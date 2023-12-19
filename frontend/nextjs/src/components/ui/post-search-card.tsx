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
import { HiCheckBadge, HiOutlineShare } from "react-icons/hi2";
import { POST_PAGE } from '@/app/(with wallet)/_components/page-links';
import { Content, POST_TYPES } from "@/lib/types";
import VoteCount from './vote-count';
import { formatDistance } from 'date-fns';
import { Badge } from './badge';



const PostSearchCard = ({ data }: { data: Content }) => {
    const { post, author, metadata } = data

    console.log(post.postType, post.postType == POST_TYPES.Question)

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
                                src={author?.photoURL!}
                                alt={`${author?.displayName}-photoURL`}
                                quality={80}
                            />
                        </div>
                        <div className='ml-3'>
                            <div className="flex items-center">
                                <p className='text-md text-foreground'>{author?.displayName}</p>
                                {author?.isExpert === true && <HiCheckBadge className="w-4 h-4 ml-1 text-accent-3" />}
                                <div className='ml-2 text-[11px] text-muted'>{formatDistance(post.timestamp.toDate(), new Date(), { addSuffix: true })}</div>
                            </div>
                        </div>
                    </div>

                </CardHeader>
                <CardContent className='space-y-3 px-0'>
                    {post.postType == POST_TYPES.Question && <div><Badge className='bg-accent-4'>Question</Badge></div>}
                    {post.postType == POST_TYPES.Answer && <div><Badge className='bg-accent-4 mb-1'>Responding to...</Badge></div>}

                    <div className="flex justify-between">
                        <div className="flex flex-col justify-start">
                            <CardTitle className='font-bold text-md text-foreground tracking-wide'>{post.title}</CardTitle>
                            <VoteCount post={data} />
                        </div>

                        <div className="w-[118px] h-[92px] relative">
                            <Image
                                fill
                                src={post.imageURL as string}
                                className='rounded-md object-cover'
                                loading="lazy"
                                alt={`${post.title} cover photo`}
                            />
                        </div>
                    </div>
                </CardContent>
            </Link>
        </Card>
    )
}

export default PostSearchCard