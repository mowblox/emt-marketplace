"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Search } from '@/components/ui/forms/search';
import { HiMagnifyingGlass, HiBars3, HiOutlinePencilSquare } from 'react-icons/hi2'
import { X } from "lucide-react"
import Link from 'next/link'
import { CREATE_A_POST_PAGE, primaryNavigationLinks, resourcesLinks, hasBackButtonList, } from "./page-links"
import { SignInButton } from './signInButton';

export const Navbar = () => {
    const [showSearch, setShowSearch] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    return (
        <>
            <header>
                <div className=" flex-col md:flex">
                    <div className="container flex items-center justify-between py-4 md:h-16">
                        <h2 className="text-lg font-semibold text-accent-3">MEMM!</h2>
                        <div className="ml-auto flex items-center space-x-2 sm:justify-end">
                            <div className='hidden md:block'>
                                <Search />
                            </div>
                            {showSearch && <Search />}
                            {showSearch ? <>
                                <Button variant="ghost" aria-label='search' size="icon" onClick={() => setShowSearch(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </>

                                : <>
                                    <Button variant="ghost" aria-label='search' className='block md:hidden' size="icon" onClick={() => setShowSearch(true)}>
                                        <HiMagnifyingGlass className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" aria-label='create a post' size="icon">
                                        <HiOutlinePencilSquare className="h-4 w-4" />
                                    </Button>
                                    <div className="hidden md:block">
                                        <SignInButton/>
                                    </div>
                                    <div className="block md:hidden">
                                        <Popover>
                                            <PopoverTrigger>
                                                <Button variant="ghost" size="icon" aria-label='mobile-menu' className=''>
                                                    <HiBars3 className="h-6 w-6" />
                                                </Button>

                                            </PopoverTrigger>
                                            <PopoverContent className='w-[90vw] bg-accent-shade right-[calc(50%-160px)] '>
                                                <div className="space-y-4">
                                                    <div className="px-3 py-2">
                                                        <div className="space-y-1">
                                                            {primaryNavigationLinks.map((link, key) => (
                                                                <Button variant="ghost" key={`primary-nav-${key}`} className="w-full justify-start" asChild>
                                                                    <Link href={typeof (link.href) === "function" ? link.href("naval") : link.href}>
                                                                        <link.icon className="mr-2 h-4 w-4 text-accent-2" />
                                                                        {link.title}
                                                                    </Link>
                                                                </Button>
                                                            ))}
                                                        </div>
                                                        {isLoggedIn ? <Button variant="default" className="w-full mt-4" asChild>
                                                            Logout
                                                        </Button> : <ConnectButton
                                                            label="Sign in"
                                                            accountStatus={{
                                                                smallScreen: "avatar",
                                                                largeScreen: "address"
                                                            }}
                                                            chainStatus="none"
                                                            showBalance={false}
                                                        />}
                                                    </div>

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
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}