import React from 'react'
import {CgSpinnerTwo} from 'react-icons/cg'
import { HiOutlineCheckCircle } from "react-icons/hi2";

const LoadingMore = () => {
  return (
    <div className='w-full p-4 flex justify-center items-center'>
      <CgSpinnerTwo className="w-5 h-5 text-accent-3 animate-spin mr-2" />
      <div className="text-muted text-sm">
        Loading more...
      </div>
    </div>
  )
}

export const LoadingDone = () => {
  return (
    <div className='w-full p-4 flex justify-center items-center'>
      <HiOutlineCheckCircle className="w-4 h-4 text-muted mr-1" />
      <div className="text-muted text-xs">
        All done.
      </div>
    </div>
  )
}

export default LoadingMore