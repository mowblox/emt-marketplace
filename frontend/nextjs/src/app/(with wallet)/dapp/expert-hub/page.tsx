import { Button } from '@/components/ui/button'
import { Search } from '@/components/ui/forms/search'
import React from 'react'
import { HiMiniAdjustmentsVertical } from 'react-icons/hi2'

const ExpertHub = () => {

    return (
        <div className="col-span-4">
            <div className="flex justify-between items-center w-full mb-12">
                <Search />
                <Button><HiMiniAdjustmentsVertical />Filter</Button>
            </div>
        </div>
    )
}

export default ExpertHub