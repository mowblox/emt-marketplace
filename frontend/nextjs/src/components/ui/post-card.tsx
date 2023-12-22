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
import { Button } from '@/components/ui/button';
import { POST_PAGE, PROFILE_PAGE } from '@/app/(with wallet)/_components/page-links';
import { Content, POST_TYPES } from "@/lib/types";
import Voter from '@/components/ui/voter';
import { formatDistance } from 'date-fns';
import { RichTextDisplayContainer } from '@/components/ui/rich-text-display-container';
import { Badge } from './badge';



const PostCard = ({ data }: { data: Content }) => {
    const { post, author, metadata } = data

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
                                <Button variant="link" className='px-0 py-0 hover:text-accent-3' asChild><Link href={PROFILE_PAGE(author.uid)}>
                                    <p className='text-md text-foreground'>{author?.displayName}</p>
                                </Link></Button>
                                {author?.isExpert === true && <HiCheckBadge className="w-4 h-4 ml-1 text-accent-3" />}
                                <div className='ml-2 text-[11px] text-muted'>{formatDistance(post.timestamp.toDate(), new Date(), { addSuffix: true })}</div>
                            </div>
                            {/* <Button variant="ghost" className='text-xs px-0 py-0 rounded-sm h-auto hover:bg-transparent hover:text-accent-3 text-muted'>Follow</Button> */}
                        </div>
                    </div>

                </CardHeader>
                <CardContent className='space-y-3 px-0'>
                    {post.postType == POST_TYPES.Question && <div><Badge className='bg-accent-4'>Question</Badge></div>}
                    {post.postType == POST_TYPES.Answer && <div>
                        <div className='p-3 rounded-md bg-glass border 2border-alt-stroke mt-3 flex items-center mb-2'>
                            <div className="w-12 h-12 relative">
                                <Image
                                    fill
                                    src={post.imageURL as string}
                                    className='rounded-md object-cover'
                                    loading="lazy"
                                    alt={`${post.title} cover photo`}
                                />
                            </div>
                            <div className='ml-3'>
                                <Badge className='bg-accent-4 mb-1'>Responding to...</Badge>
                                <CardTitle className='font-semibold text-sm text-foreground tracking-wide'>{post.title}</CardTitle>
                            </div>
                        </div>
                    </div>}

                    <CardTitle className='font-bold text-md text-foreground tracking-wide'>{post.title}</CardTitle>
                    <RichTextDisplayContainer richText={post.body} isExcerpt={true} />
                    <div className="w-full h-[320px] relative">
                        <Image
                            fill
                            src={post.imageURL as string}
                            className='rounded-md object-cover'
                            loading="lazy"
                            alt={`${post.title} cover photo`}
                        />
                    </div>
                    {post.tags && <div> <div className='flex gap-3 flex-wrap w-full mt-4'>
                        {post.tags.map((tag, key) => <Badge key={`tag-${tag}-${key}`}>{tag}</Badge>)}
                    </div></div>}
                </CardContent>
            </Link>

            <CardFooter className='pb-0 px-0 flex justify-between'>
                <Voter post={data} />

                <Button variant="ghost" aria-label='Share post' size="icon">
                    <HiOutlineShare className="h-5 w-5 text-foreground" />
                </Button>
            </CardFooter>
        </Card>
    )
}

export default PostCard