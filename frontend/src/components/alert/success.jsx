import React from 'react'

const SuccessAlert = ({ title, children }) => {
  return (
    <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
        <div className="font-medium">{title}</div>
        <div>{children}</div>
    </div>
  )
}

export default SuccessAlert