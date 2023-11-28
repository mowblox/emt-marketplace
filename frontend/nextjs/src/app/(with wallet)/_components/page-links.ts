import {HiOutlineHome, HiOutlineUser, HiOutlineUsers, HiOutlineCalendarDays, HiOutlineEnvelope } from 'react-icons/hi2'

export const CREATE_A_POST_PAGE = "/dapp/p/create"
export const POST_PAGE = (permalink:string) => `/dapp/p/${permalink}`
export const PROFILE_EDIT_PAGE = (uid:string) => `/dapp/profile/${uid}/edit`
export const HOME_PAGE = "/dapp"
export const EXPERT_HUB_PAGE = "/dapp/expert-hub"
export const BOOKINGS_PAGE = "/dapp/bookings"
export const PROFILE_PAGE = (uid:string) => `/dapp/profile/${uid}`
export const NOTIFICATIONS_PAGE = "/dapp/notifications"

export const WELCOME_PAGE = "/welcome"
export const FAQ_PAGE = "/faq"
export const HELP_PAGE = "/help"
export const PRIVACY_POLICY_PAGE = "/privacy-policy"
export const ONBOARDING_PAGE = (stage?: | 2 | 3 | 4) =>  "/onboarding" + (stage ? `/${stage}` : "")

export const primaryNavigationLinks = [
    {
        title: "Home",
        icon: HiOutlineHome,
        isActive: false,
        href: HOME_PAGE
    },
    {
        title: "Expert Hub",
        icon: HiOutlineUsers,
        isActive: false,
        href: EXPERT_HUB_PAGE
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