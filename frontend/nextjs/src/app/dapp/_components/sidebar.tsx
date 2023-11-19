"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {HiOutlineHome, HiOutlineUser, HiOutlineUsers, HiOutlineCalendarDays, HiOutlineEnvelope, HiChevronLeft} from 'react-icons/hi2'
import { HOME_PAGE, MARKETPLACE_PAGE, BOOKINGS_PAGE, PROFILE_PAGE, NOTIFICATIONS_PAGE, PROFILE_EDIT_PAGE, CREATE_A_POST_PAGE, WELCOME_PAGE, FAQ_PAGE, HELP_PAGE, PRIVACY_POLICY_PAGE } from "./page-links"


interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    
}

const primaryNavigationLinks = [
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

const resourcesLinks = [
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

const hasBackButtonList = [
    PROFILE_EDIT_PAGE,
    CREATE_A_POST_PAGE
]


export function Sidebar({ className }: SidebarProps) {
    const [hasBackButton, setHasBackButton] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
      if(hasBackButtonList.includes(pathname!) ) {
        setHasBackButton(true)
      } else {
        setHasBackButton(false)
      }
    }, [pathname])
    
    return (
        <div className={cn("pb-12", className)}>
            {hasBackButton && <div className="space-y-4 py-4 px-3">
                <Button variant="ghost" className="w-full mt-4" asChild>
                    <Link href={HOME_PAGE}>
                        <HiChevronLeft className="mr-2 -ml-4 h-4 w-4 text-accent-2" /> 
                        Go Back
                    </Link>
                </Button></div>}
            {!hasBackButton && <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        {primaryNavigationLinks.map((link, key)=> (
                            <Button variant="ghost" key={`primary-nav-${key}`} className="w-full justify-start" asChild>
                                <Link href={typeof(link.href)==="function" ? link.href("naval") : link.href}>
                                    <link.icon className="mr-2 h-4 w-4 text-accent-2" />
                                    {link.title}
                                </Link>
                            </Button>
                        ))}
                    </div>
                    <Button variant="gradient" className="w-full mt-4" asChild>
                        <Link href={CREATE_A_POST_PAGE}>Create a Post</Link>
                    </Button>
                </div>
                <div className="px-3 py-2">
                    <div className="bg-accent-shade rounded-md py-4 px-2">
                    <h2 className="mb-3 px-4 text-md font-semibold tracking-tight">
                        Resources
                    </h2>
                    <div className="space-y-0">
                            {resourcesLinks.map((link, key) => (
                                <Button variant="link" key={`primary-nav-${key}`} className="w-full text-sm font-normal py-0 h-9 text-muted justify-start" asChild>
                                    <Link href={link.href}>
                                        {link.title}
                                    </Link>
                                </Button>
                            ))}
                    </div>
                    </div>
                    
                </div>
            </div>}
        </div>
    )
}