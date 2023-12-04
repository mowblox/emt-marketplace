import React from 'react'
import { Input } from "@/components/ui/input"
import { cn } from '@/lib/utils'
import { HiMagnifyingGlass } from "react-icons/hi2";

interface Props extends React.HTMLAttributes<HTMLDivElement> {}
export function Search({className, placeholder="Search"}: Props) {
  return (
    <>
      <Input
        type="search"
        placeholder={placeholder}
        className={cn("rounded-full bg-accent-shade border-alt-stoke", className)}
      />
    </>
  )
}