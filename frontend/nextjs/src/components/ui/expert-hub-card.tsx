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
import { HiCheckBadge, HiOutlineFire } from "react-icons/hi2";
import { Button } from '@/components/ui/button';
import { EXPERT_TICKET_PAGE } from '@/app/(with wallet)/_components/page-links';
import useBackend from '@/lib/hooks/useBackend';
import { ExpertTicket } from "@/lib/types";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Voter from './Voter';
import { formatDistance } from 'date-fns';
import { Badge } from './badge';



const ExpertHubCard = ({ data }: { data: ExpertTicket }) => {
    const { price, paymentCurrency, author, metadata } = data

    return (
            <Link href={EXPERT_TICKET_PAGE(metadata.id)} className='w-full md:w-auto'>
        <Card className='border border-stroke/[.1] p-4 bg-glass backdrop-blur-md min-w-[234px] hover:bg-accent-shade'>

                <CardHeader className='px-0 pt-0'>
                    <div className="w-full h-[177px] relative">
                        <Image
                            fill
                            src={metadata.imageURL as string}
                            className='rounded-md object-cover'
                            loading="lazy"
                            alt={`${metadata.title} cover photo`}
                        />
                    </div>
                </CardHeader>
                <CardContent className='space-y-3 px-0'>
                    <div className='w-full'>
                        <div className="flex items-center justify-between w-full">
                            <div className="flex justify-between w-full">
                                <div className="">
                                    <p className='text-md text-foreground'>{author?.displayName}</p>
                                    <p className='text-sm text-muted'>{author?.username}</p>
                                </div>

                                <div className="flex h-[16px] mt-1   items-center text-accent-3">
                                    <p className='text-md text-muted font-semibold'>L{author?.level}</p>
                                    <HiOutlineFire className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap mt-3 capitalize">
                            {author?.tags?.map((tag, key) => (
                                <Badge key={`${tag}-${key}`}>{tag}</Badge>
                            ))}
                        </div>
                    </div>

                </CardContent>

            <CardFooter className='pb-0 px-0 flex justify-between'>
                <div className="flex justify-between w-full items-center">
                    <div className="text-md text-foreground">Price</div>
                    <div className="text-lg font-semibold text-accent-3">${price}</div>
                </div>
            </CardFooter>
        </Card>
            </Link>
    )
}

export default ExpertHubCard