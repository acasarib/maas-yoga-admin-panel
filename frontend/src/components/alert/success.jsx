import React from 'react'

const SuccessAlert = ({ title, children }) => {
  return (
    <div class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
        <div class="font-medium">{title}</div>
        <div>{children}</div>
    </div>
  )
}

export default SuccessAlert