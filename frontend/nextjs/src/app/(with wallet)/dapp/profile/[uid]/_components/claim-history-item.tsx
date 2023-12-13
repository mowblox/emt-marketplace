import { ClaimHistoryItem } from '@/lib/types'
import { formatDistance } from 'date-fns'
import React from 'react'
import { HiOutlineFire, HiOutlineTicket } from 'react-icons/hi2'

type Props = {
    data: ClaimHistoryItem
}
const ClaimHistoryItem = ({data}: Props) => {
  const dateClaimed = formatDistance(data.timestamp!.toDate(), new Date(), {
    addSuffix: true,
  });
  return (
    <div className="flex pb-7 items-center justify-between border-b">
                  <div className="flex items-center">
                    <div className="flex items-center text-sm">
                      {data.type=="ment" ? <HiOutlineFire className="w-4 h-4 ml-1 text-alt" /> : <HiOutlineTicket className="w-4 h-4 ml-1 text-alt" />}
                      <div className="ml-1 flex items-center text-foreground">
                        {data.amount}
                        <span className="ml-1 text-muted uppercase">
                          {data.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-muted text-xs">{dateClaimed}</div>
                </div>
  )
}

export default ClaimHistoryItem