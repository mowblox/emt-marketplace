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

const Notifications = () => {
    const {user} = useUser();
    console.log("notifs", user)
    const dummyNotifications = [
        {
            datePublished: "1d",
            username: "sarah",
            photoURL: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
            upvotes: 42,
            message: "Nunc leo purus tristique curabitur libero nec.",
            summary: "and 5 others upvoted your post",
            isNew: true
        },
        {
            datePublished: "3d",
            username: "naval",
            photoURL: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
            upvotes: 42,
            message: "Nunc leo purus tristique curabitur libero nec.",
            summary: "and 5 others upvoted your post",
            isNew: true
        },
        {
            datePublished: "5d",
            username: "mary",
            photoURL: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
            upvotes: 42,
            message: "Nunc leo purus tristique curabitur libero nec.",
            summary: "and 5 others upvoted your post",
            isNew: false
        },
    ]
    const {fetchNotifications} = useBackend()

    const {data: notifications, isLoading, error}=useQuery({
        queryKey: ['notifications', user],
        queryFn:  async (): Promise<BuiltNotification[]> =>{
            const lastDocTimeStamp: Timestamp | undefined = notifications?.[notifications.length - 1]?.timestamp;
            const size = 20;
            console.log("querying notifications", lastDocTimeStamp, size)
            const n = await fetchNotifications(lastDocTimeStamp, size);
            return n
        },
        enabled: !!user,       
    })

    console.log("notifications", notifications, error);

    if(!notifications && isLoading){
        return<DataLoading/>
    }
    if(!notifications){
        return<NoData message='No Notifications'/>
    }
    return (
        <>
            <h4 className='text-xl text-foreground font-bold mb-5'>Notifications</h4>
            <div className='space-y-5'>
               {notifications.map((notification, key) => (
                    <NotificationItem notification={notification as BuiltNotification} key={`notification-${key}`} />
                ))}
            </div>
        </>
    )
}

export default Notifications