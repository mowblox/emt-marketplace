import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {HiOutlineHome, HiOutlineUser, HiOutlineEnvelope} from 'react-icons/hi2'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    
}

const primaryNavigationLinks = [
    {
        title: "Home",
        icon: HiOutlineHome,
        isActive: false,
        href: "/dapp"
    },
    {
        title: "My Profile",
        icon: HiOutlineUser,
        isActive: false,
        href: "/my-profile"
    },
    {
        title: "Notifications",
        icon: HiOutlineEnvelope,
        isActive: false,
        href: "/notifications"
    }
]

export function RightSidebar({ className, children }: SidebarProps) {
    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    {children}
                </div>
            </div>
        </div>
    )
}