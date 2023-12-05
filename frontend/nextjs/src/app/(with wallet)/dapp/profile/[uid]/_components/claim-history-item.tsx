import React from 'react'
import { HiOutlineFire, HiOutlineTicket } from 'react-icons/hi2'

type Props = {
    claimItem: any
}
const ClaimHistoryItem = ({claimItem}: Props) => {
  return (
    <div className="flex pb-7 items-center justify-between border-b">
                  <div className="flex items-center">
                    <div className="flex items-center text-sm">
                      {claimItem.type=="ment" ? <HiOutlineFire className="w-4 h-4 ml-1 text-alt" /> : <HiOutlineTicket className="w-4 h-4 ml-1 text-alt" />}
                      <div className="ml-1 flex items-center text-foreground">
                        {claimItem.amount}
                        <span className="ml-1 text-muted uppercase">
                          {claimItem.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-muted text-xs">{claimItem.dateClaimed}</div>
                </div>
  )
}

export default ClaimHistoryItem