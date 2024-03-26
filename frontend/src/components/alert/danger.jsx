import React from 'react'

const DangerAlert = ({ children, title }) => {
  return (
    <div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
        <div class="font-medium">{title}</div>
        <div>{children}</div>
    </div>
  )
}

export default DangerAlert