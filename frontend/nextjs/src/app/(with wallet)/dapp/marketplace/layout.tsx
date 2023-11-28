import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RightSidebar } from '../../_components/right-sidebar'

type Props = {
    children: React.ReactNode
}

const MarketplaceLayout = ({children}: Props) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-6 col-span-4">
            <div className="h-full px-4 py-6 lg:px-6 col-span-1 md:col-span-4 md:border-x">
                <ScrollArea className="h-[90vh] w-full">
                    {children}
                </ScrollArea>
            </div>
            <RightSidebar className="hidden md:block min-h-[94vh] col-span-2 lg:col-span-2" >
                {/* leave empty */}
            </RightSidebar>
        </div>
    )
}

export default MarketplaceLayout