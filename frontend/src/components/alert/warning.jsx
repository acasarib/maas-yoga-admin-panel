import React from 'react'

const WarningAlert = ({ title, children }) => {
  return (
    <div class="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 " role="alert">
        <div class="font-medium">{title}</div>
        <div>{children}</div>
    </div>
  )
}

export default WarningAlert