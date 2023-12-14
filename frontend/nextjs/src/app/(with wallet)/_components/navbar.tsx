"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "@/components/ui/popover";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Search } from "@/components/ui/forms/search";
import {
  HiMagnifyingGlass,
  HiBars3,
  HiOutlinePencilSquare,
} from "react-icons/hi2";
import { X } from "lucide-react";
import Link from "next/link";
import {
  primaryNavigationLinks,
  resourcesLinks,
  HOME_PAGE,
} from "./page-links";
import { SignInButton } from "./signInButton";
import { useUser } from "@/lib/hooks/user";
import { Separator } from "@/components/ui/separator";

export const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const { user } = useUser();
  const [mobileMenu, setMobileMenu] = useState(false)
  

  return (
    <>
      <header>
        <div className=" flex-col md:flex">
          <div className="container flex items-center justify-between py-4 md:h-16">
            <Link href={HOME_PAGE}>
            <h2 className="text-lg font-semibold text-accent-3">MEMM!</h2>
            </Link>
            <div className="ml-auto flex items-center space-x-2 sm:justify-end">
              <div className="hidden md:block">
                <Search className="w-[240px]" />
              </div>
              {showSearch && <Search />}
              {showSearch ? (
                <>
                  <Button
                    variant="ghost"
                    aria-label="search"
                    size="icon"
                    onClick={() => setShowSearch(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    aria-label="search"
                    className="block md:hidden"
                    size="icon"
                    onClick={() => setShowSearch(true)}>
                    <HiMagnifyingGlass className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label="create a post"
                    size="icon">
                    <HiOutlinePencilSquare className="h-4 w-4" />
                  </Button>
                  <div className="hidden md:block">
                    <SignInButton />
                  </div>
                  <div className="block lg:hidden">
                    <Popover open={mobileMenu}>
                      <PopoverTrigger>
                          {mobileMenu ? <Button
                            variant="ghost"
                            size="icon"
                            aria-label="close-mobile-menu"
                            onClick={() => setMobileMenu(false)}
                            className="" >
                            <X className="h-5 w-6" />
                          </Button>
                            : <Button
                              variant="ghost"
                              size="icon"
                              aria-label="mobile-menu"
                              onClick={() => setMobileMenu(true)}
                              className="">
                              <HiBars3 className="h-6 w-6" />
                            </Button>
                          }
                      </PopoverTrigger>
                      <PopoverContent onInteractOutside={() => setMobileMenu(false)} sideOffset={12} alignOffset={0} align="end" className="w-[80vw] md:w-[240px] bg-accent-shade right-[calc(50%-160px)] top-12">
                        <div className="space-y-2">
                          <div className="w-full">
                            {user ? (
                              <SignInButton label="Sign Out" style={{width: "100%"}}/>
                            ) : (
                              <SignInButton label="Sign In" style={{width: "100%"}} />
                            )}
                          </div>
                          <div className=" py-2">
                            <div className="space-y-1">
                              {primaryNavigationLinks.map((link) => (
                                link.needsAuth && !user?.uid ? null : <Button
                                  variant="ghost"
                                  key={`primary-nav-${link}`}
                                  className="w-full justify-start px-0"
                                  asChild>
                                  <Link
                                    href={
                                      typeof link.href === "function"
                                        ? link.href(user?.uid!)
                                        : link.href
                                    }>
                                    <link.icon className="mr-2 h-4 w-4 text-accent-2" />
                                    {link.title}
                                  </Link>
                                </Button>
                              ))}
                            </div>
                          </div>

                          <Separator />

                          <div className="bg-accent-shade rounded-md pt-2">
                            <div className="space-y-0">
                              {resourcesLinks.map((link, key) => (
                                <Button
                                  variant="link"
                                  key={`resources-nav-${key}`}
                                  className="w-full text-sm font-normal py-0 h-9 text-muted justify-start px-0"
                                  asChild>
                                  <Link href={link.href}>{link.title}</Link>
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
