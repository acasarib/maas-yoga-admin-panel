import React from 'react'

const SimpleCard = ({ className, children, padding = true }) => {
  return (
    <div className={`${className} w-full ${padding ? "p-6 sm:p-6" : ""} bg-white border border-gray-200 rounded-lg shadow`}>
			{children}
    </div>
  )
}

export default SimpleCard