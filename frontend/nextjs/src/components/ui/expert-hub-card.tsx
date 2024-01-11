"use client";
import React from 'react'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card"
import Image from 'next/image'
import Link from 'next/link';
import { HiOutlineFire } from "react-icons/hi2";
import { EXPERT_TICKET_PAGE } from '@/app/(with wallet)/_components/page-links';
import { ExptListingWithAuthorProfile } from "@/lib/types";
import { Badge } from './badge';


type Props = {
    data: ExptListingWithAuthorProfile,
    disableLink?: boolean;
    type?: "link" | "modal";
}


const ExpertHubCard = ({ data, disableLink = false, type = "link" }: Props) => {
    const { price, imageURL, collectionName, id, authorProfile } = data

    const CardTemplate = () => (<Card className='border border-stroke/[.1] p-4 bg-glass backdrop-blur-md min-w-[230px] hover:bg-accent-shade'>

        <CardHeader className='px-0 pt-0'>
            <div className="w-full h-[177px] relative">
                <Image
                    fill
                    src={imageURL as string}
                    className='rounded-md object-cover'
                    loading="lazy"
                    alt={`${collectionName} cover photo`}
                />
            </div>
        </CardHeader>
        <CardContent className='space-y-3 px-0'>
            <div className='w-full'>
                <div className="flex items-center justify-between w-full">
                    <div className="flex justify-between w-full">
                        <div className="">
                            <p className='text-md text-foreground'>{authorProfile.displayName}</p>
                            <p className='text-sm text-muted'>@{authorProfile.username}</p>
                        </div>

                        <div className="flex h-[16px] mt-1   items-center text-accent-3">
                            <p className='text-md text-muted font-semibold'>L{authorProfile.level}</p>
                            <HiOutlineFire className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 overflow-hidden mt-3 capitalize">
                    {authorProfile.tags?.map((tag, key) => {
                        if(key>2) return;
                        return <Badge key={`${tag}-${key}`}>{tag}</Badge>
                    })}
                </div>
            </div>

        </CardContent>

        <CardFooter className='pb-0 px-0 flex justify-between'>
            <div className="flex justify-between w-full items-center">
                <div className="text-md text-foreground">Price</div>
                <div className="text-lg font-semibold text-accent-3">${price}</div>
            </div>
        </CardFooter>
    </Card>)

    if (type == "modal") {
        return <CardTemplate />
    }

    return (
        <Link
            href={EXPERT_TICKET_PAGE(id)}
            className='w-full md:w-auto'
            style={{
                pointerEvents: (disableLink) ? "none" : "auto",
            }} >
            <CardTemplate />
        </Link>
    )


}

export default ExpertHubCard