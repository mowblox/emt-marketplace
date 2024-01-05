'use client';
import React from 'react'
import NotificationItem from './_components/notification-item'
import { useQuery } from '@tanstack/react-query'
import useBackend from '@/lib/hooks/useBackend'
import { BuiltNotification, NotificationData, NotificationFilters } from '@/lib/types'
import { Timestamp } from 'firebase/firestore'
import { useUser } from '@/lib/hooks/user';
import DataLoading from '@/components/ui/data-loading';
import NoData from '@/components/ui/no-data';
import InfiniteScroll from '@/components/ui/infinite-scroller';
import { Separator } from '@/components/ui/separator';

const Notifications = () => {
    const { user } = useUser();

    const { fetchNotifications } = useBackend()

    const { data: notifications, isLoading, error } = useQuery({
        queryKey: ['notifications', user],
        queryFn: async (): Promise<BuiltNotification[]> => {
            const lastDocTimeStamp: Timestamp | undefined = notifications?.[notifications.length - 1]?.timestamp;
            const size = 20;
            const n = await fetchNotifications(lastDocTimeStamp, size);
            return n
        },
        enabled: !!user,
    })

    console.log("notifications", notifications, error);
    return (
        <>
            <h4 className='text-xl text-foreground font-bold mb-5'>Notifications</h4>
            <InfiniteScroll
                queryKey={['notifications', user]}
                noDataMessage="No notifications found. Please try later"
                fetcher={(lastDoc) => {
                    return fetchNotifications(lastDoc?.timestamp);
                }}
                className='space-y-5'
                enabled={!!user}
                Separator={<Separator className="bg-border mx-auto my-4 w-[94%] " />
                }
                ItemComponent={NotificationItem} />

        </>
    )
}

export default Notifications