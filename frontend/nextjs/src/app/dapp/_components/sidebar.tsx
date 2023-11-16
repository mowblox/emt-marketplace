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

export function Sidebar({ className }: SidebarProps) {
    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        {primaryNavigationLinks.map((link, key)=> (
                            <Button variant="ghost" key={`primary-nav-${key}`} className="w-full justify-start" asChild>
                                <Link href={link.href}>
                                    <link.icon className="mr-2 h-4 w-4 text-accent-2" />
                                    {link.title}
                                </Link>
                            </Button>
                        ))}
                    </div>
                    <Button variant="gradient" className="w-full mt-4">
                        Create a Post
                    </Button>
                </div>
                <div className="px-3 py-2">
                    <div className="bg-accent-shade rounded-md py-4 px-2">
                    <h2 className="mb-3 px-4 text-md font-semibold tracking-tight">
                        Resources
                    </h2>
                    <div className="space-y-0">
                        <Button variant="link" className="w-full text-sm font-normal py-0 h-9 text-muted justify-start" asChild>
                            <Link href="/notifications"> Welcome </Link>
                        </Button>
                        <Button variant="link" className="w-full text-sm font-normal py-0 h-9 text-muted justify-start" asChild>
                            <Link href="/faq"> FAQ </Link>
                        </Button>
                        <Button variant="link" className="w-full text-sm font-normal py-0 h-9 text-muted justify-start" asChild>
                            <Link href="/help"> Help </Link>
                        </Button>
                        <Button variant="link" className="w-full text-sm font-normal py-0 h-9 text-muted justify-start" asChild>
                            <Link href="/privacy-policy"> Privacy Policy </Link>
                        </Button>
                    </div>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}