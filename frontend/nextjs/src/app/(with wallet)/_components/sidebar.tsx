"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { HiChevronLeft} from 'react-icons/hi2'
import { HOME_PAGE, CREATE_A_POST_PAGE, primaryNavigationLinks, resourcesLinks, hasBackButtonList,  } from "./page-links"
import { useUser } from "@/lib/hooks/user"
import { useConnectModal } from "@rainbow-me/rainbowkit"


interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    
}

export function Sidebar({ className }: SidebarProps) {
    const [hasBackButton, setHasBackButton] = useState(false);
    const { openConnectModal } = useConnectModal();
    const { user} = useUser();
    const pathname = usePathname();

    useEffect(() => {
      if(hasBackButtonList.includes(pathname!) ) {
        setHasBackButton(true)
      } else {
        setHasBackButton(false)
      }
    }, [pathname])

    const isPageActive = (path: string, substring: any, uid: any, title: string): boolean => {
       
        if (pathname.endsWith(HOME_PAGE) && title === "Home") {
            return pathname.endsWith(path);
        } 
        else if (path != HOME_PAGE && title != 'Home'){
            return path.includes(typeof(substring)==="function" ? substring(uid!) : substring)
        }
        return false;
    }
    
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
                            link.needsAuth && !user?.uid ? null :
                            <Button variant="ghost" key={`primary-nav-${key}`} className="w-full justify-start font-normal" asChild>
                                <Link href={typeof(link.href)==="function" ? link.href(user?.uid!) : link.href} className={`${ isPageActive(pathname, link.href, user?.uid, link.title) ? "text-accent-3 font-semibold": "text-muted"}`}>
                                    <link.icon className={`mr-2 h-4 w-4  ${isPageActive(pathname, link.href, user?.uid, link.title) ? "text-accent-3": "text-accent-2"}`} />
                                    {link.title}
                                </Link>
                            </Button>
                        ))}
                    </div>
                    <Button onClick={user? undefined : (e) => {e.stopPropagation(); openConnectModal?.()}} variant="gradient" className="w-full mt-4" asChild>
                        <Link href={user ? CREATE_A_POST_PAGE : ''}>Create a Post</Link>
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
                                    <Link href={link.href} className={`${ isPageActive(pathname, link.href, user?.uid, link.title) ? "text-accent-3 font-semibold": "text-muted"}`}>
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