import {HiOutlineHome, HiOutlineUser, HiOutlineUsers, HiOutlineCalendarDays, HiOutlineEnvelope } from 'react-icons/hi2'

export const POST_PAGE = (permalink:string) => `/dapp/p/${permalink}`
export const EXPERT_TICKET_PAGE = (permalink:string) => `/dapp/expert-hub/${permalink}`
export const PROFILE_EDIT_PAGE = `/dapp/my-profile/edit`
export const HOME_PAGE = "/dapp"
export const EXPERT_HUB_PAGE = "/dapp/expert-hub"
export const BOOKINGS_PAGE = "/dapp/bookings"
export const PROFILE_PAGE = (uid:string) => `/dapp/profile/${uid}`
export const MY_PROFILE_PAGE = `/dapp/my-profile`
export const NOTIFICATIONS_PAGE = "/dapp/notifications"
export const CREATE_A_POST_PAGE = "/dapp/p/create"

export const WELCOME_PAGE = "/"
export const FAQ_PAGE = "/dapp/faq"
export const HELP_PAGE = "/dapp/help"
export const PRIVACY_POLICY_PAGE = "/dapp/privacy-policy"
export const ONBOARDING_PAGE = (stage?: | 2 | 3 | 4) =>  "/onboarding" + (stage ? `/${stage}` : "")

export const primaryNavigationLinks = [
    {
        title: "Home",
        icon: HiOutlineHome,
        isActive: false,
        href: HOME_PAGE,
        needsAuth: false
    },
    {
        title: "Expert Hub",
        icon: HiOutlineUsers,
        isActive: false,
        href: EXPERT_HUB_PAGE,
        needsAuth: false
    },
    {
        title: "Bookings",
        icon: HiOutlineCalendarDays,
        isActive: false,
        href: BOOKINGS_PAGE,
        needsAuth: true
    },
    {
        title: "My Profile",
        icon: HiOutlineUser,
        isActive: false,
        href: MY_PROFILE_PAGE,
        needsAuth: true
    },
    {
        title: "Notifications",
        icon: HiOutlineEnvelope,
        isActive: false,
        href: NOTIFICATIONS_PAGE,
        needsAuth: true
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

export const PROTECTED_ROUTES = [
    BOOKINGS_PAGE,
    PROFILE_EDIT_PAGE,
    MY_PROFILE_PAGE,
    CREATE_A_POST_PAGE,
    NOTIFICATIONS_PAGE
]