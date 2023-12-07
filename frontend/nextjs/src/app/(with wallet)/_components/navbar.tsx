"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
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
  CREATE_A_POST_PAGE,
  primaryNavigationLinks,
  resourcesLinks,
  hasBackButtonList,
  HOME_PAGE,
  ONBOARDING_PAGE,
} from "./page-links";
import { SignInButton } from "./signInButton";
import { useUser } from "@/lib/hooks/user";


//TODO:  @od41 fix mobile menu layout
//TODO: @od41 display an 'x' button when the mobile menu is active

export const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const { user } = useUser();
  

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
                    <Popover>
                      <PopoverTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="mobile-menu"
                          className="">
                          <HiBars3 className="h-6 w-6" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[90vw] bg-accent-shade right-[calc(50%-160px)] ">
                        <div className="space-y-4">
                          <div className="px-3 py-2">
                            <div className="space-y-1">
                              {primaryNavigationLinks.map((link) => (
                                <Button
                                  variant="ghost"
                                  key={`primary-nav-${link}`}
                                  className="w-full justify-start"
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
                            {user ? (
                              //TODO: @od41 check placement of button
                              <SignInButton label="Sign Out" />
                            ) : (
                              <SignInButton label="Sign in" />
                            )}
                          </div>

                          <div className="bg-accent-shade rounded-md py-4 px-2">
                            <h2 className="mb-3 px-4 text-md font-semibold tracking-tight">
                              Resources
                            </h2>
                            <div className="space-y-0">
                              {resourcesLinks.map((link, key) => (
                                <Button
                                  variant="link"
                                  key={`resources-nav-${key}`}
                                  className="w-full text-sm font-normal py-0 h-9 text-muted justify-start"
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
