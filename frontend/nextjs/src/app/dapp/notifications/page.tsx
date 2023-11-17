import React from 'react'
import NotificationItem from './_components/notification-item'

const Notifications = () => {
    const dummyNotifications = [
        {
            datePublished: "1d",
            username: "sarah",
            avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
            upvotes: 42,
            message: "Nunc leo purus tristique curabitur libero nec.",
            summary: "and 5 others upvoted your post",
            isNew: true
        },
        {
            datePublished: "3d",
            username: "naval",
            avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
            upvotes: 42,
            message: "Nunc leo purus tristique curabitur libero nec.",
            summary: "and 5 others upvoted your post",
            isNew: true
        },
        {
            datePublished: "5d",
            username: "mary",
            avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
            upvotes: 42,
            message: "Nunc leo purus tristique curabitur libero nec.",
            summary: "and 5 others upvoted your post",
            isNew: false
        },
    ]

    return (
        <>
            <h4 className='text-xl text-foreground font-bold mb-5'>Notifications</h4>
            <div className='space-y-5'>
                {dummyNotifications.map((notification, key) => (
                    <NotificationItem notification={notification} key={`notification-${key}`} />
                ))}
            </div>
        </>
    )
}

export default Notifications