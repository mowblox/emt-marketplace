import React from 'react'
import Image from 'next/image'
import {cn} from "@/lib/utils"
import { BuiltNotification } from '@/lib/types';
import Link from 'next/link';

type Props = {
    data: BuiltNotification;
}

const NotificationItem = ({ data }: Props) => {
    return (
        <Link href={data.href}>
        <div className={cn(
            'w-full border px-4 py-4 rounded-md bg-accent-shade flex items-start justify-between',
            data.isNew ? "border-accent-2 border-2 shadow-custom" : "border-stroke"
            )}>
            <div className="w-10 h-10 relative">
                <Image
                    fill
                    className='rounded-full object-cover'
                    loading="eager"
                    src={data.photoURL}
                    alt={`${data.username}-photoURL`}
                    quality={80}
                />
            </div>

            <div className="w-full flex flex-col gap-3 ml-3">
                <div className="flex justify-between items-center w-full">
                    <div className="flex">
                        <span className="text-muted text-sm capitalize font-bold mr-1.5">{data.username}</span> 
                        <span className="text-muted text-sm">{data.summary}</span>
                    </div>
                    <div className="text-muted text-xs">
                        {data.datePublished}
                    </div>
                </div>

                <div className="w-full border rounded-md p-4 text-md text-foreground">{data.message}</div>

                <div className="flex justify-between items-center w-full">
                    
                    <div className="text-muted text-xs">
                        {data.votes} {data.type}s
                    </div>
                </div>
            </div>
        </div>
        </Link>
    )
}

export default NotificationItem