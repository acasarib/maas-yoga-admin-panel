import React from 'react'

const Label = (props) => {
  return (
    <label {...props} className={`${props.className} block font-medium text-base sm:text-sm text-gray-700 mb-1`}>{props.children}</label>
  )
}

export default Label