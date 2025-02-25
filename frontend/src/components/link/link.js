import React from 'react'
import { Link as ReactLink } from 'react-router-dom'

const Link = ({ children, className, ...rest }) => {
  return (
    <ReactLink {...rest} className={`font-medium text-blue-600 dark:text-blue-500 hover:underline ${className}`}>{children}</ReactLink>
  )
}

export default Link