import React from 'react'
import NotificationItem from './_components/notification-item'

const Notifications = () => {
    const dummyNotifications = [
        {
            datePublished: "1d",
            fromUser: {
                name: "Sarah"
            },
            upvotes: 42,
            message: "Nunc leo purus tristique curabitur libero nec.",
            summary: "and 5 others upvoted your post"
        },
        {
            datePublished: "3d",
            fromUser: {
                name: "Naval"
            },
            upvotes: 42,
            message: "Nunc leo purus tristique curabitur libero nec.",
            summary: "and 5 others upvoted your post"
        },
        {
            datePublished: "5d",
            fromUser: {
                name: "Sarah"
            },
            upvotes: 42,
            message: "Nunc leo purus tristique curabitur libero nec.",
            summary: "and 5 others upvoted your post"
        }
    ]

    return (
        <>
            <h4 className='text-xl text-foreground font-bold mb-5'>Notifications</h4>
            <div>
                {dummyNotifications.map((notification, key) => (
                    <NotificationItem />
                ))}
            </div>
        </>
    )
}

export default Notifications