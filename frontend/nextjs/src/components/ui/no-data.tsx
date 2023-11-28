import React from 'react'
import {CgSpinnerTwo} from 'react-icons/cg'

type Props = {
  message: string;
}

const NoData = ({message="No data loaded"}: Props) => {
  return (
    <div className='w-full h-full flex justify-center items-center'>
      <div className="h4">{message}</div>
    </div>
  )
}

export default NoData;