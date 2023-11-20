import React from 'react'
import {CgSpinnerTwo} from 'react-icons/cg'

const PageLoading = () => {
  return (
    <div className='w-screen h-screen flex justify-center items-center'>
      <CgSpinnerTwo className="w-8 h-8 text-accent-3 animate-spin" />
    </div>
  )
}

export default PageLoading