import React from 'react'
import {CgSpinnerTwo} from 'react-icons/cg'

type Props = {
  message: string;
}

const NoData = ({message="No data loaded"}: Props) => {
  return (
    <div className='w-auto h-full flex justify-center items-center  '>
      <div className="h4 text-sm text-muted bg-accent-shade rounded-md p-2 px-6 mt-4">{message}</div>
    </div>
  )
}

export default NoData;