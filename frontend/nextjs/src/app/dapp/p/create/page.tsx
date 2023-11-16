import React from 'react'
import { HiCheckBadge, HiOutlineHandThumbUp, HiOutlineHandThumbDown, HiOutlineShare, HiOutlineFire } from 'react-icons/hi2'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RightSidebar } from '../../_components/right-sidebar'
import CreatePostForm from './_components/create-post-form'

const CreatePost = () => {

    return (
        <div className="grid grid-cols-1 md:grid-cols-6 col-span-4">
            <div className="h-full px-4 py-6 lg:px-6 col-span-1 md:col-span-4 md:border-x">
                <ScrollArea className="h-[90vh] w-full">
                    <h4 className='text-xl text-foreground font-bold mb-5'>New Post</h4>
                    <CreatePostForm />
                </ScrollArea>
            </div>
            <RightSidebar className="hidden md:block min-h-[94vh] col-span-2 lg:col-span-2" >
                {/* leave empty */}
            </RightSidebar>
        </div>
    )
}

export default CreatePost