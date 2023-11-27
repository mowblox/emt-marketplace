"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { ONBOARDING_PAGE } from '@/app/(with wallet)/_components/page-links'
import { useUser } from '@/lib/hooks/user'



const FavouriteTopicsForm = () => {
    const router = useRouter()
    const {signUpDataRef} = useUser()
    const [tags, setTags] = useState<string[]>([])

    function handleTags(e : React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        const tag = e.currentTarget.innerText
        if(tags.includes(tag)){
            setTags(old=> old.filter(t=> t!==tag))
        }else{
            setTags(old=> [...old, tag])
        }
    }

    const { toast } = useToast()

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log(tags)
        signUpDataRef.current ? (signUpDataRef.current.tags = tags) : (signUpDataRef.current = {tags})
        router.push(ONBOARDING_PAGE(4))
    }

  return (
    <>

                <form onSubmit={onSubmit} className="space-y-8">


                                    <div className='flex gap-3 flex-wrap w-full'>
                                        {['blockchain', 'UX design','design', 'UX','programming', 'dance'].map((tag) => (
                                            <Button onClick={handleTags} key={`skills-tags-${tag}`} className='rounded-full text-sm ' size="sm" variant={tags.includes(tag)? "default": "outline"}>
                                                {tag}
                                                <Plus className='w-4 h-4 text-muted ml-2' />
                                            </Button>)
                                        )}
                                    </div>

                    <div className="flex justify-end w-full">
                        <Button onClick={()=>router.back()} variant='outline' className='w-[160px] mr-3'>Back</Button>
                        <Button type="submit" variant='default' className='w-[160px] '>Next</Button>
                    </div>
                </form>
    </>
  )
}

export default FavouriteTopicsForm