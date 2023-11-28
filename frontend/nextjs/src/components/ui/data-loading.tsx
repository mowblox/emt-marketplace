import React from 'react'
import {CgSpinnerTwo} from 'react-icons/cg'

const DataLoading = () => {
  return (
    <div className='w-full h-full flex justify-center items-center'>
      <CgSpinnerTwo className="w-8 h-8 text-accent-3 animate-spin" />
    </div>
  )
}

export default DataLoading