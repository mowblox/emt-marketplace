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
import { POST_PAGE, PROFILE_PAGE } from '@/app/(with wallet)/_components/page-links';
import { Content, POST_TYPES } from "@/lib/types";
import { formatDistance } from 'date-fns';
import { Badge } from './badge';
import { Button } from './button';



const ProfileSearchCard = ({ data }: { data: Content }) => {
    const { post, author, metadata } = data

    return (
        <Card className='border-none p-4 hover:bg-accent-shade'>
            <Link href={PROFILE_PAGE(author.uid)}>

                <CardHeader className='px-0 pt-0 pb-0'>
                    <div className="flex items-center justify-between w-full">

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
                                </div>
                                <Badge>
                                    {author.skill || author.tags?.[0]}
                                </Badge>
                            </div>
                        </div>
                        <Button variant="default" className='text-xs rounded-sm h-auto hover:bg-accent-3 rounded-full hover:text-foreground text-muted'>Follow</Button>

                    </div>

                </CardHeader>
            </Link>
        </Card>
    )
}

export default ProfileSearchCard