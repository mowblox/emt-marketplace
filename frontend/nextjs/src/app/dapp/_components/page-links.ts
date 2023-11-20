import {HiOutlineHome, HiOutlineUser, HiOutlineUsers, HiOutlineCalendarDays, HiOutlineEnvelope } from 'react-icons/hi2'

export const CREATE_A_POST_PAGE = "/dapp/p/create"
export const POST_PAGE = (permalink:string) => `/dapp/p/${permalink}`
export const PROFILE_EDIT_PAGE = "/dapp/profile/edit"
export const HOME_PAGE = "/dapp"
export const MARKETPLACE_PAGE = "/dapp/marketplace"
export const BOOKINGS_PAGE = "/dapp/bookings"
export const PROFILE_PAGE = (username:string) => `/dapp/profile/${username}`
export const NOTIFICATIONS_PAGE = "/dapp/notifications"

export const WELCOME_PAGE = "/welcome"
export const FAQ_PAGE = "/faq"
export const HELP_PAGE = "/help"
export const PRIVACY_POLICY_PAGE = "/privacy-policy"

export const primaryNavigationLinks = [
    {
        title: "Home",
        icon: HiOutlineHome,
        isActive: false,
        href: HOME_PAGE
    },
    {
        title: "Marketplace",
        icon: HiOutlineUsers,
        isActive: false,
        href: MARKETPLACE_PAGE
    },
    {
        title: "Bookings",
        icon: HiOutlineCalendarDays,
        isActive: false,
        href: BOOKINGS_PAGE
    },
    {
        title: "My Profile",
        icon: HiOutlineUser,
        isActive: false,
        href: PROFILE_PAGE
    },
    {
        title: "Notifications",
        icon: HiOutlineEnvelope,
        isActive: false,
        href: NOTIFICATIONS_PAGE
    }
]

export const resourcesLinks = [
    {
        title: "Welcome",
        href: WELCOME_PAGE
    },
    {
        title: "FAQ",
        href: FAQ_PAGE
    },
    {
        title: "Help",
        href: HELP_PAGE
    },
    {
        title: "Privacy Policy",
        href: PRIVACY_POLICY_PAGE
    },
]

export const hasBackButtonList = [
    PROFILE_EDIT_PAGE,
    CREATE_A_POST_PAGE
]