import React from 'react'
import { profilePlaceholderImage } from '@/lib/utils'
import Image from 'next/image'
import { ReviewItem as ReviewItemProps } from '@/lib/types'

type Props = {
    review: ReviewItemProps
}
export const ReviewItem = ({ review }: Props) => {
    const { user, content } = review
    return (
        <div className="space-y-5 mb-4">
            <div className="py-2 rounded-md flex w-full items-center justify-between">
                <div className="flex items-center">
                    <div className="w-10 h-10 relative">
                        <Image
                            fill
                            className="rounded-full object-cover"
                            loading="eager"
                            src={user.photoURL || profilePlaceholderImage}
                            alt={`${user.displayName}-photoURL`}
                            quality={80}
                        />
                    </div>
                    <div className="ml-3">
                        <p className="text-md text-foreground">{user.displayName}</p>
                        <p className="text-sm text-muted">{user.username}</p>
                    </div>
                </div>
                <p
                    className="text-xs hover:bg-transparent text-muted hover:text-accent-3"
                >
                    {content.datePublished}
                </p>
            </div>

            <div className="text-foreground text-sm">{content.body}</div>
        </div>
    )
}
